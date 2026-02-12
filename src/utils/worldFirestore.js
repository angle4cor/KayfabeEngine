/**
 * Kayfabe Engine – Firestore helpers for world data.
 * Structure: worlds/{worldId}, worlds/{worldId}/federations/{fedId}, wrestlers, shows, etc.
 */

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { defaultWorldMeta, defaultFederation } from '../data/defaultWorld';

export function getWorldRef(worldId) {
  return doc(db, 'worlds', worldId);
}

export function getFederationsRef(worldId) {
  return collection(db, 'worlds', worldId, 'federations');
}

export function getWrestlersRef(worldId) {
  return collection(db, 'worlds', worldId, 'wrestlers');
}

export function getShowsRef(worldId) {
  return collection(db, 'worlds', worldId, 'shows');
}

export function getStorylinesRef(worldId) {
  return collection(db, 'worlds', worldId, 'storylines');
}

export function getNewsRef(worldId) {
  return collection(db, 'worlds', worldId, 'news');
}

/**
 * Load world doc and all subcollections once. Returns merged state for WorldContext.
 * @param {string} worldId
 * @returns {Promise<{ meta, federations, wrestlers, shows, storylines, news }>}
 */
export async function loadWorld(worldId) {
  const worldSnap = await getDoc(getWorldRef(worldId));
  if (!worldSnap.exists()) {
    return null;
  }
  const worldData = worldSnap.data();
  const meta = {
    worldId,
    worldName: worldData.name || worldId,
    currentDate: worldData.settings?.currentDate || worldData.currentDate || defaultWorldMeta.currentDate,
  };

  const [fedSnap, wrestlerSnap, showSnap, storySnap, newsSnap] = await Promise.all([
    getDocs(getFederationsRef(worldId)),
    getDocs(getWrestlersRef(worldId)),
    getDocs(getShowsRef(worldId)),
    getDocs(getStorylinesRef(worldId)),
    getDocs(getNewsRef(worldId)),
  ]);

  const federations = fedSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const wrestlers = {};
  wrestlerSnap.docs.forEach((d) => {
    wrestlers[d.id] = { id: d.id, ...d.data() };
  });
  const shows = showSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const storylines = storySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const news = newsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return {
    meta,
    federations,
    wrestlers,
    shows,
    roleplays: [],
    storylines,
    news,
    player: { role: null, wrestlerIds: [], bookerFedId: null },
  };
}

/**
 * Subscribe to world doc and key subcollections; call onUpdate(mergedState) on changes.
 * @param {string} worldId
 * @param {(state: Object) => void} onUpdate
 * @returns {() => void} unsubscribe
 */
export function subscribeWorld(worldId, onUpdate) {
  if (!worldId) return () => {};

  const unsubWorld = onSnapshot(getWorldRef(worldId), (worldSnap) => {
    if (!worldSnap.exists()) {
      onUpdate(null);
      return;
    }
    const worldData = worldSnap.data();
    const meta = {
      worldId,
      worldName: worldData.name || worldId,
      currentDate: worldData.settings?.currentDate || worldData.currentDate || defaultWorldMeta.currentDate,
    };

    Promise.all([
      getDocs(getFederationsRef(worldId)),
      getDocs(getWrestlersRef(worldId)),
      getDocs(getShowsRef(worldId)),
      getDocs(getStorylinesRef(worldId)),
      getDocs(getNewsRef(worldId)),
    ]).then(([fedSnap, wrestlerSnap, showSnap, storySnap, newsSnap]) => {
      const federations = fedSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const wrestlers = {};
      wrestlerSnap.docs.forEach((d) => {
        wrestlers[d.id] = { id: d.id, ...d.data() };
      });
      const shows = showSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const storylines = storySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const news = newsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onUpdate({
        meta,
        federations,
        wrestlers,
        shows,
        roleplays: [],
        storylines,
        news,
        player: { role: null, wrestlerIds: [], bookerFedId: null },
      });
    });
  });

  return () => unsubWorld();
}

/**
 * Create a new world in Firestore with default federation. Returns worldId.
 * @param {{ name: string, createdBy?: string }} opts
 * @returns {Promise<string>} worldId
 */
export async function createWorld(opts = {}) {
  const name = opts.name || 'New World';
  const worldId = `world_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const worldRef = getWorldRef(worldId);
  await setDoc(worldRef, {
    id: worldId,
    name,
    description: '',
    createdBy: opts.createdBy || null,
    isPublic: false,
    settings: {
      startDate: defaultWorldMeta.currentDate,
      currentDate: { ...defaultWorldMeta.currentDate },
      isPublic: false,
    },
    createdAt: serverTimestamp(),
  });

  const fedId = `fed_${worldId}`;
  const fedRef = doc(db, 'worlds', worldId, 'federations', fedId);
  await setDoc(fedRef, {
    ...defaultFederation,
    id: fedId,
    worldId,
    name: defaultFederation.name,
    roster: [],
    championships: [],
  });

  return worldId;
}

/**
 * Update world document (e.g. currentDate after advanceDay).
 * @param {string} worldId
 * @param {Object} updates - e.g. { currentDate } (merged into settings)
 */
export async function updateWorld(worldId, updates) {
  const worldRef = getWorldRef(worldId);
  const snap = await getDoc(worldRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const next = { ...data };
  next.settings = { ...(data.settings || {}) };
  if (updates.currentDate) next.settings.currentDate = updates.currentDate;
  await setDoc(worldRef, next, { merge: true });
}

const worldsCol = () => collection(db, 'worlds');

/**
 * List worlds (by creator or public). Returns [{ id, name, createdBy, isPublic }].
 * @param {{ createdBy?: string, isPublic?: boolean, limitCount?: number }} opts
 */
export async function listWorlds(opts = {}) {
  const limitCount = opts.limitCount ?? 50;
  let q = query(worldsCol(), limit(limitCount));
  if (opts.createdBy) {
    q = query(worldsCol(), where('createdBy', '==', opts.createdBy), limit(limitCount));
  } else if (opts.isPublic === true) {
    q = query(worldsCol(), where('isPublic', '==', true), limit(limitCount));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

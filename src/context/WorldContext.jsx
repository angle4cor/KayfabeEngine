/**
 * Kayfabe Engine – World Context
 * State: meta, federations, wrestlers, shows, roleplays, storylines, news, player.
 * Persistence: localStorage (ke_world_state) when no worldId; Firestore when worldId set.
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { validateGameStateDate } from '../contracts/schemas';
import { advanceDay as simAdvanceDay, advanceWeek as simAdvanceWeek } from '../engine/worldSimulator';
import {
  loadWorld as firestoreLoadWorld,
  subscribeWorld,
  createWorld as firestoreCreateWorld,
  updateWorld as firestoreUpdateWorld,
} from '../utils/worldFirestore';

const WorldContext = createContext(null);
const STORAGE_KEY = 'ke_world_state';

const defaultMeta = {
  worldId: null,
  worldName: null,
  currentDate: { year: 2025, month: 1, week: 1, day: 1 },
};

const defaultState = {
  meta: defaultMeta,
  federations: [],
  wrestlers: {},
  shows: [],
  roleplays: [],
  storylines: [],
  news: [],
  player: { role: null, wrestlerIds: [], bookerFedId: null },
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    if (parsed.meta?.currentDate && validateGameStateDate(parsed.meta.currentDate).success) {
      return { ...defaultState, ...parsed };
    }
  } catch {}
  return defaultState;
}

export function WorldProvider({ children }) {
  const [state, setState] = useState(loadFromStorage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistLocal = useCallback((nextState) => {
    try {
      if (!nextState.meta?.worldId || String(nextState.meta.worldId).startsWith('local_')) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      }
    } catch {}
  }, []);

  const setWorld = useCallback((worldId, worldName) => {
    setState((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        worldId,
        worldName: worldName ?? prev.meta.worldName,
      },
    }));
  }, []);

  const applySimulatorUpdate = useCallback((updates) => {
    setState((prev) => {
      const next = { ...prev };
      if (updates.currentDate) {
        next.meta = { ...prev.meta, currentDate: updates.currentDate };
      }
      return next;
    });
  }, []);

  const advanceDay = useCallback(() => {
    setState((prev) => {
      const updates = simAdvanceDay(prev);
      const next = { ...prev, meta: { ...prev.meta, currentDate: updates.currentDate } };
      if (prev.meta?.worldId && !String(prev.meta.worldId).startsWith('local_')) {
        firestoreUpdateWorld(prev.meta.worldId, { currentDate: updates.currentDate }).catch(() => {});
      }
      persistLocal(next);
      return next;
    });
  }, [persistLocal]);

  const advanceWeek = useCallback(() => {
    setState((prev) => {
      const updates = simAdvanceWeek(prev);
      const next = { ...prev, meta: { ...prev.meta, currentDate: updates.currentDate } };
      if (prev.meta?.worldId && !String(prev.meta.worldId).startsWith('local_')) {
        firestoreUpdateWorld(prev.meta.worldId, { currentDate: updates.currentDate }).catch(() => {});
      }
      persistLocal(next);
      return next;
    });
  }, [persistLocal]);

  const setPlayer = useCallback((player) => {
    setState((prev) => ({ ...prev, player: { ...prev.player, ...player } }));
  }, []);

  const loadWorld = useCallback(async (worldId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await firestoreLoadWorld(worldId);
      if (data) {
        setState(data);
        persistLocal(data);
      } else {
        setError(new Error('World not found'));
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [persistLocal]);

  const createWorld = useCallback(
    async (name, options = {}) => {
      setLoading(true);
      setError(null);
      try {
        const worldId = await firestoreCreateWorld({
          name: name || 'New World',
          createdBy: options.createdBy ?? null,
        });
        await loadWorld(worldId);
        return worldId;
      } catch (err) {
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [loadWorld]
  );

  const createLocalWorld = useCallback((name) => {
    const worldId = `local_${Date.now()}`;
    const worldName = name || 'Offline World';
    setState((prev) => ({
      ...defaultState,
      meta: {
        worldId,
        worldName,
        currentDate: { year: 2025, month: 1, week: 1, day: 1 },
      },
    }));
    persistLocal({
      ...defaultState,
      meta: { worldId, worldName, currentDate: { year: 2025, month: 1, week: 1, day: 1 } },
    });
    return worldId;
  }, [persistLocal]);

  useEffect(() => {
    persistLocal(state);
  }, [state, persistLocal]);

  useEffect(() => {
    const worldId = state.meta?.worldId;
    if (!worldId || String(worldId).startsWith('local_')) return undefined;
    const unsub = subscribeWorld(worldId, (data) => {
      if (data) setState((prev) => ({ ...prev, ...data }));
    });
    return unsub;
  }, [state.meta?.worldId]);

  const value = useMemo(
    () => ({
      ...state,
      loading,
      error,
      setWorld,
      advanceDay,
      advanceWeek,
      setPlayer,
      loadWorld,
      createWorld,
      createLocalWorld,
      getFederation: (id) => state.federations.find((f) => f.id === id),
      getWrestler: (id) => state.wrestlers[id] || null,
      getShow: (id) => state.shows.find((s) => s.id === id),
    }),
    [
      state,
      loading,
      error,
      setWorld,
      advanceDay,
      advanceWeek,
      setPlayer,
      loadWorld,
      createWorld,
      createLocalWorld,
    ]
  );

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}

export function useWorld() {
  const ctx = useContext(WorldContext);
  if (!ctx) throw new Error('useWorld must be used within WorldProvider');
  return ctx;
}

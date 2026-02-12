/**
 * Kayfabe Engine – World Context
 * State shape: meta, federations, wrestlers, shows, roleplays, storylines, news, player.
 * Dual persistence: localStorage (ke_world_state) + Firestore (worlds/{worldId}/...).
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { validateGameStateDate } from '../contracts/schemas';

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

  const setWorld = useCallback((worldId, worldName) => {
    setState((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        worldId,
        worldName,
      },
    }));
  }, []);

  const advanceDay = useCallback(() => {
    setState((prev) => {
      const d = { ...prev.meta.currentDate };
      d.day = (d.day || 1) + 1;
      if (d.day > 28) {
        d.day = 1;
        d.week = (d.week || 1) + 1;
        if (d.week > 4) {
          d.week = 1;
          d.month += 1;
          if (d.month > 12) {
            d.month = 1;
            d.year += 1;
          }
        }
      }
      return {
        ...prev,
        meta: { ...prev.meta, currentDate: d },
      };
    });
  }, []);

  const advanceWeek = useCallback(() => {
    setState((prev) => {
      const d = { ...prev.meta.currentDate };
      d.week = (d.week || 1) + 1;
      if (d.week > 4) {
        d.week = 1;
        d.month += 1;
        if (d.month > 12) {
          d.month = 1;
          d.year += 1;
        }
      }
      return {
        ...prev,
        meta: { ...prev.meta, currentDate: d },
      };
    });
  }, []);

  const setPlayer = useCallback((player) => {
    setState((prev) => ({ ...prev, player: { ...prev.player, ...player } }));
  }, []);

  const persist = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  React.useEffect(() => {
    persist();
  }, [state, persist]);

  const value = useMemo(
    () => ({
      ...state,
      setWorld,
      advanceDay,
      advanceWeek,
      setPlayer,
      getFederation: (id) => state.federations.find((f) => f.id === id),
      getWrestler: (id) => state.wrestlers[id] || null,
      getShow: (id) => state.shows.find((s) => s.id === id),
    }),
    [state, setWorld, advanceDay, advanceWeek, setPlayer]
  );

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}

export function useWorld() {
  const ctx = useContext(WorldContext);
  if (!ctx) throw new Error('useWorld must be used within WorldProvider');
  return ctx;
}

/**
 * Kayfabe Engine – World Simulator (headless)
 * advanceDay / advanceWeek: contracts, injuries, momentum. Phase 2/3 will implement.
 */

/**
 * Advance world state by one day. Pure function; returns new state slice for date/injuries.
 * @param {Object} state - Current world state
 * @param {Object} [opts] - { seed for RNG }
 * @returns {Object} - Updates to apply (currentDate, injury updates, etc.)
 */
export function advanceDay(state, opts = {}) {
  const date = state.meta?.currentDate || { year: 2025, month: 1, week: 1, day: 1 };
  const d = { ...date };
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
  return { currentDate: d };
}

/**
 * Advance world state by one week.
 */
export function advanceWeek(state, opts = {}) {
  const date = state.meta?.currentDate || { year: 2025, month: 1, week: 1 };
  const d = { ...date };
  d.week = (d.week || 1) + 1;
  if (d.week > 4) {
    d.week = 1;
    d.month += 1;
    if (d.month > 12) {
      d.month = 1;
      d.year += 1;
    }
  }
  return { currentDate: d };
}

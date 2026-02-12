/**
 * Kayfabe Engine – System Logger
 * Centralized utility for simulation, booking, RP, match, and UI events.
 *
 * Categories:
 *   SIM   – World simulation (day advance, contracts, injuries)
 *   BOOK  – Booking (card build, match outcomes, title changes)
 *   RP    – Role play (submit, score, draft)
 *   MATCH – Match resolution (winner, rating, narrative)
 *   WORLD – World-level events (create, join, invite)
 *   PLAY  – Player actions (career, wrestler create)
 *   UI    – UI events (navigation, clicks)
 *   ERR   – Errors and warnings
 *   SYS   – System (save, load, sync)
 */

export const LOG_TYPES = {
  SIM: 'simulation',
  BOOK: 'booking',
  RP: 'rp',
  MATCH: 'match',
  WORLD: 'world',
  PLAY: 'player',
  UI: 'ui',
  ERR: 'error',
  SYS: 'system',
};

export const LOG_SEVERITY = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

export function createLogEntry(type, message, data = {}, severity = LOG_SEVERITY.INFO) {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    type,
    severity,
    message,
    data,
  };
}

export const logger = {
  info: (msg, data) => createLogEntry(LOG_TYPES.SYS, msg, data, LOG_SEVERITY.INFO),
  sim: (msg, data) => createLogEntry(LOG_TYPES.SIM, msg, data, LOG_SEVERITY.INFO),
  book: (msg, data) => createLogEntry(LOG_TYPES.BOOK, msg, data, LOG_SEVERITY.INFO),
  rp: (msg, data) => createLogEntry(LOG_TYPES.RP, msg, data, LOG_SEVERITY.INFO),
  match: (msg, data) => createLogEntry(LOG_TYPES.MATCH, msg, data, LOG_SEVERITY.INFO),
  world: (msg, data) => createLogEntry(LOG_TYPES.WORLD, msg, data, LOG_SEVERITY.INFO),
  player: (msg, data) => createLogEntry(LOG_TYPES.PLAY, msg, data, LOG_SEVERITY.INFO),
  ui: (msg, data) => createLogEntry(LOG_TYPES.UI, msg, data, LOG_SEVERITY.DEBUG),
  error: (msg, data) => createLogEntry(LOG_TYPES.ERR, msg, data, LOG_SEVERITY.ERROR),
  warn: (msg, data) => createLogEntry(LOG_TYPES.ERR, msg, data, LOG_SEVERITY.WARN),
  system: (msg, data) => createLogEntry(LOG_TYPES.SYS, msg, data, LOG_SEVERITY.INFO),
};

export function getLogColor(type) {
  const colors = {
    [LOG_TYPES.SIM]: '#55ff55',
    [LOG_TYPES.BOOK]: '#ff88ff',
    [LOG_TYPES.RP]: '#88aaff',
    [LOG_TYPES.MATCH]: '#ffaa55',
    [LOG_TYPES.WORLD]: '#55ffff',
    [LOG_TYPES.PLAY]: '#55ffff',
    [LOG_TYPES.UI]: '#888888',
    [LOG_TYPES.ERR]: '#ff5555',
    [LOG_TYPES.SYS]: '#aaaaaa',
  };
  return colors[type] || '#666666';
}

export function getSeverityIcon(severity) {
  const icons = {
    [LOG_SEVERITY.DEBUG]: '🔍',
    [LOG_SEVERITY.INFO]: 'ℹ️',
    [LOG_SEVERITY.WARN]: '⚠️',
    [LOG_SEVERITY.ERROR]: '❌',
  };
  return icons[severity] || '';
}

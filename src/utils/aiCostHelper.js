const STORAGE_KEY = 'ke_ai_metrics_v1';

const PRICING = {
  'grok-4-1-fast-reasoning': {
    inputPer1M: 2.0,
    outputPer1M: 10.0,
  },
  'grok-imagine-image': {
    perImage: 0.05,
  },
};

function loadMetrics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMetrics(rows) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(-500)));
  } catch {
    // ignore storage failures
  }
}

export function estimateTextCost(usage, model = 'grok-4-1-fast-reasoning') {
  if (!usage) return 0;
  const cfg = PRICING[model] || PRICING['grok-4-1-fast-reasoning'];
  const input = Number(usage.prompt_tokens || 0);
  const output = Number(usage.completion_tokens || 0);
  return (input / 1_000_000) * cfg.inputPer1M + (output / 1_000_000) * cfg.outputPer1M;
}

export function estimateImageCost(model = 'grok-imagine-image', images = 1) {
  const cfg = PRICING[model] || PRICING['grok-imagine-image'];
  return Number(images || 1) * Number(cfg.perImage || 0);
}

export function recordAIMetric(entry) {
  const rows = loadMetrics();
  rows.push({
    id: `aim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ts: Date.now(),
    ...entry,
  });
  saveMetrics(rows);
}

export function getAIMetricsSummary() {
  const rows = loadMetrics();
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const dayRows = rows.filter((r) => r.ts >= dayAgo);
  const weekRows = rows.filter((r) => r.ts >= weekAgo);

  const sumCost = (arr) => arr.reduce((s, r) => s + Number(r.costUsd || 0), 0);
  const sumTokens = (arr) => arr.reduce((s, r) => s + Number(r.totalTokens || 0), 0);

  const perFeature = rows.reduce((acc, row) => {
    const k = row.feature || 'unknown';
    if (!acc[k]) acc[k] = { requests: 0, costUsd: 0, totalTokens: 0, cacheHits: 0 };
    acc[k].requests += 1;
    acc[k].costUsd += Number(row.costUsd || 0);
    acc[k].totalTokens += Number(row.totalTokens || 0);
    if (row.cacheHit) acc[k].cacheHits += 1;
    return acc;
  }, {});

  const totalCacheHits = rows.filter((r) => r.cacheHit).length;
  const cacheHitRatio = rows.length ? totalCacheHits / rows.length : 0;

  return {
    totalRequests: rows.length,
    dayCostUsd: sumCost(dayRows),
    weekCostUsd: sumCost(weekRows),
    totalCostUsd: sumCost(rows),
    totalTokens: sumTokens(rows),
    cacheHitRatio,
    perFeature,
    recent: rows.slice(-40).reverse(),
  };
}

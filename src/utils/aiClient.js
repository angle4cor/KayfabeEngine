/**
 * Kayfabe Engine – AI Client (Frontend → Backend proxy)
 * Lightweight caching and cost tracking for AI calls.
 */

import { estimateTextCost, recordAIMetric } from './aiCostHelper';

let _serverAvailable = null;
const _aiCache = new Map();

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

function hashKey(raw) {
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  return String(Math.abs(h));
}

function getCache(feature, task, data, context) {
  const key = `${feature}:${hashKey(`${task}|${stableStringify(data)}|${context || ''}`)}`;
  const entry = _aiCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    _aiCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCache(feature, task, data, context, value, ttlMs) {
  if (!ttlMs || ttlMs <= 0) return;
  const key = `${feature}:${hashKey(`${task}|${stableStringify(data)}|${context || ''}`)}`;
  _aiCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export async function isAIAvailable() {
  if (_serverAvailable !== null) return _serverAvailable;
  try {
    const resp = await fetch('/api/health', { signal: AbortSignal.timeout(2000) });
    if (!resp.ok) {
      _serverAvailable = false;
      return false;
    }
    const data = await resp.json();
    _serverAvailable = data.status === 'ok' && data.hasApiKey;
    setTimeout(() => {
      _serverAvailable = null;
    }, 60000);
    return _serverAvailable;
  } catch {
    _serverAvailable = false;
    setTimeout(() => {
      _serverAvailable = null;
    }, 30000);
    return false;
  }
}

export async function aiBooking(task, data = null, context = '', options = {}) {
  const {
    feature = 'booking',
    cacheTtlMs = 0,
    maxTokens = 1200,
    temperature = 0.85,
    model = 'grok-4-1-fast-reasoning',
  } = options || {};

  if (cacheTtlMs > 0) {
    const cached = getCache(feature, task, data, context);
    if (cached) {
      recordAIMetric({ feature, model, requestType: 'text', totalTokens: 0, costUsd: 0, cacheHit: true });
      return cached;
    }
  }

  if (!(await isAIAvailable())) return null;

  try {
    const resp = await fetch('/api/ai-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, data, context, feature, max_tokens: maxTokens, temperature }),
    });

    if (!resp.ok) {
      console.warn('[AI] Booking request failed:', resp.status);
      return null;
    }

    const result = await resp.json();
    const content = result.content || null;
    const usage = result.usage || null;
    const costUsd = estimateTextCost(usage, model);

    recordAIMetric({
      feature,
      model,
      requestType: 'text',
      promptTokens: Number(usage?.prompt_tokens || 0),
      completionTokens: Number(usage?.completion_tokens || 0),
      totalTokens: Number(usage?.total_tokens || 0),
      costUsd,
      cacheHit: false,
    });

    if (content && cacheTtlMs > 0) setCache(feature, task, data, context, content, cacheTtlMs);
    return content;
  } catch (err) {
    console.warn('[AI] Booking error:', err.message);
    return null;
  }
}

/** Score an RP via AI (creativity, storytelling, character). Returns object with scores or null. */
export async function aiRPScore(rpContent, wrestlerName, forShow) {
  const result = await aiBooking(
    'Rate this wrestling Role Play (RP) on creativity (0-10), storytelling (0-10), and character work (0-10). Return ONLY a JSON object: { creativity, storytelling, characterWork, overall } with numbers.',
    { rpContent: rpContent.slice(0, 4000), wrestlerName, forShow },
    '',
    { feature: 'rp_score', cacheTtlMs: 0, maxTokens: 120, temperature: 0.3 }
  );
  if (!result) return null;
  try {
    const parsed = JSON.parse(result);
    return parsed;
  } catch {
    return null;
  }
}

/** Generate match narrative (blow-by-blow) for a completed match. */
export async function aiMatchNarrative(match, wrestlers) {
  return aiBooking(
    'Write a short dramatic match narrative (2-4 sentences) for this wrestling match. Return ONLY the narrative text.',
    {
      winner: wrestlers[match.winnerId]?.ringName || match.winnerId,
      loser: wrestlers[match.loserId]?.ringName || match.loserId,
      method: match.method,
      rating: match.rating,
      championship: match.championshipId || null,
    },
    '',
    { feature: 'match_narrative', cacheTtlMs: 10 * 60 * 1000, maxTokens: 260, temperature: 0.8 }
  );
}

/** AI suggest show card (matchups) from roster and storylines. */
export async function aiBookShow(federation, roster, storylines, upcomingShowName) {
  return aiBooking(
    'Suggest a wrestling show card: list 4-6 matches with match types (singles, tag, triple threat) and optional stipulation. Return a JSON array of { type, participants: [id or name], stipulation?, championship? }. Use only provided roster IDs or names.',
    { federation: federation?.name, roster: roster?.slice(0, 40), storylines: storylines?.slice(0, 10), showName: upcomingShowName },
    '',
    { feature: 'book_show', cacheTtlMs: 5 * 60 * 1000, maxTokens: 800, temperature: 0.7 }
  );
}

/** Generate a new world from a text prompt (federations, wrestlers, era). */
export async function aiGenerateWorld(prompt) {
  return aiBooking(
    'Generate a wrestling world from this description: federations (name, shortName, style), wrestlers (ringName, alignment, gimmick, stats object with mic/inRing/charisma 0-100). Return valid JSON: { federations: [...], wrestlers: [...] }.',
    { prompt: prompt.slice(0, 2000) },
    '',
    { feature: 'world_generate', cacheTtlMs: 0, maxTokens: 4000, temperature: 0.75 }
  );
}

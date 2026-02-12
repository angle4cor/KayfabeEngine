/**
 * Kayfabe Engine – Backend API Server
 * Express server proxying xAI API calls. API key stays server-side.
 *
 * Routes:
 *   GET  /api/health           – health check + config status
 *   GET  /api/ai-metrics        – cost/metrics summary
 *   POST /api/ai-booking        – grok-4-1-fast-reasoning (generic booking/narrative)
 *   POST /api/ai-rp-score       – RP scoring (returns creativity, storytelling, characterWork, overall)
 *   POST /api/ai-match-narrative – match narrative text
 *   POST /api/ai-generate-world – world generation from prompt
 *   POST /api/game-log          – append to game logs
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { appendFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

const app = express();
const PORT = process.env.API_PORT || 3002;

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_BASE_URL = process.env.XAI_BASE_URL || 'https://api.x.ai/v1';
const REASONING_MODEL = process.env.XAI_REASONING_MODEL || 'grok-4-1-fast-reasoning';
const AI_METRICS_LOG_PATH = path.join(process.cwd(), '.cursor', 'ai-metrics.ndjson');
const GAME_LOG_PATH = path.join(process.cwd(), '.cursor', 'game-logs.ndjson');

const PRICE_CONFIG = {
  text: {
    inputPer1M: Number(process.env.AI_TEXT_INPUT_PER_1M || 2.0),
    outputPer1M: Number(process.env.AI_TEXT_OUTPUT_PER_1M || 10.0),
  },
};
const aiMetrics = [];

app.use(cors());
app.use(express.json({ limit: '2mb' }));

function xaiHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${XAI_API_KEY}`,
  };
}

function hasApiKey() {
  return !!XAI_API_KEY && XAI_API_KEY.startsWith('xai-');
}

function estimateTextCost(usage) {
  const input = Number(usage?.prompt_tokens || 0);
  const output = Number(usage?.completion_tokens || 0);
  return (input / 1_000_000) * PRICE_CONFIG.text.inputPer1M + (output / 1_000_000) * PRICE_CONFIG.text.outputPer1M;
}

async function recordAIMetric(entry) {
  const row = { id: `srv_ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, ts: Date.now(), ...entry };
  aiMetrics.push(row);
  if (aiMetrics.length > 2000) aiMetrics.splice(0, aiMetrics.length - 2000);
  try {
    await appendFile(AI_METRICS_LOG_PATH, `${JSON.stringify(row)}\n`);
  } catch {}
}

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: hasApiKey(),
    reasoningModel: REASONING_MODEL,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/ai-metrics
app.get('/api/ai-metrics', (_req, res) => {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const dayRows = aiMetrics.filter((r) => r.ts >= dayAgo);
  const weekRows = aiMetrics.filter((r) => r.ts >= weekAgo);
  const sumCost = (arr) => arr.reduce((s, r) => s + Number(r.costUsd || 0), 0);
  const sumTokens = (arr) => arr.reduce((s, r) => s + Number(r.totalTokens || 0), 0);
  const perFeature = aiMetrics.reduce((acc, row) => {
    const k = row.feature || 'unknown';
    if (!acc[k]) acc[k] = { requests: 0, costUsd: 0, totalTokens: 0 };
    acc[k].requests += 1;
    acc[k].costUsd += Number(row.costUsd || 0);
    acc[k].totalTokens += Number(row.totalTokens || 0);
    return acc;
  }, {});
  res.json({
    totalRequests: aiMetrics.length,
    dayCostUsd: sumCost(dayRows),
    weekCostUsd: sumCost(weekRows),
    totalCostUsd: sumCost(aiMetrics),
    totalTokens: sumTokens(aiMetrics),
    perFeature,
    recent: aiMetrics.slice(-80).reverse(),
  });
});

async function callXAI(messages, options = {}) {
  const { temperature = 0.8, max_tokens = 1200 } = options;
  const xaiRes = await fetch(`${XAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: xaiHeaders(),
    body: JSON.stringify({
      model: REASONING_MODEL,
      messages,
      temperature,
      max_tokens,
    }),
  });
  if (!xaiRes.ok) {
    const errText = await xaiRes.text().catch(() => '');
    throw new Error(`xAI ${xaiRes.status}: ${errText.slice(0, 200)}`);
  }
  const result = await xaiRes.json();
  return {
    content: result?.choices?.[0]?.message?.content?.trim() || '',
    usage: result?.usage,
  };
}

const KAYFABE_SYSTEM = `You are the AI for Kayfabe Engine, an interactive E-Fed wrestling game.
You generate immersive, kayfabe-style content: RP scoring, match narratives, show booking, world generation.
Write in wrestling journalism style. Be dramatic. Return only the requested format (JSON or plain text).`;

// POST /api/ai-booking
app.post('/api/ai-booking', async (req, res) => {
  if (!hasApiKey()) return res.status(503).json({ error: 'XAI_API_KEY not configured on server' });
  const { context, task, data, feature = 'booking', max_tokens, temperature } = req.body;
  if (!task) return res.status(400).json({ error: 'task is required' });
  try {
    const userContent = typeof data === 'object' ? `${task}\n\nData:\n${JSON.stringify(data, null, 2)}` : task;
    const { content, usage } = await callXAI(
      [
        { role: 'system', content: `${KAYFABE_SYSTEM}\n${context || ''}` },
        { role: 'user', content: userContent },
      ],
      { temperature: Number(temperature ?? 0.85), max_tokens: Number(max_tokens ?? 2000) }
    );
    const costUsd = estimateTextCost(usage);
    await recordAIMetric({
      feature,
      model: REASONING_MODEL,
      requestType: 'text',
      promptTokens: Number(usage?.prompt_tokens || 0),
      completionTokens: Number(usage?.completion_tokens || 0),
      totalTokens: Number(usage?.total_tokens || 0),
      costUsd,
      cacheHit: false,
    });
    res.json({ content, usage });
  } catch (err) {
    console.error('[AI] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai-rp-score – body: { rpContent, wrestlerName, forShow }
app.post('/api/ai-rp-score', async (req, res) => {
  if (!hasApiKey()) return res.status(503).json({ error: 'XAI_API_KEY not configured on server' });
  const { rpContent, wrestlerName, forShow } = req.body || {};
  if (!rpContent) return res.status(400).json({ error: 'rpContent is required' });
  const task = `Rate this wrestling Role Play (RP) on creativity (0-10), storytelling (0-10), and character work (0-10). Return ONLY a JSON object: { "creativity": number, "storytelling": number, "characterWork": number, "overall": number }.`;
  const data = { rpContent: String(rpContent).slice(0, 4000), wrestlerName: wrestlerName || '', forShow: forShow || '' };
  try {
    const { content, usage } = await callXAI(
      [
        { role: 'system', content: KAYFABE_SYSTEM },
        { role: 'user', content: `${task}\n\nData:\n${JSON.stringify(data)}` },
      ],
      { temperature: 0.3, max_tokens: 120 }
    );
    const costUsd = estimateTextCost(usage);
    await recordAIMetric({ feature: 'rp_score', model: REASONING_MODEL, requestType: 'text', ...usage, costUsd });
    let scores = null;
    try {
      scores = JSON.parse(content.replace(/```json?\s*/g, '').replace(/```/g, '').trim());
    } catch {
      scores = { creativity: 5, storytelling: 5, characterWork: 5, overall: 5 };
    }
    res.json({ scores, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai-match-narrative – body: { winnerName, loserName, method, rating, championship }
app.post('/api/ai-match-narrative', async (req, res) => {
  if (!hasApiKey()) return res.status(503).json({ error: 'XAI_API_KEY not configured on server' });
  const body = req.body || {};
  const task = 'Write a short dramatic match narrative (2-4 sentences) for this wrestling match. Return ONLY the narrative text, no JSON.';
  try {
    const { content, usage } = await callXAI(
      [
        { role: 'system', content: KAYFABE_SYSTEM },
        { role: 'user', content: `${task}\n\nData:\n${JSON.stringify(body)}` },
      ],
      { temperature: 0.8, max_tokens: 260 }
    );
    const costUsd = estimateTextCost(usage);
    await recordAIMetric({ feature: 'match_narrative', model: REASONING_MODEL, requestType: 'text', ...usage, costUsd });
    res.json({ narrative: content.trim(), usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai-generate-world – body: { prompt }
app.post('/api/ai-generate-world', async (req, res) => {
  if (!hasApiKey()) return res.status(503).json({ error: 'XAI_API_KEY not configured on server' });
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });
  const task = 'Generate a wrestling world from this description: federations (name, shortName, style), wrestlers (ringName, alignment, gimmick, stats object with mic/inRing/charisma 0-100). Return valid JSON: { federations: [...], wrestlers: [...] }.';
  try {
    const { content, usage } = await callXAI(
      [
        { role: 'system', content: KAYFABE_SYSTEM },
        { role: 'user', content: `${task}\n\nPrompt:\n${String(prompt).slice(0, 2000)}` },
      ],
      { temperature: 0.75, max_tokens: 4000 }
    );
    const costUsd = estimateTextCost(usage);
    await recordAIMetric({ feature: 'world_generate', model: REASONING_MODEL, requestType: 'text', ...usage, costUsd });
    let world = null;
    try {
      const jsonStr = content.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
      world = JSON.parse(jsonStr);
    } catch {
      world = { federations: [], wrestlers: [] };
    }
    res.json({ world, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/game-log
app.post('/api/game-log', async (req, res) => {
  const entry = req.body;
  if (!entry || !entry.timestamp) return res.status(400).json({ error: 'Invalid log entry' });
  try {
    const { mkdir } = await import('fs/promises');
    await mkdir(path.dirname(GAME_LOG_PATH), { recursive: true });
    await appendFile(GAME_LOG_PATH, JSON.stringify(entry) + '\n');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { app };

if (isMain) {
  app.listen(PORT, () => {
    console.log(`\nKayfabe Engine API – Port: ${PORT}, API Key: ${hasApiKey() ? 'OK' : 'MISSING'}\n`);
  });
}

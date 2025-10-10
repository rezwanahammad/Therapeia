const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const API_VERSION = process.env.GEMINI_API_VERSION || 'v1';

let cachedModel = null;
let cachedVersion = null;

async function listModels(apiKey) {
  const versions = [API_VERSION, 'v1beta'];
  let lastErr;
  for (const ver of versions) {
    const url = `https://generativelanguage.googleapis.com/${ver}/models?key=${apiKey}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        lastErr = new Error(`ListModels failed ${res.status}`);
        continue;
      }
      const data = await res.json();
      const models = data?.models || data?.data || [];
      return { models, version: ver };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Unable to list models');
}

function pickModel(models) {
  const supports = (m) => {
    const methods = m?.supported_generation_methods || m?.supportedMethods || [];
    return Array.isArray(methods) ? methods.includes('generateContent') : true;
  };
  const byPreference = models
    .filter((m) => typeof m?.name === 'string')
    .sort((a, b) => {
      const na = a.name || '';
      const nb = b.name || '';
      // Prefer 1.5 flash, then 1.5 pro, then others
      const rank = (n) => (
        /gemini-1\.5-flash/i.test(n) ? 1 :
        /gemini-1\.5-pro/i.test(n) ? 2 :
        /gemini-1\.0-pro/i.test(n) ? 3 :
        /gemini/i.test(n) ? 4 : 10
      );
      return rank(na) - rank(nb);
    });
  for (const m of byPreference) {
    if (supports(m)) return (m.name || '').replace(/^models\//, '');
  }
  const nm = byPreference[0]?.name || null;
  return nm ? nm.replace(/^models\//, '') : null;
}

  async function ensureModel(apiKey) {
  if (cachedModel && cachedVersion) return { model: cachedModel, version: cachedVersion };
  // Try env override first
  const envModel = process.env.GEMINI_MODEL ? process.env.GEMINI_MODEL.replace(/^models\//, '') : null;
  const envVer = process.env.GEMINI_API_VERSION || API_VERSION;
  if (envModel) {
    cachedModel = envModel;
    cachedVersion = envVer;
    return { model: cachedModel, version: cachedVersion };
  }
  const { models, version } = await listModels(apiKey);
  const model = pickModel(models);
  if (!model) throw new Error('No Gemini models available for your API key');
  cachedModel = model;
  cachedVersion = version;
  return { model, version };
}

async function generateGeminiContent(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('Gemini API key not configured'), { status: 500 });
  }

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: String(prompt || '') }],
      },
    ],
  };

  const { model, version } = await ensureModel(apiKey);
  const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let payload;
    try {
      payload = await res.json();
    } catch {
      payload = { error: { message: await res.text().catch(() => 'Gemini request failed') } };
    }
    const msg = payload?.error?.message || 'Gemini request failed';
    throw Object.assign(new Error(msg), { status: res.status });
  }
  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join('\n') ||
    '';
  return text;
}

module.exports = { generateGeminiContent };
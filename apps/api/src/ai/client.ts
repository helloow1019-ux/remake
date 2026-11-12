import Groq from 'groq-sdk';
import { env } from '../env.js';
import { MOCK_SCENARIOS } from './mock.js';

/**
 * Returns all configured Groq API keys in priority order.
 */
export function getAllGroqKeys(): string[] {
  const keys: string[] = [];
  if (env.GROQ_API_KEY) keys.push(env.GROQ_API_KEY);
  if (env.GROQ_API_KEY_SECONDARY && env.GROQ_API_KEY_SECONDARY !== env.GROQ_API_KEY) {
    keys.push(env.GROQ_API_KEY_SECONDARY);
  }
  if (env.GROQ_API_KEYS) {
    const extras = env.GROQ_API_KEYS.split(',').map((s) => s.trim()).filter(Boolean);
    for (const k of extras) {
      if (!keys.includes(k)) keys.push(k);
    }
  }
  return keys;
}

const clientPool = new Map<string, Groq>();

export function getGroqClientForKey(apiKey: string): Groq {
  let client = clientPool.get(apiKey);
  if (!client) {
    client = new Groq({ apiKey });
    clientPool.set(apiKey, client);
  }
  return client;
}

export function getGroqClient(): Groq | null {
  const keys = getAllGroqKeys();
  const firstKey = keys[0];
  if (!firstKey) return null;
  return getGroqClientForKey(firstKey);
}

interface ModelHealth {
  ok: boolean;
  visionModel: string;
  textModel: string;
  reachable: boolean;
  mode: string;
  availableModels: string[];
  checkedAt: number;
}

let cachedHealth: ModelHealth | null = null;
const CACHE_TTL_MS = 60 * 1000;

/**
 * Checks models against the Groq API and validates which configured models exist.
 */
export async function verifyGroqModels(): Promise<ModelHealth> {
  const now = Date.now();
  if (cachedHealth && now - cachedHealth.checkedAt < CACHE_TTL_MS) {
    return cachedHealth;
  }

  const keys = getAllGroqKeys();
  let effectiveVisionModel = env.GROQ_VISION_MODEL;
  let effectiveTextModel = env.GROQ_TEXT_MODEL;

  if (keys.length === 0 || env.AI_MODE === 'mock') {
    cachedHealth = {
      ok: true,
      visionModel: effectiveVisionModel,
      textModel: effectiveTextModel,
      reachable: false,
      mode: 'mock',
      availableModels: [],
      checkedAt: now,
    };
    return cachedHealth;
  }

  const primaryKey = keys[0]!;
  const client = getGroqClientForKey(primaryKey);
  const visionFallbacks = env.GROQ_VISION_FALLBACKS.split(',').map((s) => s.trim());

  try {
    const list = await client.models.list();
    const modelIds = list.data.map((m) => m.id);

    // If qwen3.8-27b is available and primary is not in catalog, prefer it
    if (!modelIds.includes(effectiveVisionModel)) {
      const foundFallback = visionFallbacks.find((fb) => modelIds.includes(fb)) ||
        modelIds.find((id) => id.includes('qwen') || id.includes('vision'));

      if (foundFallback) {
        console.log(`✅ Using discovered vision model: "${foundFallback}"`);
        effectiveVisionModel = foundFallback;
      }
    }

    if (!modelIds.includes(effectiveTextModel)) {
      const foundText = modelIds.find((id) => id.includes('qwen') || id.includes('llama') || id.includes('gpt'));
      if (foundText) {
        effectiveTextModel = foundText;
      }
    }

    cachedHealth = {
      ok: true,
      visionModel: effectiveVisionModel,
      textModel: effectiveTextModel,
      reachable: true,
      mode: 'live',
      availableModels: modelIds,
      checkedAt: now,
    };
    return cachedHealth;
  } catch (err: any) {
    console.error('Groq model verification failed:', err.message);
    cachedHealth = {
      ok: false,
      visionModel: effectiveVisionModel,
      textModel: effectiveTextModel,
      reachable: false,
      mode: env.AI_FALLBACK_TO_MOCK ? 'fallback' : 'error',
      availableModels: [],
      checkedAt: now,
    };
    return cachedHealth;
  }
}

export type AiTaskType = 'VISION' | 'IDEAS' | 'ASSISTANT' | 'ADAPT';

/**
 * Returns task-specific mock content so different endpoints never return mismatched JSON schemas.
 */
function getMockContentForTask(task: AiTaskType = 'VISION'): string {
  switch (task) {
    case 'IDEAS':
      return JSON.stringify({
        ideas: [
          ...MOCK_SCENARIOS['plastic-bottle']!.ideas.slice(0, 2),
          ...MOCK_SCENARIOS['cardboard']!.ideas.slice(0, 1),
        ],
      });
    case 'ASSISTANT':
      return 'For this upcycling project, take extra care to clean the surface completely and let any adhesive cure thoroughly. If substituting materials, PVA craft glue works great on paper and cardboard, while contact glue or hot glue works best on plastics.';
    case 'ADAPT':
      return JSON.stringify({
        materialsMap: [
          { original: 'Craft knife', substitute: 'Sturdy safety scissors', note: 'Score along fold lines first' },
          { original: 'Hot glue gun', substitute: 'PVA craft glue with clamp', note: 'Allow 30 minutes to cure' },
        ],
        notes: 'Adapted safely for available household tools.',
      });
    case 'VISION':
    default:
      return JSON.stringify(MOCK_SCENARIOS['plastic-bottle']!.detection);
  }
}

/**
 * Executes a chat completion with multi-key pool failover, timeout, retry, and model fallback logic.
 */
export async function callGroqCompletion(params: {
  messages: any[];
  model: string;
  response_format?: { type: 'json_object' };
  temperature?: number;
  max_tokens?: number;
  isVision?: boolean;
  task?: AiTaskType;
}): Promise<{ content: string; modelUsed: string; mode: 'LIVE' | 'FALLBACK' | 'MOCK' }> {
  const task = params.task || (params.isVision ? 'VISION' : 'IDEAS');

  if (env.AI_MODE === 'mock') {
    return {
      content: getMockContentForTask(task),
      modelUsed: 'mock-static',
      mode: 'MOCK',
    };
  }

  const keys = getAllGroqKeys();
  if (keys.length === 0) {
    if (env.AI_FALLBACK_TO_MOCK) {
      return {
        content: getMockContentForTask(task),
        modelUsed: 'mock-static',
        mode: 'MOCK',
      };
    }
    throw new Error('No Groq API keys configured');
  }

  // Candidate models: requested model first, then fallbacks
  const candidateModels = params.isVision
    ? [params.model, ...env.GROQ_VISION_FALLBACKS.split(',').map((s) => s.trim())]
    : [params.model, 'qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

  // De-duplicate candidate models
  const uniqueModels = Array.from(new Set(candidateModels.filter(Boolean)));

  // Guard max_tokens to stay below free-tier TPM/OTPM rate limits
  const maxTokens = params.max_tokens ?? (params.isVision ? 450 : 600);

  let lastError: Error | null = null;

  // Try each API key in the pool (primary -> secondary -> extras)
  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const currentKey = keys[keyIdx];
    if (!currentKey) continue;
    const client = getGroqClientForKey(currentKey);

    for (const modelCandidate of uniqueModels) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Groq API call timed out')), env.AI_TIMEOUT_MS)
        );

        const completionPromise = client.chat.completions.create({
          messages: params.messages,
          model: modelCandidate,
          response_format: params.response_format,
          temperature: params.temperature ?? 0.3,
          max_tokens: maxTokens,
        });

        const response = await Promise.race([completionPromise, timeoutPromise]);
        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from Groq');
        }

        return {
          content,
          modelUsed: modelCandidate,
          mode: modelCandidate === params.model ? 'LIVE' : 'FALLBACK',
        };
      } catch (err: any) {
        lastError = err;
        const msg = err.message || '';
        console.warn(
          `Groq Key ${keyIdx + 1} (${currentKey.substring(0, 10)}...) with model ${modelCandidate} failed: ${msg}`
        );

        // If rate limit (429) or token limit or auth failure (401/403), switch keys immediately
        if (msg.includes('429') || msg.includes('rate_limit') || msg.includes('tokens') || msg.includes('401') || msg.includes('403')) {
          console.warn(`⚡ Rate limit or auth error on key ${keyIdx + 1}. Switching to next key in pool...`);
          break; // Break inner model loop to move to the next key
        }
      }
    }
  }

  // All keys and models failed -> fallback to mock safely if allowed
  if (env.AI_FALLBACK_TO_MOCK) {
    console.warn('⚠️ All Groq keys and models failed. Falling back to task-specific mock response.');
    return {
      content: getMockContentForTask(task),
      modelUsed: 'mock-fallback',
      mode: 'FALLBACK',
    };
  }

  throw lastError || new Error('All Groq completion attempts failed');
}

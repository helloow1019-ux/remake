import { z } from 'zod';
import dotenv from 'dotenv';
import { resolve } from 'node:path';

// Load .env from root or local
dotenv.config();
dotenv.config({ path: resolve(process.cwd(), '../../.env') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z.string().min(8).default('remake-default-jwt-secret-key-change-me'),
  COOKIE_SECURE: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .default(false),
  UPLOAD_DIR: z.string().default('./uploads'),
  ADMIN_EMAIL: z.string().email().default('admin@remake.local'),
  ADMIN_PASSWORD: z.string().min(6).default('change-me-now'),
  SEED_DEMO: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .default(false),
  GROQ_API_KEY: z.string().optional(),
  GROQ_API_KEY_SECONDARY: z.string().optional(),
  GROQ_API_KEYS: z.string().optional(),
  GROQ_VISION_MODEL: z.string().default('qwen/qwen3.8-27b'),
  GROQ_VISION_FALLBACKS: z
    .string()
    .default('meta-llama/llama-4-scout-17b-16e-instruct,llama-3.2-11b-vision-preview'),
  GROQ_TEXT_MODEL: z.string().default('qwen/qwen3.8-27b'),
  AI_MODE: z.enum(['live', 'mock']).default('live'),
  AI_FALLBACK_TO_MOCK: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .default(true),
  AI_MODERATION: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .default(false),
  AI_TIMEOUT_MS: z.coerce.number().default(25000),
  SCAN_HOURLY_LIMIT: z.coerce.number().default(10),
  SCAN_DAILY_LIMIT: z.coerce.number().default(30),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment validation failed:', parsed.error.format());
  process.exit(1);
}

// In production, refuse to start with default security values
if (parsed.data.NODE_ENV === 'production') {
  if (parsed.data.JWT_SECRET === 'remake-default-jwt-secret-key-change-me') {
    console.error('❌ Production error: JWT_SECRET must be configured with a secure random key');
    process.exit(1);
  }
  if (parsed.data.ADMIN_PASSWORD === 'change-me-now') {
    console.error('❌ Production error: ADMIN_PASSWORD must be changed from default');
    process.exit(1);
  }
}

export const env = parsed.data;

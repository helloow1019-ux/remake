import sharp from 'sharp';
import { prisma } from '../db.js';
import { env } from '../env.js';
import {
  VisionDetectionResult,
  calculateWasteGrams,
  calculateCo2Grams,
  IdeaPublic,
} from '@remake/shared';
import {
  PROMPT_VISION_SYSTEM,
  buildVisionUserPrompt,
  PROMPT_IDEA_GEN_SYSTEM,
  buildIdeaGenUserPrompt,
  PROMPT_ASSISTANT_SYSTEM,
  buildAssistantUserPrompt,
  PROMPT_ADAPT_SYSTEM,
  buildAdaptUserPrompt,
} from './prompts.js';
import {
  extractJsonFromText,
  validateVisionResult,
  validateIdeaGenResult,
  validateAdaptMaterialsResult,
} from './validators.js';
import { callGroqCompletion } from './client.js';
import { MOCK_SCENARIOS } from './mock.js';

export class AiError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'AiError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Prepares and compresses an image buffer using sharp.
 * Resizes max dimension to 1280px, removes EXIF, outputs JPEG q80.
 */
export async function prepareImageForVision(buffer: Buffer): Promise<string> {
  const processed = await sharp(buffer)
    .rotate() // auto-orient by EXIF
    .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  return processed.toString('base64');
}

/**
 * Executes Prompt 1: Analyzes uploaded waste images.
 */
export async function analyzeWasteImages(params: {
  imageBuffers: Buffer[];
  userId: string;
  imagePaths: string[];
}): Promise<{
  scanId: string;
  mode: 'LIVE' | 'FALLBACK' | 'MOCK';
  model: string;
  latencyMs: number;
  result: VisionDetectionResult;
}> {
  const startTime = Date.now();

  let detection: VisionDetectionResult;
  let mode: 'LIVE' | 'FALLBACK' | 'MOCK' = 'LIVE';
  let modelUsed = env.GROQ_VISION_MODEL;

  if (env.AI_MODE === 'mock' || !env.GROQ_API_KEY) {
    detection = MOCK_SCENARIOS['plastic-bottle']!.detection;
    mode = 'MOCK';
    modelUsed = 'mock-llama-scout';
  } else {
    // Process image buffers
    const base64List: string[] = [];
    for (const buf of params.imageBuffers) {
      base64List.push(await prepareImageForVision(buf));
    }

    const messages = [
      { role: 'system', content: PROMPT_VISION_SYSTEM },
      { role: 'user', content: buildVisionUserPrompt(base64List) },
    ];

    const response = await callGroqCompletion({
      messages,
      model: env.GROQ_VISION_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 450,
      isVision: true,
      task: 'VISION',
    });

    mode = response.mode;
    modelUsed = response.modelUsed;

    try {
      const cleanJson = extractJsonFromText(response.content);
      const raw = JSON.parse(cleanJson);
      detection = validateVisionResult(raw);
    } catch (err: any) {
      console.warn('Initial vision JSON parse failed, retrying once at temp 0...', err.message);
      // Retry once at temperature 0
      const retryResponse = await callGroqCompletion({
        messages: [
          ...messages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: 'Return valid JSON only. Fix any syntax errors.' },
        ],
        model: response.modelUsed,
        response_format: { type: 'json_object' },
        temperature: 0,
        max_tokens: 450,
        isVision: true,
        task: 'VISION',
      });
      const cleanJson = extractJsonFromText(retryResponse.content);
      detection = validateVisionResult(JSON.parse(cleanJson));
    }
  }

  const latencyMs = Date.now() - startTime;

  // 1. Check if photo contains no reusable waste
  if (!detection.isWaste) {
    throw new AiError(
      'No reusable waste was detected in this photo. Please photograph discarded household materials like bottles, cardboard, jars, or cloth.',
      'NOT_WASTE'
    );
  }

  // 2. Check for hazardous waste
  const hazardousItem = detection.items.find((it) => it.hazardous);
  if (hazardousItem) {
    throw new AiError(
      `Hazardous or unsafe item detected (${hazardousItem.label}). For safety reasons, batteries, medical supplies, electronics, and chemical containers should not be reused for home crafts. Please take them to a designated municipal hazardous waste collection center.`,
      'HAZARDOUS',
      { item: hazardousItem }
    );
  }

  // 3. Save Scan to Database
  const scanRecord = await prisma.scan.create({
    data: {
      userId: params.userId,
      imagePaths: JSON.stringify(params.imagePaths),
      resultJson: JSON.stringify(detection),
      model: modelUsed,
      latencyMs,
      mode,
    },
  });

  return {
    scanId: scanRecord.id,
    mode,
    model: modelUsed,
    latencyMs,
    result: detection,
  };
}

/**
 * Executes Prompt 2: Generates 3 draft ideas and saves them as AI_DRAFT.
 */
export async function generateIdeaDrafts(params: {
  scanId?: string;
  items: Array<{ wasteTypeSlug: string; pieces: number }>;
  userId: string;
  locale?: string;
}): Promise<any[]> {
  // Fetch existing titles to avoid duplication
  const existing = await prisma.idea.findMany({
    select: { titleEn: true },
    take: 20,
    orderBy: { createdAt: 'desc' },
  });
  const existingTitles = existing.map((e) => e.titleEn);

  let generatedIdeas: any[] = [];

  if (env.AI_MODE === 'mock' || !env.GROQ_API_KEY) {
    generatedIdeas = MOCK_SCENARIOS['plastic-bottle']!.ideas;
  } else {
    const messages = [
      { role: 'system', content: PROMPT_IDEA_GEN_SYSTEM },
      {
        role: 'user',
        content: buildIdeaGenUserPrompt({
          items: params.items,
          locale: params.locale,
          existingTitles,
        }),
      },
    ];

    const response = await callGroqCompletion({
      messages,
      model: env.GROQ_TEXT_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 650,
      task: 'IDEAS',
    });

    try {
      const cleanJson = extractJsonFromText(response.content);
      const validated = validateIdeaGenResult(JSON.parse(cleanJson));
      generatedIdeas = validated.ideas;
    } catch (parseErr: any) {
      console.warn('⚠️ Idea generation parse failed, falling back to curated draft:', parseErr.message);
      const fallbackData = JSON.parse(
        JSON.stringify({
          ideas: [
            ...MOCK_SCENARIOS['plastic-bottle']!.ideas.slice(0, 2),
            ...MOCK_SCENARIOS['cardboard']!.ideas.slice(0, 1),
          ],
        })
      );
      const validated = validateIdeaGenResult(fallbackData);
      generatedIdeas = validated.ideas;
    }
  }

  // Fetch waste types from DB to calculate honest impact server-side
  const wasteTypes = await prisma.wasteType.findMany();
  const wtMap = new Map(wasteTypes.map((w) => [w.slug, w]));

  const createdIdeas: any[] = [];

  for (const idea of generatedIdeas) {
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slugBase = idea.titleEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${slugBase}-${randomSuffix}`;

    // Compute honest impact server-side
    let totalWasteGrams = 0;
    let totalCo2Grams = 0;

    const wasteRecords: Array<{ wasteTypeId: string; pieces: number; grams: number }> = [];

    for (const w of idea.wasteUsed) {
      const wt = wtMap.get(w.wasteTypeSlug) || wtMap.get('other');
      if (wt) {
        const grams = w.pieces * wt.gramsPerPiece;
        totalWasteGrams += grams;
        totalCo2Grams += Math.round((grams / 1000) * wt.co2PerKg * 1000 * 0.5);
        wasteRecords.push({
          wasteTypeId: wt.id,
          pieces: w.pieces,
          grams,
        });
      }
    }

    const primaryWasteSlug = idea.wasteUsed[0]?.wasteTypeSlug;
    const wasteToImageMap: Record<string, string> = {
      'plastic-bottle': '/seed/idea-planter.jpg',
      'bottle-cap': '/seed/product-cap-keychain.jpg',
      'food-scraps': '/seed/idea-compost.jpg',
      'old-cloth': '/seed/idea-pouch.jpg',
      'cardboard': '/seed/idea-organizer.jpg',
      'glass-jar': '/seed/idea-lantern.jpg',
      'tin-can': '/seed/idea-tin-holder.jpg',
      'paper-newspaper': '/seed/idea-basket.jpg',
      'plastic-bag': '/seed/product-tote.jpg',
      'tetra-pack': '/seed/idea-wallet.jpg',
      'other': '/seed/idea-mat.jpg',
    };
    const assignedCoverImage = wasteToImageMap[primaryWasteSlug] || '/seed/idea-planter.jpg';

    const created = await prisma.idea.create({
      data: {
        slug,
        status: 'AI_DRAFT',
        published: true,
        coverImage: assignedCoverImage,
        titleEn: idea.titleEn,
        titleUr: idea.titleUr,
        summaryEn: idea.summaryEn,
        summaryUr: idea.summaryUr,
        difficulty: idea.difficulty,
        timeMinutes: idea.timeMinutes,
        costPkr: idea.costPkr,
        sellPricePkr: idea.sellPricePkr,
        safetyNoteEn: idea.safetyNoteEn,
        safetyNoteUr: idea.safetyNoteUr,
        wasteGrams: totalWasteGrams,
        co2SavedG: totalCo2Grams,
        isSampleData: false,
        source: 'AI',
        scanId: params.scanId,
        ownerUserId: params.userId,
        waste: {
          create: wasteRecords,
        },
        materials: {
          create: idea.materials.map((m: any, idx: number) => ({
            nameEn: m.nameEn,
            nameUr: m.nameUr,
            quantity: m.quantity,
            isWaste: m.isWaste ?? false,
            sortOrder: idx,
          })),
        },
        tools: {
          create: idea.tools.map((t: any, idx: number) => ({
            nameEn: t.nameEn,
            nameUr: t.nameUr,
            sortOrder: idx,
          })),
        },
        steps: {
          create: idea.steps.map((s: any, idx: number) => ({
            position: s.position ?? idx + 1,
            textEn: s.textEn,
            textUr: s.textUr,
            tipEn: s.tipEn,
            timerSeconds: s.timerSeconds,
          })),
        },
      },
      include: {
        waste: { include: { wasteType: true } },
        materials: true,
        tools: true,
        steps: { orderBy: { position: 'asc' } },
      },
    });

    createdIdeas.push(created);
  }

  return createdIdeas;
}

/**
 * Executes Prompt 3: Idea assistant ("Ask ReMake").
 */
export async function askIdeaAssistant(params: {
  idea: any;
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  locale?: string;
}): Promise<{ reply: string; disclaimer: string }> {
  const ideaSummary = JSON.stringify({
    title: params.idea.titleEn,
    materials: params.idea.materials.map((m: any) => m.nameEn),
    tools: params.idea.tools.map((t: any) => t.nameEn),
    steps: params.idea.steps.map((s: any) => `${s.position}. ${s.textEn}`),
    safety: params.idea.safetyNoteEn,
  });

  const messages: any[] = [
    { role: 'system', content: PROMPT_ASSISTANT_SYSTEM },
  ];

  if (params.history) {
    for (const h of params.history.slice(-4)) {
      messages.push({ role: h.role, content: h.content });
    }
  }

  messages.push({
    role: 'user',
    content: buildAssistantUserPrompt({
      ideaJson: ideaSummary,
      message: params.message,
      locale: params.locale || 'en',
    }),
  });

  const response = await callGroqCompletion({
    messages,
    model: env.GROQ_TEXT_MODEL,
    temperature: 0.4,
    max_tokens: 350,
    task: 'ASSISTANT',
  });

  return {
    reply: response.content.trim(),
    disclaimer: 'AI-generated guidance. Always verify safety for yourself.',
  };
}

/**
 * Executes Prompt 4: Adapt materials to what the user has.
 */
export async function adaptIdeaMaterials(params: {
  idea: any;
  userHas: string[];
}): Promise<{ materialsMap: Array<{ need: string; use: string; note?: string }>; notes?: string }> {
  const messages = [
    { role: 'system', content: PROMPT_ADAPT_SYSTEM },
    {
      role: 'user',
      content: buildAdaptUserPrompt({
        materials: params.idea.materials,
        tools: params.idea.tools,
        userHas: params.userHas,
      }),
    },
  ];

  const response = await callGroqCompletion({
    messages,
    model: env.GROQ_TEXT_MODEL,
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 450,
    task: 'ADAPT',
  });

  const cleanJson = extractJsonFromText(response.content);
  return validateAdaptMaterialsResult(JSON.parse(cleanJson));
}

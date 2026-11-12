import {
  BANNED_HAZARD_TERMS,
  WASTE_TYPE_SLUGS,
  VisionDetectionResult,
  VisionDetectionResultSchema,
  IdeaGenerationResponse,
  IdeaGenerationResponseSchema,
  AdaptMaterialsResult,
  AdaptMaterialsResultSchema,
} from '@remake/shared';

/**
 * Strips markdown code blocks like ```json ... ``` from model outputs.
 */
export function extractJsonFromText(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return trimmed;
}

/**
 * Validates and repairs the vision detection response.
 */
export function validateVisionResult(raw: unknown): VisionDetectionResult {
  const parsed = VisionDetectionResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Vision detection schema validation failed: ${parsed.error.message}`);
  }

  const validSlugs = new Set(WASTE_TYPE_SLUGS);
  const data = parsed.data;

  // Sanitize items: cap to 8, clamp confidence, ensure valid slug
  data.items = data.items.slice(0, 8).map((it) => {
    let slug = it.wasteTypeSlug;
    if (!validSlugs.has(slug as any)) {
      slug = 'other';
    }
    return {
      ...it,
      wasteTypeSlug: slug,
      confidence: Math.max(0, Math.min(1, it.confidence ?? 0.8)),
      estimatedPieces: Math.max(1, Math.min(50, it.estimatedPieces ?? 1)),
      label: it.label.slice(0, 80),
      material: it.material.slice(0, 80),
    };
  });

  return data;
}

/**
 * Validates generated ideas from Prompt 2, clamps numbers, and enforces constraints.
 */
export function validateIdeaGenResult(raw: unknown): IdeaGenerationResponse {
  let toParse = raw;
  if (Array.isArray(raw)) {
    toParse = { ideas: raw };
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, any>;
    if (!obj.ideas) {
      const arrayKey = Object.keys(obj).find((k) => Array.isArray(obj[k]));
      if (arrayKey) {
        toParse = { ideas: obj[arrayKey] };
      }
    }
  }

  const parsed = IdeaGenerationResponseSchema.safeParse(toParse);
  if (!parsed.success) {
    throw new Error(`Idea generation schema validation failed: ${parsed.error.message}`);
  }

  const validSlugs = new Set(WASTE_TYPE_SLUGS);
  const cleanedIdeas = parsed.data.ideas.map((idea) => {
    // Check banned terms in title, summary, steps
    const fullText = [
      idea.titleEn,
      idea.summaryEn,
      idea.safetyNoteEn,
      ...idea.steps.map((s) => s.textEn),
    ].join(' ');

    if (containsBannedTerms(fullText)) {
      throw new Error(`Idea "${idea.titleEn}" triggered banned hazard safety filter.`);
    }

    return {
      ...idea,
      timeMinutes: Math.max(5, Math.min(480, idea.timeMinutes)),
      costPkr: Math.max(0, Math.min(2000, idea.costPkr)),
      sellPricePkr:
        idea.sellPricePkr != null ? Math.max(0, Math.min(5000, idea.sellPricePkr)) : null,
      safetyNoteEn: idea.safetyNoteEn || 'Use appropriate protective gear and tools with adult supervision.',
      wasteUsed: idea.wasteUsed.map((w) => ({
        wasteTypeSlug: validSlugs.has(w.wasteTypeSlug as any) ? w.wasteTypeSlug : 'other',
        pieces: Math.max(1, w.pieces || 1),
      })),
      steps: idea.steps.map((st, idx) => ({
        ...st,
        position: st.position ?? idx + 1,
      })),
    };
  });

  return { ideas: cleanedIdeas };
}

/**
 * Checks whether text contains any banned or hazardous keywords.
 */
export function containsBannedTerms(text: string): boolean {
  const lower = text.toLowerCase();
  for (const term of BANNED_HAZARD_TERMS) {
    // Check whole word boundary
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(lower)) {
      return true;
    }
  }
  return false;
}

/**
 * Validates adapt materials response.
 */
export function validateAdaptMaterialsResult(raw: unknown): AdaptMaterialsResult {
  const parsed = AdaptMaterialsResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Adapt materials validation failed: ${parsed.error.message}`);
  }
  return parsed.data;
}

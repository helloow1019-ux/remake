import { z } from 'zod';
import { SCAN_MODES, WASTE_TYPE_SLUGS } from '../constants.js';

export const DetectedItemConditionSchema = z.enum(['clean', 'dirty', 'damaged', 'unknown']);
export type DetectedItemCondition = z.infer<typeof DetectedItemConditionSchema>;

export const DetectedItemSchema = z.object({
  label: z.string().max(80),
  wasteTypeSlug: z.string(),
  material: z.string().max(80).default('unknown'),
  estimatedPieces: z
    .any()
    .transform((v) => Math.max(1, Math.min(50, Number(v) || 1))),
  condition: DetectedItemConditionSchema.default('unknown'),
  hazardous: z.boolean().default(false),
  confidence: z
    .any()
    .transform((v) => Math.max(0, Math.min(1, typeof v === 'number' ? v : 0.8))),
  notes: z.string().max(200).optional(),
});
export type DetectedItem = z.infer<typeof DetectedItemSchema>;

export const VisionDetectionResultSchema = z.object({
  isWaste: z.boolean(),
  overallConfidence: z
    .any()
    .transform((v) => Math.max(0, Math.min(1, typeof v === 'number' ? v : 0.8))),
  items: z.array(DetectedItemSchema).max(8),
  warnings: z.array(z.string()).default([]),
});
export type VisionDetectionResult = z.infer<typeof VisionDetectionResultSchema>;

export const ScanResponseSchema = z.object({
  scan: z.object({
    id: z.string(),
    mode: z.enum(SCAN_MODES),
    model: z.string(),
    latencyMs: z.number(),
    items: z.array(DetectedItemSchema),
    overallConfidence: z.number(),
    warnings: z.array(z.string()),
    createdAt: z.string().optional(),
  }),
  imageUrls: z.array(z.string()),
  matchedIdeas: z.array(z.any()), // array of IdeaPublic
});
export type ScanResponse = z.infer<typeof ScanResponseSchema>;

export const PatchScanItemsInputSchema = z.object({
  items: z.array(
    z.object({
      wasteTypeSlug: z.string(),
      pieces: z.number().int().min(1).default(1),
    })
  ),
});
export type PatchScanItemsInput = z.infer<typeof PatchScanItemsInputSchema>;

export const SuggestIdeasInputSchema = z.object({
  regenerate: z.boolean().optional(),
});
export type SuggestIdeasInput = z.infer<typeof SuggestIdeasInputSchema>;

export const GeneratedIdeaDraftSchema = z.object({
  titleEn: z.string().min(2).max(120),
  titleUr: z.string().max(150).nullable().optional(),
  summaryEn: z.string().min(5).max(300),
  summaryUr: z.string().max(350).nullable().optional(),
  difficulty: z
    .any()
    .transform((v) => Math.max(1, Math.min(3, Math.round(Number(v) || 1)))),
  timeMinutes: z
    .any()
    .transform((v) => Math.max(5, Math.min(480, Math.round(Number(v) || 15)))),
  costPkr: z
    .any()
    .transform((v) => Math.max(0, Math.min(2000, Math.round(Number(v) || 0)))),
  sellPricePkr: z
    .any()
    .transform((v) => (v != null && v !== '' ? Math.max(0, Math.min(5000, Math.round(Number(v)))) : null)),
  materials: z
    .array(
      z.object({
        nameEn: z.string().min(1),
        nameUr: z.string().nullable().optional(),
        quantity: z.string().nullable().optional(),
        isWaste: z.boolean().default(false),
      })
    )
    .optional()
    .default([]),
  tools: z
    .array(
      z.object({
        nameEn: z.string().min(1),
        nameUr: z.string().nullable().optional(),
      })
    )
    .optional()
    .default([]),
  steps: z.array(
    z.object({
      position: z.number().int().optional(),
      textEn: z.string().min(3),
      textUr: z.string().nullable().optional(),
      tipEn: z.string().nullable().optional(),
      tipUr: z.string().nullable().optional(),
      timerSeconds: z.number().int().positive().nullable().optional(),
    })
  ),
  safetyNoteEn: z.string().default('Use safe tools and craft with care.'),
  safetyNoteUr: z.string().nullable().optional(),
  wasteUsed: z
    .array(
      z.object({
        wasteTypeSlug: z.string(),
        pieces: z.number().int().min(1).default(1),
      })
    )
    .optional()
    .default([]),
});
export type GeneratedIdeaDraft = z.infer<typeof GeneratedIdeaDraftSchema>;

export const IdeaGenerationResponseSchema = z.union([
  z.object({
    ideas: z.array(GeneratedIdeaDraftSchema),
  }),
  z.array(GeneratedIdeaDraftSchema).transform((ideas) => ({ ideas })),
]);
export type IdeaGenerationResponse = z.infer<typeof IdeaGenerationResponseSchema>;

export const AssistantInputSchema = z.object({
  message: z.string().min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(1000),
      })
    )
    .optional(),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

export const AdaptMaterialsInputSchema = z.object({
  have: z.array(z.string().min(1).max(100)).min(1),
});
export type AdaptMaterialsInput = z.infer<typeof AdaptMaterialsInputSchema>;

export const AdaptMaterialsResultSchema = z.object({
  materialsMap: z.array(
    z.object({
      need: z.string(),
      use: z.string(),
      note: z.string().optional(),
    })
  ),
  notes: z.string().optional(),
});
export type AdaptMaterialsResult = z.infer<typeof AdaptMaterialsResultSchema>;

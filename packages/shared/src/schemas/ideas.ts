import { z } from 'zod';
import { IDEA_STATUSES } from '../constants.js';

export const IdeaWasteItemSchema = z.object({
  slug: z.string(),
  nameEn: z.string().optional(),
  nameUr: z.string().optional(),
  pieces: z.number().int().min(1).default(1),
  grams: z.number().int().min(1),
});
export type IdeaWasteItem = z.infer<typeof IdeaWasteItemSchema>;

export const IdeaMaterialItemSchema = z.object({
  nameEn: z.string().min(1),
  nameUr: z.string().nullable().optional(),
  quantity: z.string().nullable().optional(),
  isWaste: z.boolean().default(false),
});
export type IdeaMaterialItem = z.infer<typeof IdeaMaterialItemSchema>;

export const IdeaToolItemSchema = z.object({
  nameEn: z.string().min(1),
  nameUr: z.string().nullable().optional(),
});
export type IdeaToolItem = z.infer<typeof IdeaToolItemSchema>;

export const IdeaStepItemSchema = z.object({
  position: z.number().int().min(1),
  textEn: z.string().min(1),
  textUr: z.string().nullable().optional(),
  tipEn: z.string().nullable().optional(),
  tipUr: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  timerSeconds: z.number().int().positive().nullable().optional(),
});
export type IdeaStepItem = z.infer<typeof IdeaStepItemSchema>;

export const IdeaPublicSchema = z.object({
  id: z.string(),
  slug: z.string(),
  status: z.enum(IDEA_STATUSES),
  isAi: z.boolean(),
  published: z.boolean().optional(),
  titleEn: z.string(),
  titleUr: z.string().nullable().optional(),
  summaryEn: z.string(),
  summaryUr: z.string().nullable().optional(),
  difficulty: z.number().int().min(1).max(3),
  timeMinutes: z.number().int().min(1),
  costPkr: z.number().int().min(0),
  sellPricePkr: z.number().int().nullable().optional(),
  profitPerHourPkr: z.number().int().min(0),
  wasteGrams: z.number().int().min(0),
  co2SavedG: z.number().int().min(0),
  coverImage: z.string().nullable().optional(),
  safetyNoteEn: z.string(),
  safetyNoteUr: z.string().nullable().optional(),
  isSampleData: z.boolean().default(false),
  waste: z.array(IdeaWasteItemSchema),
  materials: z.array(IdeaMaterialItemSchema),
  tools: z.array(IdeaToolItemSchema),
  steps: z.array(IdeaStepItemSchema),
  stats: z.object({
    makes: z.number().int().min(0),
    workedPct: z.number().min(0).max(100),
    avgRating: z.number().min(0).max(5),
    avgTimeFeltMin: z.number().min(0),
  }),
  viewerState: z
    .object({
      saved: z.boolean(),
      made: z.boolean(),
    })
    .optional(),
});
export type IdeaPublic = z.infer<typeof IdeaPublicSchema>;

export const IdeasQuerySchema = z.object({
  waste: z.string().optional(), // comma-separated slugs e.g. "plastic-bottle,bottle-cap"
  matchAll: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
  q: z.string().optional(),
  difficulty: z.coerce.number().int().min(1).max(3).optional(),
  maxTime: z.coerce.number().int().positive().optional(),
  maxCost: z.coerce.number().int().min(0).optional(),
  canSell: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
  status: z.enum(['TESTED', 'UNTESTED']).optional(),
  sort: z.enum(['match', 'time', 'cost', 'profit', 'impact']).default('match').optional(),
  includeMine: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type IdeasQuery = z.infer<typeof IdeasQuerySchema>;

export const CreateIdeaInputSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  status: z.enum(IDEA_STATUSES).default('UNTESTED'),
  published: z.boolean().default(true),
  titleEn: z.string().min(3).max(120),
  titleUr: z.string().max(150).nullable().optional(),
  summaryEn: z.string().min(10).max(300),
  summaryUr: z.string().max(350).nullable().optional(),
  difficulty: z.number().int().min(1).max(3),
  timeMinutes: z.number().int().min(5).max(480),
  costPkr: z.number().int().min(0).max(10000),
  sellPricePkr: z.number().int().min(0).max(50000).nullable().optional(),
  safetyNoteEn: z.string().min(5),
  safetyNoteUr: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  isSampleData: z.boolean().default(false),
  waste: z
    .array(
      z.object({
        wasteTypeId: z.string(),
        pieces: z.number().int().min(1).default(1),
        grams: z.number().int().positive().optional(),
      })
    )
    .min(1, 'At least one waste type is required'),
  materials: z
    .array(
      z.object({
        nameEn: z.string().min(1),
        nameUr: z.string().nullable().optional(),
        quantity: z.string().nullable().optional(),
        isWaste: z.boolean().default(false),
      })
    )
    .default([]),
  tools: z
    .array(
      z.object({
        nameEn: z.string().min(1),
        nameUr: z.string().nullable().optional(),
      })
    )
    .default([]),
  steps: z
    .array(
      z.object({
        position: z.number().int().min(1),
        textEn: z.string().min(3),
        textUr: z.string().nullable().optional(),
        tipEn: z.string().nullable().optional(),
        tipUr: z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional(),
        timerSeconds: z.number().int().positive().nullable().optional(),
      })
    )
    .min(1, 'At least one step is required'),
});
export type CreateIdeaInput = z.infer<typeof CreateIdeaInputSchema>;

export const UpdateIdeaInputSchema = CreateIdeaInputSchema.partial();
export type UpdateIdeaInput = z.infer<typeof UpdateIdeaInputSchema>;

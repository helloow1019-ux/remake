import { z } from 'zod';
import { BADGE_KEYS } from '../constants.js';

export const CreateImpactLogInputSchema = z.object({
  wasteTypeSlug: z.string().min(1),
  pieces: z.coerce.number().int().positive().optional(),
  grams: z.coerce.number().int().positive().optional(),
  note: z.string().max(200).optional(),
});
export type CreateImpactLogInput = z.infer<typeof CreateImpactLogInputSchema>;

export const BadgeItemSchema = z.object({
  id: z.string(),
  key: z.enum(BADGE_KEYS),
  nameEn: z.string(),
  nameUr: z.string(),
  descriptionEn: z.string(),
  descriptionUr: z.string(),
  icon: z.string(),
  earned: z.boolean(),
  awardedAt: z.string().nullable().optional(),
});
export type BadgeItem = z.infer<typeof BadgeItemSchema>;

export const ImpactSummaryResponseSchema = z.object({
  totals: z.object({
    wasteG: z.number().int(),
    co2G: z.number().int(),
    ideasMade: z.number().int(),
    moneyPkr: z.number().int(),
  }),
  weekly: z.array(
    z.object({
      weekStart: z.string(),
      wasteG: z.number().int(),
      co2G: z.number().int(),
    })
  ),
  byWaste: z.array(
    z.object({
      slug: z.string(),
      nameEn: z.string(),
      nameUr: z.string().optional(),
      wasteG: z.number().int(),
    })
  ),
  equivalents: z.array(
    z.object({
      key: z.string(),
      count: z.number(),
      labelEn: z.string(),
      labelUr: z.string(),
    })
  ),
  streak: z.object({
    current: z.number().int(),
    best: z.number().int(),
  }),
  badges: z.array(BadgeItemSchema),
});
export type ImpactSummaryResponse = z.infer<typeof ImpactSummaryResponseSchema>;

import { z } from 'zod';

export const WasteTypeSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameEn: z.string(),
  nameUr: z.string(),
  icon: z.string(),
  gramsPerPiece: z.number().int().positive(),
  co2PerKg: z.number().positive(),
  factorSource: z.string().min(1),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
  ideaCount: z.number().int().optional(),
});
export type WasteType = z.infer<typeof WasteTypeSchema>;

export const CreateWasteTypeInputSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  nameEn: z.string().min(1).max(100),
  nameUr: z.string().min(1).max(100),
  icon: z.string().min(1).max(50),
  gramsPerPiece: z.number().int().positive(),
  co2PerKg: z.number().positive(),
  factorSource: z.string().min(3),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});
export type CreateWasteTypeInput = z.infer<typeof CreateWasteTypeInputSchema>;

export const UpdateWasteTypeInputSchema = CreateWasteTypeInputSchema.partial();
export type UpdateWasteTypeInput = z.infer<typeof UpdateWasteTypeInputSchema>;

import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameEn: z.string(),
  nameUr: z.string().nullable().optional(),
  descriptionEn: z.string(),
  pricePkr: z.number().int().positive(),
  image: z.string().nullable().optional(),
  wasteTypeSlugs: z.string(),
  wasteGrams: z.number().int().min(0),
  co2SavedG: z.number().int().min(0),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export type Product = z.infer<typeof ProductSchema>;

export const CreateProductInputSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  nameEn: z.string().min(2).max(120),
  nameUr: z.string().max(150).nullable().optional(),
  descriptionEn: z.string().min(5).max(500),
  pricePkr: z.number().int().positive(),
  image: z.string().nullable().optional(),
  wasteTypeSlugs: z.string().min(1),
  wasteGrams: z.number().int().min(0),
  co2SavedG: z.number().int().min(0),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;

export const UpdateProductInputSchema = CreateProductInputSchema.partial();
export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;

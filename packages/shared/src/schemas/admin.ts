import { z } from 'zod';
import { SUGGESTION_KINDS, SUGGESTION_STATUSES } from '../constants.js';

export const CreateSuggestionInputSchema = z.object({
  kind: z.enum(SUGGESTION_KINDS),
  text: z.string().min(3).max(500),
});
export type CreateSuggestionInput = z.infer<typeof CreateSuggestionInputSchema>;

export const UpdateSuggestionInputSchema = z.object({
  status: z.enum(SUGGESTION_STATUSES),
});
export type UpdateSuggestionInput = z.infer<typeof UpdateSuggestionInputSchema>;

export const PublicSettingsSchema = z.object({
  whatsappNumber: z.string(),
  instagramUrl: z.string(),
  siteName: z.string(),
  kioskLock: z.boolean(),
});
export type PublicSettings = z.infer<typeof PublicSettingsSchema>;

export const AdminSettingsSchema = z.object({
  whatsapp_number: z.string().optional(),
  instagram_url: z.string().optional(),
  site_name: z.string().optional(),
  scan_daily_quota: z.string().optional(),
  scan_hourly_quota: z.string().optional(),
  kiosk_lock: z.string().optional(),
  reuse_displacement: z.string().optional(),
});
export type AdminSettings = z.infer<typeof AdminSettingsSchema>;

export const ImportPreviewRowSchema = z.object({
  rowNumber: z.number(),
  slug: z.string(),
  titleEn: z.string(),
  wasteTypes: z.string(),
  timeMinutes: z.number(),
  difficulty: z.number(),
  costPkr: z.number(),
  sellPricePkr: z.number().nullable().optional(),
  isValid: z.boolean(),
  errors: z.array(z.string()),
});
export type ImportPreviewRow = z.infer<typeof ImportPreviewRowSchema>;

export const ImportPreviewResponseSchema = z.object({
  totalRows: z.number(),
  validRows: z.number(),
  invalidRows: z.number(),
  rows: z.array(ImportPreviewRowSchema),
});
export type ImportPreviewResponse = z.infer<typeof ImportPreviewResponseSchema>;

export const TodayStatsResponseSchema = z.object({
  makesToday: z.number().int(),
  wasteGToday: z.number().int(),
  scansToday: z.number().int(),
  visitorsToday: z.number().int(),
});
export type TodayStatsResponse = z.infer<typeof TodayStatsResponseSchema>;

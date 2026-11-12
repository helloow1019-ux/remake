import { z } from 'zod';
import { MAKE_OUTCOMES, MAKE_STATUSES } from '../constants.js';

export const CreateMakeInputSchema = z.object({
  outcome: z.enum(MAKE_OUTCOMES),
  timeTakenMin: z.coerce.number().int().min(1).max(1440).optional(),
  difficultyFelt: z.coerce.number().int().min(1).max(3).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  notes: z.string().max(1000).optional(),
});
export type CreateMakeInput = z.infer<typeof CreateMakeInputSchema>;

export const UpdateMakeInputSchema = z.object({
  outcome: z.enum(MAKE_OUTCOMES).optional(),
  timeTakenMin: z.number().int().min(1).max(1440).optional(),
  difficultyFelt: z.number().int().min(1).max(3).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(1000).optional(),
});
export type UpdateMakeInput = z.infer<typeof UpdateMakeInputSchema>;

export const ModerateMakeInputSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().max(200).optional(),
});
export type ModerateMakeInput = z.infer<typeof ModerateMakeInputSchema>;

export const BulkModerateInputSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().max(200).optional(),
});
export type BulkModerateInput = z.infer<typeof BulkModerateInputSchema>;

export const CommunityMakeItemSchema = z.object({
  id: z.string(),
  ideaId: z.string(),
  ideaSlug: z.string(),
  ideaTitleEn: z.string(),
  ideaTitleUr: z.string().nullable().optional(),
  outcome: z.enum(MAKE_OUTCOMES),
  timeTakenMin: z.number().nullable().optional(),
  difficultyFelt: z.number().nullable().optional(),
  rating: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  createdAt: z.string(),
  userName: z.string(),
  likesCount: z.number().int().default(0),
  hasLiked: z.boolean().default(false),
});
export type CommunityMakeItem = z.infer<typeof CommunityMakeItemSchema>;

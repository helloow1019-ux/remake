import { z } from 'zod';
import { USER_ROLES } from '../constants.js';

export const RegisterInputSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const UpdateMeInputSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  locale: z.enum(['en', 'ur']).optional(),
  theme: z.enum(['system', 'light', 'dark']).optional(),
});
export type UpdateMeInput = z.infer<typeof UpdateMeInputSchema>;

export const DeleteMeInputSchema = z.object({
  password: z.string().optional(),
});
export type DeleteMeInput = z.infer<typeof DeleteMeInputSchema>;

export const SessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable().optional(),
  isGuest: z.boolean(),
  role: z.enum(USER_ROLES),
  locale: z.string(),
  theme: z.string(),
});
export type SessionUser = z.infer<typeof SessionUserSchema>;

export const SessionResponseSchema = z.object({
  user: SessionUserSchema,
  quota: z.object({
    scansToday: z.number(),
    scansLimit: z.number(),
  }),
});
export type SessionResponse = z.infer<typeof SessionResponseSchema>;

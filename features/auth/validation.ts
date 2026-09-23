import { z } from "zod";

export const registerSchema = z.object({
  displayName: z.string().trim().min(2).max(60),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,30}$/),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(10).max(128),
});
export const profileSchema = z.object({ displayName: z.string().trim().min(2).max(60), bio: z.string().trim().max(280).optional() });

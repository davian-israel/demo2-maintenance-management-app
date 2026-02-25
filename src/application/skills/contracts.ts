import { z } from "zod";

export const createSkillSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(300).optional().nullable(),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;

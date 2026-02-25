import { z } from "zod";

export const teamMemberSkillSchema = z.object({
  skillId: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(80),
  skillPercentage: z.number().int().min(0).max(100),
});

export const assignTeamMemberSkillSchema = z.object({
  skillId: z.string().trim().min(1).max(80),
  skillPercentage: z.number().int().min(0).max(100),
});

export const createTeamMemberSchema = z
  .object({
    teamMemberId: z.string().trim().min(1).max(80).optional(),
    name: z.string().trim().min(2).max(120),
    skills: z.array(teamMemberSkillSchema).default([]),
  })
  .superRefine((value, context) => {
    const seenSkillIds = new Set<string>();

    value.skills.forEach((skill, index) => {
      const normalizedSkillId = skill.skillId.toLowerCase();
      if (seenSkillIds.has(normalizedSkillId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duplicate skillId values are not allowed in a single team member payload.",
          path: ["skills", index, "skillId"],
        });
      }
      seenSkillIds.add(normalizedSkillId);
    });
  });

export const assignSkillsToTeamMemberSchema = z.object({
  skills: z.array(assignTeamMemberSkillSchema).default([]),
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type AssignSkillsToTeamMemberInput = z.infer<typeof assignSkillsToTeamMemberSchema>;

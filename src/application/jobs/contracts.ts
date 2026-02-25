import { z } from "zod";
import { JOB_PRIORITIES, RUN_OUTCOMES } from "@/domain/job/types";

const dueDateSchema = z.coerce.date();

export const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().max(2000).optional().nullable(),
  assetId: z.string().optional().nullable(),
  assetName: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  subLocation: z.string().optional().nullable(),
  priority: z.enum(JOB_PRIORITIES).default("Medium"),
  dueDate: dueDateSchema,
  assignedTo: z.string().optional().nullable(),
  doneBy: z.string().optional().nullable(),
  checkedBy: z.string().optional().nullable(),
  requiredSkills: z.array(z.string()).default([]),
});

export const logRunSchema = z.object({
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date().optional().nullable(),
  performedBy: z.string().min(2),
  notes: z.string().min(2),
  outcome: z.enum(RUN_OUTCOMES),
  timeSpentMinutes: z.number().int().positive().optional().nullable(),
});

export const cancelJobSchema = z.object({
  reason: z.string().min(2),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type LogRunInput = z.infer<typeof logRunSchema>;
export type CancelJobInput = z.infer<typeof cancelJobSchema>;

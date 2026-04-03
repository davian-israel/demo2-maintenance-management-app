import { z } from "zod";
import { OBSERVATION_STATUSES } from "@/domain/checklist/types";

export const upsertSectorSchema = z.object({
  name: z.string().min(2),
  components: z.array(
    z.object({
      name: z.string().min(2),
      required: z.boolean().default(true),
      displayOrder: z.number().int().nonnegative().optional(),
    }),
  ).min(1),
});

export const createInspectionSessionSchema = z.object({
  inspector: z.string().min(2),
  inspectedAt: z.coerce.date().optional(),
  notes: z.string().max(2000).optional().nullable(),
  observations: z
    .array(
      z.object({
        sectorName: z.string().min(2),
        componentName: z.string().min(2),
        status: z.enum(OBSERVATION_STATUSES),
        observedAt: z.coerce.date().optional(),
        comments: z.string().max(2000).optional().nullable(),
        additionalNotes: z.string().max(2000).optional().nullable(),
      }),
    )
    .default([]),
});

export const recordObservationSchema = z.object({
  sectorName: z.string().min(2),
  componentName: z.string().min(2),
  status: z.enum(OBSERVATION_STATUSES),
  observedAt: z.coerce.date().optional(),
  comments: z.string().max(2000).optional().nullable(),
  additionalNotes: z.string().max(2000).optional().nullable(),
});

export type RecordObservationInput = z.infer<typeof recordObservationSchema>;

export const getTrendsSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type UpsertSectorInput = z.infer<typeof upsertSectorSchema>;
export type CreateInspectionSessionInput = z.infer<typeof createInspectionSessionSchema>;
export type GetTrendsInput = z.infer<typeof getTrendsSchema>;

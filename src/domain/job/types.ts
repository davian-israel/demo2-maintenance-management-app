import type { ObservationStatus } from "@/domain/checklist/types";

export const JOB_STATUSES = [
  "Draft",
  "Scheduled",
  "InProgress",
  "Completed",
  "Cancelled",
  "OnHold",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

export type JobPriority = (typeof JOB_PRIORITIES)[number];

export const RUN_OUTCOMES = [
  "ProgressMade",
  "Blocked",
  "NoAccess",
  "Failed",
  "CompletedWork",
] as const;

export type RunOutcome = (typeof RUN_OUTCOMES)[number];

export type AssetRef = {
  assetId: string;
  name: string;
};

export type RunLogEntry = {
  id: string;
  startedAt: Date;
  endedAt: Date | null;
  performedBy: string;
  notes: string;
  outcome: RunOutcome;
  timeSpentMinutes: number | null;
};

export type JobProps = {
  id: string;
  title: string;
  description: string | null;
  assetRef: AssetRef | null;
  location: string | null;
  subLocation: string | null;
  priority: JobPriority;
  status: JobStatus;
  createdAt: Date;
  scheduledFor: Date | null;
  dueDate: Date;
  assignedTo: string | null;
  doneBy: string | null;
  checkedBy: string | null;
  requiredSkills: string[];
  runLog: RunLogEntry[];
  completedAt: Date | null;
  cancelledReason: string | null;
  sourceObservationId: string | null;
  sourceObservationContext: {
    sessionId: string;
    sectorName: string;
    componentName: string;
    status: ObservationStatus;
  } | null;
  version: number;
};

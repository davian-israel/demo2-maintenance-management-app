import { randomUUID } from "node:crypto";
import type { JobProps, JobStatus, RunLogEntry, RunOutcome } from "@/domain/job/types";

class DomainError extends Error {}

export class Job {
  private props: JobProps;

  private constructor(props: JobProps) {
    this.props = props;
  }

  static create(input: Omit<JobProps, "id" | "createdAt" | "runLog" | "completedAt" | "cancelledReason" | "version">) {
    const now = new Date();
    if (input.dueDate < now) {
      throw new DomainError("Due date must be in the future when creating a job.");
    }

    return new Job({
      ...input,
      id: randomUUID(),
      createdAt: now,
      runLog: [],
      completedAt: null,
      cancelledReason: null,
      version: 1,
    });
  }

  static rehydrate(props: JobProps) {
    return new Job(props);
  }

  get snapshot() {
    return structuredClone(this.props);
  }

  assignTo(userId: string) {
    this.ensureActiveLifecycle();
    this.props.assignedTo = userId;
    if (this.props.status === "Draft") {
      this.props.status = "Scheduled";
    }
  }

  setDueDate(dueDate: Date) {
    if (dueDate < this.props.createdAt) {
      throw new DomainError("Due date cannot be before creation date.");
    }
    this.props.dueDate = dueDate;
    if (this.props.status === "Draft") {
      this.props.status = "Scheduled";
    }
  }

  requireSkills(skillIds: string[]) {
    this.ensureActiveLifecycle();
    this.props.requiredSkills = [...new Set(skillIds)];
  }

  start() {
    if (!["Scheduled", "InProgress", "OnHold"].includes(this.props.status)) {
      throw new DomainError("Job can only be started from Scheduled or resumed from OnHold.");
    }
    this.props.status = "InProgress";
  }

  moveToOnHold() {
    if (this.props.status !== "InProgress") {
      throw new DomainError("Only in-progress jobs can be moved to OnHold.");
    }
    this.props.status = "OnHold";
  }

  logRun(input: {
    startedAt: Date;
    endedAt: Date | null;
    performedBy: string;
    notes: string;
    outcome: RunOutcome;
    timeSpentMinutes: number | null;
  }) {
    if (!["Scheduled", "InProgress", "OnHold"].includes(this.props.status)) {
      throw new DomainError("Runs can only be logged when a job is active.");
    }

    if (input.endedAt && input.endedAt < input.startedAt) {
      throw new DomainError("Run end time cannot be before start time.");
    }

    const hasActiveRun = this.props.runLog.some((run) => run.endedAt === null);
    if (hasActiveRun && input.endedAt === null) {
      throw new DomainError("Only one active run is allowed at a time.");
    }

    const run: RunLogEntry = {
      id: randomUUID(),
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      performedBy: input.performedBy,
      notes: input.notes,
      outcome: input.outcome,
      timeSpentMinutes: input.timeSpentMinutes,
    };

    this.props.runLog.push(run);

    if (this.props.status === "Scheduled") {
      this.props.status = "InProgress";
    }
  }

  complete() {
    if (!["InProgress", "OnHold", "Scheduled"].includes(this.props.status)) {
      throw new DomainError("Only active jobs can be completed.");
    }

    if (this.props.runLog.length === 0) {
      throw new DomainError("Completion requires at least one run log entry.");
    }

    const hasActiveRun = this.props.runLog.some((run) => run.endedAt === null);
    if (hasActiveRun) {
      throw new DomainError("Cannot complete while there is an active run.");
    }

    this.props.status = "Completed";
    this.props.completedAt = new Date();
    this.props.cancelledReason = null;
  }

  cancel(reason: string) {
    if (this.props.status === "Completed") {
      throw new DomainError("Completed jobs cannot be cancelled.");
    }
    this.props.status = "Cancelled";
    this.props.cancelledReason = reason;
  }

  updateDetails(input: {
    title?: string;
    description?: string | null;
    location?: string | null;
    subLocation?: string | null;
    priority?: JobProps["priority"];
    assetRef?: JobProps["assetRef"];
    doneBy?: string | null;
    checkedBy?: string | null;
  }) {
    this.ensureActiveLifecycle();
    if (input.title) this.props.title = input.title;
    if (input.description !== undefined) this.props.description = input.description;
    if (input.location !== undefined) this.props.location = input.location;
    if (input.subLocation !== undefined) this.props.subLocation = input.subLocation;
    if (input.priority) this.props.priority = input.priority;
    if (input.assetRef !== undefined) this.props.assetRef = input.assetRef;
    if (input.doneBy !== undefined) this.props.doneBy = input.doneBy;
    if (input.checkedBy !== undefined) this.props.checkedBy = input.checkedBy;
  }

  transitionTo(status: JobStatus) {
    const current = this.props.status;
    const valid: Record<JobStatus, JobStatus[]> = {
      Draft: ["Scheduled", "Cancelled"],
      Scheduled: ["InProgress", "Cancelled"],
      InProgress: ["OnHold", "Completed", "Cancelled"],
      OnHold: ["InProgress", "Cancelled"],
      Completed: [],
      Cancelled: [],
    };

    if (!valid[current].includes(status)) {
      throw new DomainError(`Invalid transition from ${current} to ${status}.`);
    }

    this.props.status = status;
  }

  private ensureActiveLifecycle() {
    if (["Completed", "Cancelled"].includes(this.props.status)) {
      throw new DomainError("Completed or cancelled jobs are immutable.");
    }
  }
}

export function isDomainError(error: unknown): error is Error {
  return error instanceof Error && error.name === "Error";
}

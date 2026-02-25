import { Job } from "@/domain/job/job";
import type { JobProps } from "@/domain/job/types";
import { createJobSchema, logRunSchema, cancelJobSchema, type CreateJobInput, type LogRunInput, type CancelJobInput } from "@/application/jobs/contracts";
import type { JobRepository } from "@/application/jobs/job-repository";

type ObservationResolutionPort = {
  markObservationResolved(observationId: string): Promise<void>;
};

export class JobService {
  constructor(
    private readonly repository: JobRepository,
    private readonly resolutionPort?: ObservationResolutionPort,
  ) {}

  async createJob(input: CreateJobInput) {
    const valid = createJobSchema.parse(input);
    const job = Job.create({
      title: valid.title,
      description: valid.description ?? null,
      assetRef: valid.assetId && valid.assetName ? { assetId: valid.assetId, name: valid.assetName } : null,
      location: valid.location ?? null,
      subLocation: valid.subLocation ?? null,
      priority: valid.priority,
      status: "Scheduled",
      scheduledFor: null,
      dueDate: valid.dueDate,
      assignedTo: valid.assignedTo ?? null,
      doneBy: valid.doneBy ?? null,
      checkedBy: valid.checkedBy ?? null,
      requiredSkills: valid.requiredSkills,
      sourceObservationId: null,
      sourceObservationContext: null,
    });

    await this.repository.create(job.snapshot);
    return job.snapshot;
  }

  async listJobs(filters?: { status?: string; assignee?: string; requiredSkill?: string }) {
    return this.repository.list(filters);
  }

  async getJob(jobId: string) {
    return this.repository.getById(jobId);
  }

  async startJob(jobId: string): Promise<JobProps> {
    const job = await this.mustLoad(jobId);
    const aggregate = Job.rehydrate(job);
    aggregate.start();
    await this.repository.save(aggregate.snapshot);
    return aggregate.snapshot;
  }

  async completeJob(jobId: string): Promise<JobProps> {
    const job = await this.mustLoad(jobId);
    const aggregate = Job.rehydrate(job);
    aggregate.complete();
    await this.repository.save(aggregate.snapshot);
    if (aggregate.snapshot.sourceObservationId && this.resolutionPort) {
      await this.resolutionPort.markObservationResolved(aggregate.snapshot.sourceObservationId);
    }
    return aggregate.snapshot;
  }

  async cancelJob(jobId: string, input: CancelJobInput): Promise<JobProps> {
    const valid = cancelJobSchema.parse(input);
    const job = await this.mustLoad(jobId);
    const aggregate = Job.rehydrate(job);
    aggregate.cancel(valid.reason);
    await this.repository.save(aggregate.snapshot);
    return aggregate.snapshot;
  }

  async logRun(jobId: string, input: LogRunInput): Promise<JobProps> {
    const valid = logRunSchema.parse(input);
    const job = await this.mustLoad(jobId);
    const aggregate = Job.rehydrate(job);
    aggregate.logRun({
      startedAt: valid.startedAt,
      endedAt: valid.endedAt ?? null,
      performedBy: valid.performedBy,
      notes: valid.notes,
      outcome: valid.outcome,
      timeSpentMinutes: valid.timeSpentMinutes ?? null,
    });
    await this.repository.save(aggregate.snapshot);
    return aggregate.snapshot;
  }

  private async mustLoad(jobId: string) {
    const job = await this.repository.getById(jobId);
    if (!job) {
      throw new Error("Job not found.");
    }
    return job;
  }
}

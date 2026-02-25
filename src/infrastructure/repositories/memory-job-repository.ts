import type { JobRepository, JobListFilters } from "@/application/jobs/job-repository";
import type { JobProps } from "@/domain/job/types";
import { memoryStore } from "@/infrastructure/repositories/memory-store";

export class MemoryJobRepository implements JobRepository {
  async create(job: JobProps): Promise<void> {
    memoryStore.jobs.set(job.id, structuredClone(job));
  }

  async save(job: JobProps): Promise<void> {
    memoryStore.jobs.set(job.id, {
      ...structuredClone(job),
      version: job.version + 1,
    });
  }

  async getById(jobId: string): Promise<JobProps | null> {
    return structuredClone(memoryStore.jobs.get(jobId) ?? null);
  }

  async getBySourceObservationId(sourceObservationId: string): Promise<JobProps | null> {
    const job =
      [...memoryStore.jobs.values()].find(
        (entry) => entry.sourceObservationId === sourceObservationId,
      ) ?? null;
    return structuredClone(job);
  }

  async list(filters?: JobListFilters): Promise<JobProps[]> {
    const all = [...memoryStore.jobs.values()].map((job) => structuredClone(job));
    return all
      .filter((job) => {
        if (filters?.status && job.status !== filters.status) return false;
        if (filters?.assignee && job.assignedTo !== filters.assignee) return false;
        if (filters?.requiredSkill && !job.requiredSkills.includes(filters.requiredSkill)) return false;
        return true;
      })
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }
}

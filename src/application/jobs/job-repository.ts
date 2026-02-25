import type { JobProps } from "@/domain/job/types";

export type JobListFilters = {
  status?: string;
  assignee?: string;
  requiredSkill?: string;
};

export interface JobRepository {
  create(job: JobProps): Promise<void>;
  save(job: JobProps): Promise<void>;
  getById(jobId: string): Promise<JobProps | null>;
  getBySourceObservationId(sourceObservationId: string): Promise<JobProps | null>;
  list(filters?: JobListFilters): Promise<JobProps[]>;
}

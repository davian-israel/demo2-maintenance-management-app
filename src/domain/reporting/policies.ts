import type { JobProps } from "@/domain/job/types";

export const overduePolicy = {
  isOverdue(job: Pick<JobProps, "status" | "dueDate">, now: Date) {
    return !["Completed", "Cancelled"].includes(job.status) && job.dueDate < now;
  },
};

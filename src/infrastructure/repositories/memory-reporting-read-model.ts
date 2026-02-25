import type { ReportingReadModel, ReportingSummary } from "@/application/reporting/reporting-service";
import { memoryStore } from "@/infrastructure/repositories/memory-store";

export class MemoryReportingReadModel implements ReportingReadModel {
  async getSummary(year: number): Promise<ReportingSummary> {
    const jobs = [...memoryStore.jobs.values()];
    const observations = [...memoryStore.observations.values()];
    const now = new Date();
    const overdueJobs = jobs
      .filter((job) => !["Completed", "Cancelled"].includes(job.status) && job.dueDate < now)
      .map((job) => ({
        id: job.id,
        title: job.title,
        dueDate: job.dueDate.toISOString(),
        status: job.status,
        assignee: job.assignedTo,
        daysOverdue: Math.max(1, Math.floor((now.getTime() - job.dueDate.getTime()) / 86400000)),
      }));

    const monthly = Array.from({ length: 12 }).map((_, index) => {
      const month = index + 1;
      const createdCount = jobs.filter(
        (job) =>
          job.createdAt.getUTCFullYear() === year &&
          job.createdAt.getUTCMonth() + 1 === month,
      ).length;
      const completedCount = jobs.filter(
        (job) =>
          job.completedAt &&
          job.completedAt.getUTCFullYear() === year &&
          job.completedAt.getUTCMonth() + 1 === month,
      ).length;
      return {
        month: `${year}-${String(month).padStart(2, "0")}`,
        createdCount,
        completedCount,
      };
    });

    const unresolved = observations.filter(
      (observation) => observation.status === "Fail" && !observation.resolvedAt,
    );

    const unresolvedBySectorMap = new Map<string, number>();
    unresolved.forEach((observation) => {
      unresolvedBySectorMap.set(
        observation.sectorName,
        (unresolvedBySectorMap.get(observation.sectorName) ?? 0) + 1,
      );
    });

    const from = new Date(now.getTime() - 14 * 86400000);
    const failureTrendMap = new Map<string, number>();
    observations.forEach((observation) => {
      if (observation.status !== "Fail") return;
      if (observation.observedAt < from || observation.observedAt > now) return;
      const bucket = observation.observedAt.toISOString().slice(0, 10);
      failureTrendMap.set(bucket, (failureTrendMap.get(bucket) ?? 0) + 1);
    });

    return {
      overdueCount: overdueJobs.length,
      overdueJobs,
      monthly,
      unresolvedFindingsCount: unresolved.length,
      unresolvedBySector: [...unresolvedBySectorMap.entries()].map(([sectorName, failures]) => ({
        sectorName,
        failures,
      })),
      failureTrends: [...failureTrendMap.entries()]
        .map(([bucket, failures]) => ({ bucket, failures }))
        .sort((a, b) => a.bucket.localeCompare(b.bucket)),
      sourceLinkedJobsCount: jobs.filter((job) => job.sourceObservationId).length,
    };
  }
}

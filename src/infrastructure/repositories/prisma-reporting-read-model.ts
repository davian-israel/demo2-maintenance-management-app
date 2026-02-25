import type { ReportingReadModel, ReportingSummary } from "@/application/reporting/reporting-service";
import { prisma } from "@/infrastructure/prisma/client";

export class PrismaReportingReadModel implements ReportingReadModel {
  async getSummary(year: number): Promise<ReportingSummary> {
    const now = new Date();
    const overdueRows = await prisma.job.findMany({
      where: {
        status: {
          notIn: ["Completed", "Cancelled"],
        },
        dueDate: {
          lt: now,
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
        assignedTo: true,
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 20,
    });

    const monthly = await Promise.all(
      Array.from({ length: 12 }).map(async (_, index) => {
        const monthIndex = index + 1;
        const start = new Date(Date.UTC(year, index, 1));
        const end = new Date(Date.UTC(year, monthIndex, 1));

        const [createdCount, completedCount] = await Promise.all([
          prisma.job.count({
            where: {
              createdAt: {
                gte: start,
                lt: end,
              },
            },
          }),
          prisma.job.count({
            where: {
              completedAt: {
                gte: start,
                lt: end,
              },
            },
          }),
        ]);

        return {
          month: `${year}-${String(monthIndex).padStart(2, "0")}`,
          createdCount,
          completedCount,
        };
      }),
    );

    const unresolvedRows = await prisma.observation.findMany({
      where: {
        status: "Fail",
        resolvedAt: null,
      },
      include: {
        sector: true,
      },
    });

    const unresolvedBySectorMap = new Map<string, number>();
    unresolvedRows.forEach((row) => {
      unresolvedBySectorMap.set(
        row.sector.name,
        (unresolvedBySectorMap.get(row.sector.name) ?? 0) + 1,
      );
    });

    const trendFrom = new Date(now.getTime() - 14 * 86400000);
    const trendRows = await prisma.observation.findMany({
      where: {
        status: "Fail",
        observedAt: {
          gte: trendFrom,
          lte: now,
        },
      },
      select: {
        observedAt: true,
      },
    });

    const trendMap = new Map<string, number>();
    trendRows.forEach((row) => {
      const bucket = row.observedAt.toISOString().slice(0, 10);
      trendMap.set(bucket, (trendMap.get(bucket) ?? 0) + 1);
    });

    const sourceLinkedJobsCount = await prisma.job.count({
      where: {
        sourceObservationId: {
          not: null,
        },
      },
    });

    return {
      overdueCount: overdueRows.length,
      overdueJobs: overdueRows.map((job) => ({
        id: job.id,
        title: job.title,
        dueDate: job.dueDate.toISOString(),
        status: job.status,
        assignee: job.assignedTo,
        daysOverdue: Math.max(1, Math.floor((now.getTime() - job.dueDate.getTime()) / 86400000)),
      })),
      monthly,
      unresolvedFindingsCount: unresolvedRows.length,
      unresolvedBySector: [...unresolvedBySectorMap.entries()]
        .map(([sectorName, failures]) => ({ sectorName, failures }))
        .sort((a, b) => b.failures - a.failures),
      failureTrends: [...trendMap.entries()]
        .map(([bucket, failures]) => ({ bucket, failures }))
        .sort((a, b) => a.bucket.localeCompare(b.bucket)),
      sourceLinkedJobsCount,
    };
  }
}

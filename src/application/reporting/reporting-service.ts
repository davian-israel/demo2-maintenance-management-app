export type MonthlyStats = {
  month: string;
  createdCount: number;
  completedCount: number;
};

export type ReportingSummary = {
  overdueCount: number;
  overdueJobs: Array<{
    id: string;
    title: string;
    dueDate: string;
    status: string;
    assignee: string | null;
    daysOverdue: number;
  }>;
  monthly: MonthlyStats[];
  unresolvedFindingsCount: number;
  unresolvedBySector: Array<{
    sectorName: string;
    failures: number;
  }>;
  failureTrends: Array<{
    bucket: string;
    failures: number;
  }>;
  sourceLinkedJobsCount: number;
};

export interface ReportingReadModel {
  getSummary(year: number): Promise<ReportingSummary>;
}

export class ReportingService {
  constructor(private readonly readModel: ReportingReadModel) {}

  getSummary(year = new Date().getUTCFullYear()) {
    return this.readModel.getSummary(year);
  }
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Job = {
  id: string;
  title: string;
  dueDate: string | Date;
  status: string;
  priority: string;
  location: string | null;
  subLocation: string | null;
  assignedTo: string | null;
  doneBy: string | null;
  checkedBy: string | null;
  runLog: Array<{
    id: string;
    timeSpentMinutes: number | null;
    outcome: string;
  }>;
};

type Finding = {
  observationId: string;
  sectorName: string;
  componentName: string;
  linkedJobStatus: string | null;
};

type FailureTrend = {
  bucket: string;
  failures: number;
};

type ReportSummary = {
  overdueCount: number;
  overdueJobs: Array<{
    id: string;
    title: string;
    dueDate: string | Date;
    status: string;
    assignee: string | null;
    daysOverdue: number;
  }>;
  monthly: Array<{
    month: string;
    createdCount: number;
    completedCount: number;
  }>;
  unresolvedFindingsCount: number;
  unresolvedBySector: Array<{ sectorName: string; failures: number }>;
  failureTrends: FailureTrend[];
  sourceLinkedJobsCount: number;
};

const COLORS = {
  primary: "#0b7285",
  secondary: "#16a34a",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
};

const STATUS_COLORS: Record<string, string> = {
  Scheduled: COLORS.primary,
  InProgress: COLORS.warning,
  Completed: COLORS.secondary,
  Cancelled: COLORS.danger,
  OnHold: COLORS.purple,
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: COLORS.danger,
  High: COLORS.warning,
  Medium: COLORS.info,
  Low: COLORS.secondary,
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }

  return data as T;
}

type DashboardData = {
  jobs: Job[];
  summary: ReportSummary;
  findings: Finding[];
  trends: FailureTrend[];
};

export function MaintenanceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsResponse, summaryResponse, findingsResponse, trendsResponse] = await Promise.all([
        request<{ jobs: Job[] }>("/api/jobs"),
        request<{ summary: ReportSummary }>("/api/reports/summary"),
        request<{ findings: Finding[] }>("/api/checklist/findings/unresolved"),
        request<{ trends: FailureTrend[] }>("/api/checklist/trends"),
      ]);

      setData({
        jobs: jobsResponse.jobs,
        summary: summaryResponse.summary,
        findings: findingsResponse.findings,
        trends: trendsResponse.trends,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    if (!data) return null;

    const totalJobs = data.jobs.length;
    const statusCounts = data.jobs.reduce(
      (acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const priorityCounts = data.jobs.reduce(
      (acc, job) => {
        acc[job.priority] = (acc[job.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalRunTime = data.jobs.reduce(
      (sum, job) => sum + job.runLog.reduce((s, r) => s + (r.timeSpentMinutes || 0), 0),
      0,
    );

    const avgCompletionTime = (() => {
      const completedJobs = data.jobs.filter((j) => j.status === "Completed");
      if (completedJobs.length === 0) return 0;
      return Math.round(totalRunTime / completedJobs.length);
    })();

    const monthly = data.summary.monthly;
    const currentMonth = monthly[monthly.length - 1] || { createdCount: 0, completedCount: 0 };

    const completionRate = currentMonth.createdCount > 0
      ? Math.round((currentMonth.completedCount / currentMonth.createdCount) * 100)
      : 0;

    const jobsCreatedThisMonth = currentMonth.createdCount;
    const jobsCompletedThisMonth = currentMonth.completedCount;

    return {
      totalJobs,
      statusCounts,
      priorityCounts,
      totalRunTime,
      avgCompletionTime,
      completionRate,
      jobsCreatedThisMonth,
      jobsCompletedThisMonth,
      overdueCount: data.summary.overdueCount,
      unresolvedFindings: data.summary.unresolvedFindingsCount,
      sourceLinkedJobs: data.summary.sourceLinkedJobsCount,
    };
  }, [data]);

  const statusPieData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.statusCounts).map(([name, value]) => ({ name, value }));
  }, [stats]);

  const priorityBarData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.priorityCounts).map(([name, value]) => ({ name, value }));
  }, [stats]);

  const monthlyChartData = useMemo(() => {
    if (!data) return [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return data.summary.monthly.map((m) => ({
      name: monthNames[parseInt(m.month.split("-")[1], 10) - 1],
      Created: m.createdCount,
      Completed: m.completedCount,
    }));
  }, [data]);

  const failureTrendData = useMemo(() => {
    if (!data) return [];
    return data.summary.failureTrends.slice(-14).map((t) => ({
      name: t.bucket.slice(5),
      Failures: t.failures,
    }));
  }, [data]);

  const findingsBySectorData = useMemo(() => {
    if (!data) return [];
    return data.summary.unresolvedBySector.slice(0, 8).map((s) => ({
      name: s.sectorName,
      Findings: s.failures,
    }));
  }, [data]);

  const recentOverdueJobs = useMemo(() => {
    if (!data) return [];
    return data.summary.overdueJobs.slice(0, 5);
  }, [data]);

  if (loading) {
    return (
      <main className="app-shell">
        <section className="hero-card">
          <div>
            <p className="eyebrow">Maintenance Management</p>
            <h1>Dashboard</h1>
            <p className="subtle">Loading dashboard data...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Maintenance Management</p>
          <h1>Maintenance Dashboard</h1>
          <p className="subtle">
            Real-time overview of maintenance operations, job status, and inspection findings.
          </p>
          <div className="actions" style={{ marginTop: "1rem" }}>
            <Link className="btn-primary" href="/maintenance/check" data-testid="dashboard-maintenance-check-link">
              Run maintenance checklist
            </Link>
          </div>
        </div>
      </section>

      {error ? <section className="error-banner">{error}</section> : null}

      <section className="dashboard-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total Jobs</p>
            <p className="kpi-value">{stats?.totalJobs ?? 0}</p>
            <p className="kpi-sub">{stats?.jobsCreatedThisMonth ?? 0} created this month</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: `linear-gradient(135deg, ${COLORS.warning}, #d97706)` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Overdue</p>
            <p className="kpi-value" style={{ color: stats?.overdueCount ? COLORS.danger : "inherit" }}>
              {stats?.overdueCount ?? 0}
            </p>
            <p className="kpi-sub">Require immediate attention</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: `linear-gradient(135deg, ${COLORS.secondary}, #15803d)` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Completion Rate</p>
            <p className="kpi-value">{stats?.completionRate ?? 0}%</p>
            <p className="kpi-sub">{stats?.jobsCompletedThisMonth ?? 0} of {stats?.jobsCreatedThisMonth ?? 0} this month</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: `linear-gradient(135deg, ${COLORS.danger}, #b91c1c)` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Open Findings</p>
            <p className="kpi-value" style={{ color: stats?.unresolvedFindings ? COLORS.danger : "inherit" }}>
              {stats?.unresolvedFindings ?? 0}
            </p>
            <p className="kpi-sub">{stats?.sourceLinkedJobs ?? 0} linked to jobs</p>
          </div>
        </div>
      </section>

      <section className="dashboard-grid-2">
        <article className="card chart-card">
          <h2>Monthly Job Trends</h2>
          <p className="chart-subtitle">Jobs created vs completed over the year</p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--surface-border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="Created" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card chart-card">
          <h2>Job Status Distribution</h2>
          <p className="chart-subtitle">Current status of all maintenance jobs</p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS.info} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--surface-border)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="dashboard-grid-2">
        <article className="card chart-card">
          <h2>Failure Trends</h2>
          <p className="chart-subtitle">Failed inspections over the last 14 days</p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={failureTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--surface-border)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Failures"
                  stroke={COLORS.danger}
                  strokeWidth={2}
                  dot={{ fill: COLORS.danger, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card chart-card">
          <h2>Findings by Sector</h2>
          <p className="chart-subtitle">Unresolved failures per maintenance sector</p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={findingsBySectorData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} width={80} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--surface-border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="Findings" fill={COLORS.danger} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="dashboard-grid-2">
        <article className="card chart-card">
          <h2>Priority Distribution</h2>
          <p className="chart-subtitle">Jobs breakdown by priority level</p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={priorityBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--surface-border",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || COLORS.info} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card">
          <h2>Overdue Jobs</h2>
          <p className="chart-subtitle">Jobs past their due date requiring attention</p>
          <div className="overdue-list">
            {recentOverdueJobs.length > 0 ? (
              recentOverdueJobs.map((job) => (
                <div key={job.id} className="overdue-item">
                  <div className="overdue-info">
                    <p className="overdue-title">{job.title}</p>
                    <p className="overdue-meta">
                      {job.assignee ? `Assigned: ${job.assignee}` : "Unassigned"} • {job.daysOverdue} days overdue
                    </p>
                  </div>
                  <span className="badge badge-scheduled">{job.status}</span>
                </div>
              ))
            ) : (
              <p className="subtle">No overdue jobs. Great work!</p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}

"use client";

import { FormEvent, useMemo, useState } from "react";

type Skill = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

type Sector = {
  id: string;
  name: string;
  items: Array<{
    id: string;
    componentId: string;
    componentName: string;
    required: boolean;
    displayOrder: number;
  }>;
};

type Run = {
  id: string;
  startedAt: string | Date;
  endedAt: string | Date | null;
  performedBy: string;
  notes: string;
  outcome: string;
  timeSpentMinutes: number | null;
};

type Job = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | Date;
  status: string;
  priority: string;
  location: string | null;
  subLocation: string | null;
  assignedTo: string | null;
  doneBy: string | null;
  checkedBy: string | null;
  requiredSkills: string[];
  runLog: Run[];
  sourceObservationId: string | null;
  sourceObservationContext: {
    sessionId: string;
    sectorName: string;
    componentName: string;
    status: string;
  } | null;
};

type Finding = {
  observationId: string;
  sessionId: string;
  sectorName: string;
  componentName: string;
  inspector: string;
  observedAt: string | Date;
  comments: string | null;
  additionalNotes: string | null;
  linkedJobId: string | null;
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

const outcomeOptions = ["ProgressMade", "Blocked", "NoAccess", "Failed", "CompletedWork"];
const checklistStatusOptions = ["Pass", "Fail", "NotApplicable", "NotInspected"];

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

function toLocalDateTimeValue(date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function metadataValue(value: string | null) {
  return value && value.trim().length > 0 ? value : "Not set";
}

type DashboardProps = {
  initialSkills: Skill[];
  initialJobs: Job[];
  initialSummary: ReportSummary;
  initialSectors: Sector[];
  initialFindings: Finding[];
  initialTrends: FailureTrend[];
};

export function MaintenanceDashboard({
  initialSkills,
  initialJobs,
  initialSummary,
  initialSectors,
  initialFindings,
  initialTrends,
}: DashboardProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [summary, setSummary] = useState<ReportSummary | null>(initialSummary);
  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [findings, setFindings] = useState<Finding[]>(initialFindings);
  const [trends, setTrends] = useState<FailureTrend[]>(initialTrends);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobDueDate, setJobDueDate] = useState("");
  const [jobAssignee, setJobAssignee] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobSubLocation, setJobSubLocation] = useState("");
  const [jobDoneBy, setJobDoneBy] = useState("");
  const [jobCheckedBy, setJobCheckedBy] = useState("");
  const [jobPriority, setJobPriority] = useState("Medium");
  const [jobRequiredSkills, setJobRequiredSkills] = useState<string[]>([]);

  const [skillName, setSkillName] = useState("");
  const [skillDescription, setSkillDescription] = useState("");

  const [inspector, setInspector] = useState("tech.operator");
  const [inspectedAt, setInspectedAt] = useState(toLocalDateTimeValue());
  const [sessionNotes, setSessionNotes] = useState("");
  const [observationValues, setObservationValues] = useState<
    Record<
      string,
      {
        status: string;
        comments: string;
        additionalNotes: string;
      }
    >
  >({});

  const [error, setError] = useState<string | null>(null);

  const completionRate = useMemo(() => {
    if (!summary) return 0;
    const created = summary.monthly.reduce((sum, row) => sum + row.createdCount, 0);
    const completed = summary.monthly.reduce((sum, row) => sum + row.completedCount, 0);
    if (created === 0) return 0;
    return Math.round((completed / created) * 100);
  }, [summary]);

  async function loadAll() {
    setError(null);
    try {
      const [
        skillResponse,
        jobResponse,
        reportResponse,
        catalogResponse,
        findingsResponse,
        trendResponse,
      ] = await Promise.all([
        request<{ skills: Skill[] }>("/api/skills"),
        request<{ jobs: Job[] }>("/api/jobs"),
        request<{ summary: ReportSummary }>("/api/reports/summary"),
        request<{ sectors: Sector[] }>("/api/checklist/catalog"),
        request<{ findings: Finding[] }>("/api/checklist/findings/unresolved"),
        request<{ trends: FailureTrend[] }>("/api/checklist/trends"),
      ]);
      setSkills(skillResponse.skills);
      setJobs(jobResponse.jobs);
      setSummary(reportResponse.summary);
      setSectors(catalogResponse.sectors);
      setFindings(findingsResponse.findings);
      setTrends(trendResponse.trends);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  }

  async function createSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await request<{ skill: Skill }>("/api/skills", {
        method: "POST",
        body: JSON.stringify({ name: skillName, description: skillDescription || null }),
      });
      setSkillName("");
      setSkillDescription("");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create skill");
    }
  }

  async function createJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await request<{ job: Job }>("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: jobTitle,
          description: jobDescription || null,
          dueDate: new Date(jobDueDate).toISOString(),
          assignedTo: jobAssignee || null,
          location: jobLocation || null,
          subLocation: jobSubLocation || null,
          doneBy: jobDoneBy || null,
          checkedBy: jobCheckedBy || null,
          priority: jobPriority,
          requiredSkills: jobRequiredSkills,
        }),
      });
      setJobTitle("");
      setJobDescription("");
      setJobDueDate("");
      setJobAssignee("");
      setJobLocation("");
      setJobSubLocation("");
      setJobDoneBy("");
      setJobCheckedBy("");
      setJobPriority("Medium");
      setJobRequiredSkills([]);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create job");
    }
  }

  async function mutateJob(jobId: string, action: "start" | "complete" | "cancel") {
    setError(null);
    try {
      await request<{ job: Job }>(`/api/jobs/${jobId}/${action}`, {
        method: "POST",
        body: action === "cancel" ? JSON.stringify({ reason: "Cancelled from dashboard" }) : undefined,
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not ${action} job`);
    }
  }

  async function logRun(jobId: string, outcome: string) {
    setError(null);
    try {
      const now = new Date();
      const start = new Date(now.getTime() - 30 * 60 * 1000);
      await request<{ job: Job }>(`/api/jobs/${jobId}/runs`, {
        method: "POST",
        body: JSON.stringify({
          startedAt: start.toISOString(),
          endedAt: now.toISOString(),
          performedBy: "tech.operator",
          notes: "Run logged from dashboard quick action.",
          outcome,
          timeSpentMinutes: 30,
        }),
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log run");
    }
  }

  async function seedCatalog() {
    setError(null);
    try {
      await request<{ createdOrUpdated: number }>("/api/checklist/seed", {
        method: "POST",
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not seed checklist catalog");
    }
  }

  async function submitChecklistSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      if (sectors.length === 0) {
        throw new Error("Checklist catalog is empty. Seed or create sectors first.");
      }

      const observations = sectors.flatMap((sector) =>
        sector.items.map((item) => {
          const key = `${sector.id}:${item.componentId}`;
          const value = observationValues[key] ?? {
            status: "NotInspected",
            comments: "",
            additionalNotes: "",
          };

          return {
            sectorName: sector.name,
            componentName: item.componentName,
            status: value.status,
            observedAt: new Date(inspectedAt).toISOString(),
            comments: value.comments || null,
            additionalNotes: value.additionalNotes || null,
          };
        }),
      );

      const sessionResponse = await request<{ session: { id: string } }>("/api/checklist/sessions", {
        method: "POST",
        body: JSON.stringify({
          inspector,
          inspectedAt: new Date(inspectedAt).toISOString(),
          notes: sessionNotes || null,
          observations,
        }),
      });

      await request<{ session: { id: string } }>(
        `/api/checklist/sessions/${sessionResponse.session.id}/finalize`,
        {
          method: "POST",
        },
      );

      setObservationValues({});
      setSessionNotes("");
      setInspectedAt(toLocalDateTimeValue());
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit inspection session");
    }
  }

  function toggleSkillSelection(skillId: string) {
    setJobRequiredSkills((current) =>
      current.includes(skillId)
        ? current.filter((selected) => selected !== skillId)
        : [...current, skillId],
    );
  }

  function setObservationField(
    key: string,
    field: "status" | "comments" | "additionalNotes",
    value: string,
  ) {
    setObservationValues((current) => ({
      ...current,
      [key]: {
        status: current[key]?.status ?? "NotInspected",
        comments: current[key]?.comments ?? "",
        additionalNotes: current[key]?.additionalNotes ?? "",
        [field]: value,
      },
    }));
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Maintenance Management</p>
          <h1>Domain-Driven Maintenance App</h1>
          <p className="subtle">
            Checklist-first inspections, corrective jobs, and reporting projections.
          </p>
        </div>
      </section>

      {error ? (
        <section className="error-banner" data-testid="error-banner">
          {error}
        </section>
      ) : null}

      <section className="grid-cards">
        <article className="card">
          <h2>Skill Catalog</h2>
          <form className="stack" onSubmit={createSkill}>
            <input
              data-testid="skill-name-input"
              placeholder="Electrical"
              value={skillName}
              onChange={(event) => setSkillName(event.target.value)}
              required
            />
            <input
              placeholder="Description"
              value={skillDescription}
              onChange={(event) => setSkillDescription(event.target.value)}
            />
            <button type="submit" className="btn-primary" data-testid="create-skill-button">
              Create Skill
            </button>
          </form>
          <ul className="chip-list" data-testid="skill-list">
            {skills.map((skill) => (
              <li key={skill.id}>{skill.name}</li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Create Job</h2>
          <form className="stack" onSubmit={createJob}>
            <input
              data-testid="job-title-input"
              placeholder="Replace filter on Pump #3"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              required
            />
            <textarea
              placeholder="Description"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={3}
            />
            <div className="field-row">
              <label>
                Due Date
                <input
                  data-testid="job-due-date-input"
                  type="datetime-local"
                  value={jobDueDate}
                  onChange={(event) => setJobDueDate(event.target.value)}
                  required
                />
              </label>
              <label>
                Priority
                <select value={jobPriority} onChange={(event) => setJobPriority(event.target.value)}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </label>
            </div>
            <input
              placeholder="Assignee"
              value={jobAssignee}
              onChange={(event) => setJobAssignee(event.target.value)}
            />
            <div className="field-row">
              <input
                data-testid="job-location-input"
                placeholder="Location"
                value={jobLocation}
                onChange={(event) => setJobLocation(event.target.value)}
              />
              <input
                data-testid="job-sublocation-input"
                placeholder="Sub-location"
                value={jobSubLocation}
                onChange={(event) => setJobSubLocation(event.target.value)}
              />
            </div>
            <div className="field-row">
              <input
                data-testid="job-done-by-input"
                placeholder="Done by"
                value={jobDoneBy}
                onChange={(event) => setJobDoneBy(event.target.value)}
              />
              <input
                data-testid="job-checked-by-input"
                placeholder="Checked by"
                value={jobCheckedBy}
                onChange={(event) => setJobCheckedBy(event.target.value)}
              />
            </div>
            <div>
              <p className="label">Required Skills</p>
              <div className="checkbox-grid">
                {skills.map((skill) => (
                  <label key={skill.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={jobRequiredSkills.includes(skill.id)}
                      onChange={() => toggleSkillSelection(skill.id)}
                    />
                    {skill.name}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary" data-testid="create-job-button">
              Create Job
            </button>
          </form>
        </article>
      </section>

      <section className="grid-cards">
        <article className="card">
          <h2>Sector Checklist Session</h2>
          <form className="stack" onSubmit={submitChecklistSession} data-testid="checklist-session-form">
            <div className="actions">
              <button type="button" className="btn-secondary" onClick={seedCatalog} data-testid="seed-catalog-button">
                Seed Baseline Catalog
              </button>
            </div>
            <div className="field-row">
              <label>
                Inspector
                <input
                  data-testid="inspector-input"
                  value={inspector}
                  onChange={(event) => setInspector(event.target.value)}
                  required
                />
              </label>
              <label>
                Inspection Date
                <input
                  data-testid="inspection-date-input"
                  type="datetime-local"
                  value={inspectedAt}
                  onChange={(event) => setInspectedAt(event.target.value)}
                  required
                />
              </label>
            </div>
            <textarea
              placeholder="Session notes"
              value={sessionNotes}
              onChange={(event) => setSessionNotes(event.target.value)}
              rows={2}
            />

            <div className="checklist-catalog-grid" data-testid="sector-checklist-grid">
              {sectors.map((sector) => (
                <section key={sector.id} className="checklist-sector">
                  <h3>{sector.name}</h3>
                  <div className="stack">
                    {sector.items.map((item) => {
                      const key = `${sector.id}:${item.componentId}`;
                      const current = observationValues[key] ?? {
                        status: "NotInspected",
                        comments: "",
                        additionalNotes: "",
                      };

                      return (
                        <div key={key} className="checklist-row">
                          <p className="label">{item.componentName}</p>
                          <select
                            value={current.status}
                            onChange={(event) => setObservationField(key, "status", event.target.value)}
                          >
                            {checklistStatusOptions.map((statusOption) => (
                              <option key={statusOption}>{statusOption}</option>
                            ))}
                          </select>
                          <input
                            placeholder="Comments"
                            value={current.comments}
                            onChange={(event) => setObservationField(key, "comments", event.target.value)}
                          />
                          <input
                            placeholder="Additional"
                            value={current.additionalNotes}
                            onChange={(event) =>
                              setObservationField(key, "additionalNotes", event.target.value)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
              {sectors.length === 0 ? <p className="subtle">No catalog yet. Seed baseline to begin.</p> : null}
            </div>

            <button type="submit" className="btn-primary" data-testid="submit-checklist-button">
              Submit Inspection Session
            </button>
          </form>
        </article>

        <article className="card" data-testid="unresolved-findings-section">
          <h2>Unresolved Findings</h2>
          <ul className="stack list-tight">
            {findings.slice(0, 12).map((finding) => (
              <li key={finding.observationId}>
                {finding.sectorName} / {finding.componentName} - {finding.linkedJobStatus ?? "No Job"}
              </li>
            ))}
            {findings.length === 0 ? <li>No unresolved failed observations.</li> : null}
          </ul>
        </article>
      </section>

      <section className="grid-cards">
        <article className="card">
          <h2>Reporting Snapshot</h2>
          <div className="stats-grid" data-testid="reporting-section">
            <div>
              <p className="label">Overdue Jobs</p>
              <strong>{summary?.overdueCount ?? 0}</strong>
            </div>
            <div>
              <p className="label">Completion Rate</p>
              <strong>{completionRate}%</strong>
            </div>
            <div>
              <p className="label">Unresolved Findings</p>
              <strong>{summary?.unresolvedFindingsCount ?? 0}</strong>
            </div>
            <div>
              <p className="label">Source-Linked Jobs</p>
              <strong>{summary?.sourceLinkedJobsCount ?? 0}</strong>
            </div>
          </div>
          <ul className="stack list-tight">
            {trends.slice(-5).map((trend) => (
              <li key={trend.bucket}>
                {trend.bucket}: {trend.failures} failures
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Jobs</h2>
          <ul className="stack" data-testid="job-list">
            {jobs.map((job) => (
              <li key={job.id} className="job-item" data-testid={`job-${job.id}`}>
                <div className="job-head">
                  <div>
                    <p className="label">{job.priority}</p>
                    <h3>{job.title}</h3>
                  </div>
                  <span className={`badge badge-${job.status.toLowerCase()}`}>{job.status}</span>
                </div>
                <p className="subtle">Due: {new Date(job.dueDate).toLocaleString()}</p>
                <p className="subtle">Assignee: {job.assignedTo ?? "Unassigned"}</p>
                <p className="subtle">Location: {metadataValue(job.location)}</p>
                <p className="subtle">Sub-location: {metadataValue(job.subLocation)}</p>
                <p className="subtle">Done by: {metadataValue(job.doneBy)}</p>
                <p className="subtle">Checked by: {metadataValue(job.checkedBy)}</p>
                <p className="subtle">Runs: {job.runLog.length}</p>
                {job.sourceObservationContext ? (
                  <p className="subtle">
                    Source: {job.sourceObservationContext.sessionId} | {job.sourceObservationContext.sectorName} / {job.sourceObservationContext.componentName}
                  </p>
                ) : null}
                <div className="actions">
                  <button type="button" className="btn-secondary" onClick={() => mutateJob(job.id, "start")}>
                    Start
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => logRun(job.id, outcomeOptions[0])}
                    data-testid={`log-run-${job.id}`}
                  >
                    Log Run
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => mutateJob(job.id, "complete")}>
                    Complete
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => mutateJob(job.id, "cancel")}>
                    Cancel
                  </button>
                </div>
              </li>
            ))}
            {jobs.length === 0 ? <li>No jobs yet.</li> : null}
          </ul>
        </article>
      </section>
    </main>
  );
}

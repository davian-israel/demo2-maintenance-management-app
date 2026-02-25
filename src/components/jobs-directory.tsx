"use client";

import { useEffect, useState } from "react";

type Job = {
  id: string;
  title: string;
  dueDate: string | Date;
  status: string;
  priority: string;
  assignedTo: string | null;
  location: string | null;
  subLocation: string | null;
  doneBy: string | null;
  checkedBy: string | null;
};

function metadataValue(value: string | null) {
  return value && value.trim().length > 0 ? value : "Not set";
}

export function JobsDirectory() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch("/api/jobs", { cache: "no-store" });
        const payload = (await response.json()) as { jobs?: Job[]; message?: string };

        if (!response.ok) {
          throw new Error(payload.message ?? "Failed to load jobs.");
        }

        if (mounted) {
          setJobs(payload.jobs ?? []);
        }
      } catch (cause) {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : "Failed to load jobs.");
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Jobs Directory</p>
          <h1>All Maintenance Jobs</h1>
          <p className="subtle">Operational metadata and lifecycle status for every job.</p>
        </div>
      </section>

      {error ? <section className="error-banner">{error}</section> : null}

      <section className="card">
        <h2>Jobs</h2>
        <ul className="stack" data-testid="jobs-directory-list">
          {jobs.map((job) => (
            <li key={job.id} className="job-item">
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
            </li>
          ))}
          {jobs.length === 0 ? <li>No jobs yet.</li> : null}
        </ul>
      </section>
    </main>
  );
}

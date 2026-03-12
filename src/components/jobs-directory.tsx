"use client";

import { useEffect, useState } from "react";
import { DataTableComponent, type DataTableColumn } from "@/components/data-table";

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

function metadataValue(value: string | null): string {
  return value && value.trim().length > 0 ? value : "Not set";
}

const columns: DataTableColumn[] = [
  { title: "Priority", data: "priority", className: "font-medium" },
  { title: "Title", data: "title" },
  { title: "Status", data: "status", render: (data) => `<span class="badge badge-${String(data).toLowerCase()}">${data}</span>` },
  { title: "Due Date", data: "dueDate", render: (data) => new Date(String(data)).toLocaleString() },
  { title: "Assignee", data: "assignedTo", render: (data) => String(data || "Unassigned") },
  { title: "Location", data: "location", render: (data) => metadataValue(data as string | null) },
  { title: "Done By", data: "doneBy", render: (data) => metadataValue(data as string | null) },
  { title: "Checked By", data: "checkedBy", render: (data) => metadataValue(data as string | null) },
];

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
        {jobs.length > 0 ? (
          <DataTableComponent columns={columns} data={jobs} />
        ) : (
          <p>No jobs yet.</p>
        )}
      </section>
    </main>
  );
}

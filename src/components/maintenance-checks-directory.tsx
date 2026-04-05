"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DataTableComponent, type DataTableColumn } from "@/components/data-table";

type SessionSummary = {
  id: string;
  inspector: string;
  inspectedAt: string;
  finalizedAt: string | null;
  observationCount: number;
  failCount: number;
};

type ObservationDetail = {
  id: string;
  sectorName: string;
  componentName: string;
  status: string;
  observedAt: string;
  inspector: string;
  comments: string | null;
  additionalNotes: string | null;
};

type SessionDetail = {
  id: string;
  inspector: string;
  inspectedAt: string;
  notes: string | null;
  finalizedAt: string | null;
  observations: ObservationDetail[];
};

const columns: DataTableColumn[] = [
  { title: "Inspector", data: "inspector", className: "font-medium" },
  {
    title: "Inspected",
    data: "inspectedAt",
    render: (data) => new Date(String(data)).toLocaleString(),
  },
  {
    title: "Status",
    data: "finalizedAt",
    render: (data) =>
      data
        ? `<span class="badge badge-completed">Finalized</span>`
        : `<span class="badge badge-inprogress">In progress</span>`,
  },
  { title: "Observations", data: "observationCount" },
  { title: "Failures", data: "failCount" },
  {
    title: "",
    data: "id",
    orderable: false,
    render: (data) =>
      `<button type="button" class="btn-secondary checks-view-btn" data-session-id="${String(data)}" data-testid="view-check-${String(data)}">View</button>`,
  },
];

export function MaintenanceChecksDirectory() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const openDetailRef = useRef<(sessionId: string) => void>(() => {});

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checklist/sessions", { cache: "no-store" });
      const payload = (await response.json()) as { sessions?: SessionSummary[]; message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to load maintenance checks.");
      }
      setSessions(payload.sessions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load maintenance checks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  openDetailRef.current = async (sessionId: string) => {
    setDetail(null);
    setDetailLoading(true);
    setDetailError(null);
    dialogRef.current?.showModal();

    try {
      const response = await fetch(`/api/checklist/sessions/${sessionId}`, { cache: "no-store" });
      const payload = (await response.json()) as { session?: SessionDetail; message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to load session details.");
      }
      setDetail(payload.session ?? null);
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : "Failed to load session details.");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return;

    function handleClick(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".checks-view-btn");
      if (!btn) return;
      const sessionId = btn.dataset.sessionId;
      if (sessionId) {
        openDetailRef.current(sessionId);
      }
    }

    wrapper.addEventListener("click", handleClick);
    return () => wrapper.removeEventListener("click", handleClick);
  }, [loading, sessions]);

  function closeDetail() {
    dialogRef.current?.close();
    setDetail(null);
    setDetailError(null);
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Inspections</p>
          <h1>Maintenance checks</h1>
          <p className="subtle">Review all maintenance inspection sessions and their outcomes.</p>
        </div>
      </section>

      {error ? <section className="error-banner">{error}</section> : null}

      <section className="card">
        <h2>All checks</h2>

        {loading ? <p className="subtle">Loading…</p> : null}

        {!loading && sessions.length === 0 ? (
          <p data-testid="checks-empty-state">No maintenance checks recorded yet.</p>
        ) : null}

        {!loading && sessions.length > 0 ? (
          <div data-testid="checks-directory-list" ref={tableWrapperRef}>
            <DataTableComponent columns={columns} data={sessions} />
          </div>
        ) : null}
      </section>

      {/* Detail dialog */}
      <dialog
        ref={dialogRef}
        className="checks-detail-dialog"
        data-testid="checks-detail-dialog"
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            closeDetail();
          }
        }}
      >
        <div className="checks-dialog-content">
          <div className="checks-dialog-header">
            <h2>Maintenance check details</h2>
            <button
              type="button"
              className="btn-secondary"
              data-testid="close-checks-dialog"
              onClick={closeDetail}
            >
              Close
            </button>
          </div>

          {detailLoading ? <p className="subtle">Loading session…</p> : null}
          {detailError ? <p className="error-banner">{detailError}</p> : null}

          {detail ? (
            <div className="stack" data-testid="checks-detail-body">
              <div className="field-row">
                <div>
                  <p className="label">Inspector</p>
                  <p>{detail.inspector}</p>
                </div>
                <div>
                  <p className="label">Inspected at</p>
                  <p>{new Date(detail.inspectedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="label">Status</p>
                  <p>{detail.finalizedAt ? "Finalized" : "In progress"}</p>
                </div>
              </div>

              {detail.notes ? (
                <div>
                  <p className="label">Notes</p>
                  <p>{detail.notes}</p>
                </div>
              ) : null}

              <h3>Observations ({detail.observations.length})</h3>

              {detail.observations.length === 0 ? (
                <p className="subtle">No observations recorded.</p>
              ) : (
                <table className="display" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Sector</th>
                      <th>Component</th>
                      <th>Status</th>
                      <th>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.observations.map((o) => (
                      <tr key={o.id}>
                        <td>{o.sectorName}</td>
                        <td>{o.componentName}</td>
                        <td>
                          <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                        </td>
                        <td>{o.comments ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}
        </div>
      </dialog>
    </main>
  );
}

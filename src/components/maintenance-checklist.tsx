"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ObservationStatus, Sector } from "@/domain/checklist/types";
import { OBSERVATION_STATUSES } from "@/domain/checklist/types";

type InspectionSessionPayload = {
  id: string;
  inspector: string;
  inspectedAt: string;
  notes: string | null;
  finalizedAt: string | null;
  observations: Array<{
    id: string;
    sectorName: string;
    componentName: string;
    status: ObservationStatus;
    comments: string | null;
  }>;
};

function buildJobsNewLink(sessionId: string, sectorName: string, componentName: string): string {
  const returnPath = `/maintenance/check?${new URLSearchParams({
    sessionId,
    sector: sectorName,
    component: componentName,
  }).toString()}`;
  const params = new URLSearchParams({
    location: sectorName,
    subLocation: componentName,
    returnTo: returnPath,
    title: `Corrective: ${sectorName} / ${componentName}`,
  });
  return `/jobs/new?${params.toString()}`;
}

export function MaintenanceChecklist() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [inspector, setInspector] = useState("Field technician");
  const [selectedSectorName, setSelectedSectorName] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<InspectionSessionPayload | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [rowComments, setRowComments] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }
    const next: Record<string, string> = {};
    for (const o of session.observations) {
      next[`${o.sectorName}::${o.componentName}`] = o.comments ?? "";
    }
    setRowComments((prev) => ({ ...next, ...prev }));
  }, [session]);

  const urlSessionId = searchParams.get("sessionId");
  const urlSector = searchParams.get("sector") ?? "";
  const urlComponent = searchParams.get("component") ?? "";

  const selectedSector = useMemo(
    () => sectors.find((s) => s.name === selectedSectorName) ?? null,
    [sectors, selectedSectorName],
  );

  const syncUrl = useCallback(
    (next: { sessionId: string | null; sector?: string; component?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.sessionId) {
        params.set("sessionId", next.sessionId);
      } else {
        params.delete("sessionId");
      }
      if (next.sector !== undefined) {
        if (next.sector) {
          params.set("sector", next.sector);
        } else {
          params.delete("sector");
        }
      }
      if (next.component !== undefined) {
        if (next.component) {
          params.set("component", next.component);
        } else {
          params.delete("component");
        }
      }
      const qs = params.toString();
      router.replace(qs ? `/maintenance/check?${qs}` : "/maintenance/check", { scroll: false });
    },
    [router, searchParams],
  );

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const response = await fetch("/api/checklist/catalog", { cache: "no-store" });
      const payload = (await response.json()) as { sectors?: Sector[]; message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Could not load checklist catalog.");
      }
      setSectors(payload.sectors ?? []);
    } catch (e) {
      setCatalogError(e instanceof Error ? e.message : "Could not load checklist catalog.");
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const loadSession = useCallback(async (id: string) => {
    setSessionLoading(true);
    setSessionError(null);
    try {
      const response = await fetch(`/api/checklist/sessions/${id}`, { cache: "no-store" });
      const payload = (await response.json()) as { session?: InspectionSessionPayload; message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Could not load inspection session.");
      }
      if (payload.session) {
        setSession(payload.session);
        setInspector(payload.session.inspector);
        setSessionId(payload.session.id);
      }
    } catch (e) {
      setSessionError(e instanceof Error ? e.message : "Could not load inspection session.");
      setSession(null);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (!urlSessionId) {
      return;
    }
    if (session?.id === urlSessionId) {
      return;
    }
    void loadSession(urlSessionId);
  }, [urlSessionId, session?.id, loadSession]);

  useEffect(() => {
    if (urlSector && sectors.some((s) => s.name === urlSector)) {
      setSelectedSectorName(urlSector);
    }
  }, [urlSector, sectors]);

  async function seedCatalog() {
    setCatalogError(null);
    try {
      const response = await fetch("/api/checklist/seed", { method: "POST" });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Seed failed.");
      }
      await loadCatalog();
    } catch (e) {
      setCatalogError(e instanceof Error ? e.message : "Seed failed.");
    }
  }

  async function startInspection() {
    setSessionError(null);
    if (!selectedSectorName || !inspector.trim()) {
      setSessionError("Choose a location and enter an inspector name.");
      return;
    }

    try {
      const response = await fetch("/api/checklist/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspector: inspector.trim(),
          observations: [],
        }),
      });
      const payload = (await response.json()) as { session?: InspectionSessionPayload; message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Could not start inspection.");
      }
      if (!payload.session) {
        throw new Error("Missing session in response.");
      }
      setSession(payload.session);
      setSessionId(payload.session.id);
      syncUrl({ sessionId: payload.session.id, sector: selectedSectorName, component: urlComponent });
    } catch (e) {
      setSessionError(e instanceof Error ? e.message : "Could not start inspection.");
    }
  }

  function observationForComponent(componentName: string) {
    if (!session || !selectedSector) {
      return undefined;
    }
    return session.observations.find(
      (o) => o.sectorName === selectedSector.name && o.componentName === componentName,
    );
  }

  async function persistObservation(componentName: string, status: ObservationStatus) {
    if (!sessionId || !selectedSectorName) {
      return;
    }
    const key = `${selectedSectorName}::${componentName}`;
    setSavingKey(key);
    setSessionError(null);
    try {
      const response = await fetch(`/api/checklist/sessions/${sessionId}/observations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspector: inspector.trim(),
          sectorName: selectedSectorName,
          componentName,
          status,
          comments: rowComments[key]?.trim() || null,
        }),
      });
      const payload = (await response.json()) as { session?: InspectionSessionPayload; message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Could not save observation.");
      }
      if (payload.session) {
        setSession(payload.session);
      }
    } catch (e) {
      setSessionError(e instanceof Error ? e.message : "Could not save observation.");
    } finally {
      setSavingKey(null);
    }
  }

  const checklistRows = selectedSector?.items ?? [];

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Inspections</p>
          <h1>Maintenance checklist</h1>
          <p className="subtle">
            Choose a location, walk each sub-location, record pass or fail, and log a corrective job without losing
            your place.
          </p>
          <div className="actions" style={{ marginTop: "1rem" }}>
            <Link className="btn-secondary" href="/" data-testid="maintenance-check-back-dashboard">
              Back to dashboard
            </Link>
          </div>
        </div>
      </section>

      {catalogError ? <section className="error-banner">{catalogError}</section> : null}
      {sessionError ? <section className="error-banner">{sessionError}</section> : null}

      <section className="card" data-testid="maintenance-checklist-panel">
        <h2>Location and inspector</h2>
        {catalogLoading ? <p className="subtle">Loading catalog…</p> : null}

        {!catalogLoading && sectors.length === 0 ? (
          <div className="stack">
            <p className="subtle">No sectors in the checklist catalog yet.</p>
            <button type="button" className="btn-secondary" data-testid="seed-catalog-button" onClick={() => void seedCatalog()}>
              Load sample catalog
            </button>
          </div>
        ) : null}

        {!catalogLoading && sectors.length > 0 ? (
          <div className="stack">
            <label>
              Inspector
              <input
                data-testid="maintenance-inspector-input"
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                disabled={Boolean(sessionId)}
              />
            </label>

            <label>
              Location
              <select
                data-testid="maintenance-location-select"
                value={selectedSectorName}
                onChange={(e) => {
                  const name = e.target.value;
                  setSelectedSectorName(name);
                  syncUrl({ sessionId, sector: name || undefined, component: undefined });
                }}
              >
                <option value="">Select a location</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            {!sessionId ? (
              <div className="actions">
                <button
                  type="button"
                  className="btn-primary"
                  data-testid="start-inspection-button"
                  disabled={!selectedSectorName || inspector.trim().length < 2}
                  onClick={() => void startInspection()}
                >
                  Start inspection
                </button>
              </div>
            ) : (
              <p className="subtle" data-testid="maintenance-session-active">
                Inspection session <code>{sessionId}</code> — progress is saved on the server.
              </p>
            )}
          </div>
        ) : null}
      </section>

      {sessionLoading ? (
        <section className="card">
          <p className="subtle">Loading inspection session…</p>
        </section>
      ) : null}

      {sessionId && selectedSector && checklistRows.length > 0 ? (
        <section className="card" data-testid="sector-checklist-grid">
          <h2>Sub-locations — {selectedSector.name}</h2>
          <p className="subtle">Record each area, then use Log corrective job if you need a work order.</p>

          <div className="checklist-catalog-grid">
            {checklistRows.map((item) => {
              const obs = observationForComponent(item.componentName);
              const key = `${selectedSector.name}::${item.componentName}`;
              const focused = urlComponent === item.componentName;
              return (
                <div
                  key={item.id}
                  className={`checklist-row${focused ? " checklist-row-focused" : ""}`}
                  data-testid={`checklist-row-${item.componentName}`}
                >
                  <div>
                    <p className="label">{item.componentName}</p>
                    <p className="subtle">Sub-location</p>
                  </div>
                  <label>
                    Status
                    <select
                      value={obs?.status ?? "NotInspected"}
                      disabled={savingKey === key}
                      onChange={(e) =>
                        void persistObservation(item.componentName, e.target.value as ObservationStatus)
                      }
                      data-testid={`checklist-status-${item.componentName}`}
                    >
                      {OBSERVATION_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Comments
                    <input
                      placeholder="Comments"
                      value={rowComments[key] ?? obs?.comments ?? ""}
                      onChange={(e) =>
                        setRowComments((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      onBlur={() =>
                        void persistObservation(item.componentName, obs?.status ?? "NotInspected")
                      }
                    />
                  </label>
                  <Link
                    className="btn-secondary"
                    href={buildJobsNewLink(sessionId, selectedSector.name, item.componentName)}
                    data-testid={`log-corrective-job-${item.componentName}`}
                  >
                    Log corrective job
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
  );
}

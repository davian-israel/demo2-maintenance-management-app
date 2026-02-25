import { randomUUID } from "node:crypto";
import type { ChecklistRepository, SectorComponentResolution } from "@/application/checklist/checklist-repository";
import type { FailureTrendPoint, InspectionSession, Observation, Sector, UnresolvedFinding } from "@/domain/checklist/types";
import { memoryStore } from "@/infrastructure/repositories/memory-store";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export class MemoryChecklistRepository implements ChecklistRepository {
  async listSectors(): Promise<Sector[]> {
    return [...memoryStore.sectors.values()]
      .map((sector) => structuredClone(sector))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async upsertSector(input: {
    name: string;
    items: Array<{ componentName: string; required: boolean; displayOrder: number }>;
  }): Promise<Sector> {
    const existing = [...memoryStore.sectors.values()].find(
      (sector) => normalize(sector.name) === normalize(input.name),
    );

    const sectorId = existing?.id ?? randomUUID();

    const items = input.items.map((item) => {
      const existingComponent = [...memoryStore.components.values()].find(
        (component) => normalize(component.name) === normalize(item.componentName),
      );

      const componentId = existingComponent?.id ?? randomUUID();
      if (!existingComponent) {
        memoryStore.components.set(componentId, {
          id: componentId,
          name: item.componentName,
          isActive: true,
        });
      }

      const existingItem = existing?.items.find(
        (entry) => entry.componentId === componentId,
      );

      return {
        id: existingItem?.id ?? randomUUID(),
        componentId,
        componentName: item.componentName,
        required: item.required,
        displayOrder: item.displayOrder,
      };
    });

    const sector = {
      id: sectorId,
      name: input.name,
      items,
    };

    memoryStore.sectors.set(sectorId, sector);
    return structuredClone(sector);
  }

  async resolveSectorComponent(
    sectorName: string,
    componentName: string,
  ): Promise<SectorComponentResolution | null> {
    const sector = [...memoryStore.sectors.values()].find(
      (entry) => normalize(entry.name) === normalize(sectorName),
    );
    if (!sector) return null;

    const item = sector.items.find(
      (entry) => normalize(entry.componentName) === normalize(componentName),
    );

    if (!item) return null;

    return {
      sectorId: sector.id,
      sectorName: sector.name,
      componentId: item.componentId,
      componentName: item.componentName,
    };
  }

  async createInspectionSession(session: InspectionSession): Promise<void> {
    memoryStore.sessions.set(session.id, structuredClone(session));
    session.observations.forEach((observation) => {
      memoryStore.observations.set(observation.id, structuredClone(observation));
    });
  }

  async saveInspectionSession(session: InspectionSession): Promise<void> {
    memoryStore.sessions.set(session.id, structuredClone(session));

    for (const [id, observation] of memoryStore.observations.entries()) {
      if (observation.sessionId === session.id) {
        memoryStore.observations.delete(id);
      }
    }

    session.observations.forEach((observation) => {
      memoryStore.observations.set(observation.id, structuredClone(observation));
    });
  }

  async getInspectionSessionById(sessionId: string): Promise<InspectionSession | null> {
    return structuredClone(memoryStore.sessions.get(sessionId) ?? null);
  }

  async markObservationResolved(observationId: string, resolvedAt: Date): Promise<void> {
    const observation = memoryStore.observations.get(observationId);
    if (!observation) return;

    observation.resolvedAt = resolvedAt;
    memoryStore.observations.set(observation.id, observation);

    const session = memoryStore.sessions.get(observation.sessionId);
    if (session) {
      session.observations = session.observations.map((entry) =>
        entry.id === observationId ? { ...entry, resolvedAt } : entry,
      );
      memoryStore.sessions.set(session.id, session);
    }
  }

  async listUnresolvedFindings(): Promise<UnresolvedFinding[]> {
    return [...memoryStore.observations.values()]
      .filter((observation) => observation.status === "Fail" && !observation.resolvedAt)
      .map((observation) => {
        const linkedJob = [...memoryStore.jobs.values()].find(
          (job) => job.sourceObservationId === observation.id,
        );
        return {
          observationId: observation.id,
          sessionId: observation.sessionId,
          sectorName: observation.sectorName,
          componentName: observation.componentName,
          inspector: observation.inspector,
          observedAt: observation.observedAt,
          comments: observation.comments,
          additionalNotes: observation.additionalNotes,
          linkedJobId: linkedJob?.id ?? null,
          linkedJobStatus: linkedJob?.status ?? null,
        };
      })
      .sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime());
  }

  async listFailureTrends(range: { from: Date; to: Date }): Promise<FailureTrendPoint[]> {
    const buckets = new Map<string, number>();
    for (const observation of memoryStore.observations.values()) {
      if (observation.status !== "Fail") continue;
      if (observation.observedAt < range.from || observation.observedAt > range.to) continue;

      const bucket = observation.observedAt.toISOString().slice(0, 10);
      buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
    }

    return [...buckets.entries()]
      .map(([bucket, failures]) => ({ bucket, failures }))
      .sort((a, b) => a.bucket.localeCompare(b.bucket));
  }

  async getObservationById(observationId: string): Promise<Observation | null> {
    return structuredClone(memoryStore.observations.get(observationId) ?? null);
  }
}

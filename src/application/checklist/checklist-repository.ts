import type {
  FailureTrendPoint,
  InspectionSession,
  InspectionSessionSummary,
  Observation,
  Sector,
  UnresolvedFinding,
} from "@/domain/checklist/types";

export type SectorComponentResolution = {
  sectorId: string;
  sectorName: string;
  componentId: string;
  componentName: string;
};

export interface ChecklistRepository {
  listInspectionSessions(): Promise<InspectionSessionSummary[]>;
  listSectors(): Promise<Sector[]>;
  upsertSector(input: {
    name: string;
    items: Array<{ componentName: string; required: boolean; displayOrder: number }>;
  }): Promise<Sector>;
  resolveSectorComponent(sectorName: string, componentName: string): Promise<SectorComponentResolution | null>;
  createInspectionSession(session: InspectionSession): Promise<void>;
  saveInspectionSession(session: InspectionSession): Promise<void>;
  getInspectionSessionById(sessionId: string): Promise<InspectionSession | null>;
  createObservation(observation: Observation): Promise<void>;
  updateObservation(
    observationId: string,
    data: {
      status: Observation["status"];
      observedAt: Date;
      inspector: string;
      comments: string | null;
      additionalNotes: string | null;
    },
  ): Promise<void>;
  markObservationResolved(observationId: string, resolvedAt: Date): Promise<void>;
  listUnresolvedFindings(): Promise<UnresolvedFinding[]>;
  listFailureTrends(range: { from: Date; to: Date }): Promise<FailureTrendPoint[]>;
  getObservationById(observationId: string): Promise<Observation | null>;
}

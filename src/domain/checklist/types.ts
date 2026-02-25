export const OBSERVATION_STATUSES = ["Pass", "Fail", "NotApplicable", "NotInspected"] as const;

export type ObservationStatus = (typeof OBSERVATION_STATUSES)[number];

export type ChecklistComponent = {
  id: string;
  name: string;
  isActive: boolean;
};

export type SectorChecklistItem = {
  id: string;
  componentId: string;
  componentName: string;
  required: boolean;
  displayOrder: number;
};

export type Sector = {
  id: string;
  name: string;
  items: SectorChecklistItem[];
};

export type Observation = {
  id: string;
  sessionId: string;
  sectorId: string;
  sectorName: string;
  componentId: string;
  componentName: string;
  status: ObservationStatus;
  observedAt: Date;
  inspector: string;
  comments: string | null;
  additionalNotes: string | null;
  resolvedAt: Date | null;
};

export type InspectionSession = {
  id: string;
  inspector: string;
  inspectedAt: Date;
  notes: string | null;
  finalizedAt: Date | null;
  observations: Observation[];
};

export type UnresolvedFinding = {
  observationId: string;
  sessionId: string;
  sectorName: string;
  componentName: string;
  inspector: string;
  observedAt: Date;
  comments: string | null;
  additionalNotes: string | null;
  linkedJobId: string | null;
  linkedJobStatus: string | null;
};

export type FailureTrendPoint = {
  bucket: string;
  failures: number;
};

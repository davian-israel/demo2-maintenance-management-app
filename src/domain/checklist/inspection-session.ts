import { randomUUID } from "node:crypto";
import { OBSERVATION_STATUSES, type InspectionSession, type Observation, type ObservationStatus, type Sector } from "@/domain/checklist/types";

class InspectionDomainError extends Error {}

export class InspectionSessionAggregate {
  private readonly data: InspectionSession;

  private constructor(data: InspectionSession) {
    this.data = data;
  }

  static create(input: { inspector: string; inspectedAt: Date; notes: string | null }) {
    const inspector = input.inspector.trim();
    if (!inspector) {
      throw new InspectionDomainError("Inspector is required.");
    }

    return new InspectionSessionAggregate({
      id: randomUUID(),
      inspector,
      inspectedAt: input.inspectedAt,
      notes: input.notes,
      finalizedAt: null,
      observations: [],
    });
  }

  static rehydrate(session: InspectionSession) {
    return new InspectionSessionAggregate(session);
  }

  addObservation(input: Omit<Observation, "id" | "sessionId" | "resolvedAt">) {
    if (this.data.finalizedAt) {
      throw new InspectionDomainError("Cannot add observations to a finalized inspection session.");
    }

    if (!OBSERVATION_STATUSES.includes(input.status as ObservationStatus)) {
      throw new InspectionDomainError("Invalid observation status.");
    }

    const keyExists = this.data.observations.some(
      (observation) =>
        observation.sectorId === input.sectorId &&
        observation.componentId === input.componentId,
    );

    if (keyExists) {
      throw new InspectionDomainError(
        `Duplicate observation for ${input.sectorName} / ${input.componentName}.`,
      );
    }

    this.data.observations.push({
      ...input,
      id: randomUUID(),
      sessionId: this.data.id,
      resolvedAt: null,
    });
  }

  finalize(sectors: Sector[]) {
    if (this.data.finalizedAt) {
      throw new InspectionDomainError("Inspection session is already finalized.");
    }

    for (const sector of sectors) {
      for (const item of sector.items) {
        if (!item.required) continue;
        const exists = this.data.observations.some(
          (observation) =>
            observation.sectorId === sector.id && observation.componentId === item.componentId,
        );
        if (!exists) {
          throw new InspectionDomainError(
            `Missing required observation: ${sector.name} / ${item.componentName}.`,
          );
        }
      }
    }

    this.data.finalizedAt = new Date();
  }

  get snapshot() {
    return structuredClone(this.data);
  }
}

export function isInspectionDomainError(error: unknown): error is Error {
  return error instanceof Error && error.name === "Error";
}

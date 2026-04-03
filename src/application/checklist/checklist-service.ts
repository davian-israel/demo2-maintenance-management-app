import {
  createInspectionSessionSchema,
  getTrendsSchema,
  recordObservationSchema,
  upsertSectorSchema,
  type CreateInspectionSessionInput,
  type UpsertSectorInput,
} from "@/application/checklist/contracts";
import type { ChecklistRepository } from "@/application/checklist/checklist-repository";
import type { JobRepository } from "@/application/jobs/job-repository";
import { Job } from "@/domain/job/job";
import { InspectionSessionAggregate } from "@/domain/checklist/inspection-session";
import { SectorTemplate } from "@/domain/checklist/sector";

const BASELINE_SECTOR_COMPONENTS: Array<{ name: string; components: string[] }> = [
  { name: "Main Hall", components: ["Walls", "Ceiling", "Floor", "Lights", "Windows"] },
  { name: "Nursery Room", components: ["Walls", "Windows", "Ceiling", "Floor", "Door", "Lights"] },
  { name: "Prep Room", components: ["Walls", "Windows", "Ceiling", "Lights", "Door", "Storage Unit"] },
  { name: "Young Sister Room", components: ["Walls", "Windows", "Ceiling", "Door", "Lights", "Floor"] },
  { name: "Boys Room", components: ["Walls", "Ceiling", "Floor", "Lights", "Windows"] },
  { name: "BCR", components: ["Walls", "Lights", "Ceiling", "Floor", "Door"] },
  { name: "Kitchen", components: ["Walls", "Ceiling", "Water Supply", "Floor", "Cabinets"] },
  { name: "Hallway", components: ["Walls", "Ceiling", "Floor", "Lights"] },
  { name: "Black Doors", components: ["Staircase", "Doors", "Lights"] },
  { name: "White Doors", components: ["Staircase", "Doors"] },
  { name: "Sister Toilet", components: ["Floor", "Door", "Light"] },
];

export class ChecklistService {
  constructor(
    private readonly checklistRepository: ChecklistRepository,
    private readonly jobRepository: JobRepository,
  ) {}

  async listCatalog() {
    return this.checklistRepository.listSectors();
  }

  async getInspectionSession(sessionId: string) {
    return this.checklistRepository.getInspectionSessionById(sessionId);
  }

  async upsertSector(input: UpsertSectorInput) {
    const valid = upsertSectorSchema.parse(input);
    const aggregate = SectorTemplate.create(
      valid.name,
      valid.components.map((component, index) => ({
        componentName: component.name,
        required: component.required,
        displayOrder: component.displayOrder ?? index,
      })),
    );

    return this.checklistRepository.upsertSector({
      name: aggregate.snapshot.name,
      items: aggregate.snapshot.items.map((item) => ({
        componentName: item.componentName,
        required: item.required,
        displayOrder: item.displayOrder,
      })),
    });
  }

  async seedBaselineCatalog() {
    const sectors = [];
    for (const sector of BASELINE_SECTOR_COMPONENTS) {
      const result = await this.upsertSector({
        name: sector.name,
        components: sector.components.map((componentName, index) => ({
          name: componentName,
          required: true,
          displayOrder: index,
        })),
      });
      sectors.push(result);
    }

    return { createdOrUpdated: sectors.length };
  }

  async createInspectionSession(input: CreateInspectionSessionInput) {
    const valid = createInspectionSessionSchema.parse(input);
    const aggregate = InspectionSessionAggregate.create({
      inspector: valid.inspector,
      inspectedAt: valid.inspectedAt ?? new Date(),
      notes: valid.notes ?? null,
    });

    for (const observation of valid.observations) {
      const resolved = await this.checklistRepository.resolveSectorComponent(
        observation.sectorName,
        observation.componentName,
      );

      if (!resolved) {
        throw new Error(
          `Unknown sector/component '${observation.sectorName} / ${observation.componentName}'.`,
        );
      }

      aggregate.addObservation({
        sectorId: resolved.sectorId,
        sectorName: resolved.sectorName,
        componentId: resolved.componentId,
        componentName: resolved.componentName,
        status: observation.status,
        observedAt: observation.observedAt ?? valid.inspectedAt ?? new Date(),
        inspector: valid.inspector,
        comments: observation.comments ?? null,
        additionalNotes: observation.additionalNotes ?? null,
      });
    }

    await this.checklistRepository.createInspectionSession(aggregate.snapshot);
    return aggregate.snapshot;
  }

  async recordObservation(sessionId: string, inspector: string, input: unknown) {
    const valid = recordObservationSchema.parse(input);
    const session = await this.checklistRepository.getInspectionSessionById(sessionId);
    if (!session) {
      throw new Error("Inspection session not found.");
    }
    if (session.finalizedAt) {
      throw new Error("Inspection session is finalized.");
    }

    const resolved = await this.checklistRepository.resolveSectorComponent(valid.sectorName, valid.componentName);
    if (!resolved) {
      throw new Error(`Unknown sector/component '${valid.sectorName} / ${valid.componentName}'.`);
    }

    const observedAt = valid.observedAt ?? new Date();
    const comments = valid.comments ?? null;
    const additionalNotes = valid.additionalNotes ?? null;

    const existing = session.observations.find(
      (observation) =>
        observation.sectorId === resolved.sectorId && observation.componentId === resolved.componentId,
    );

    if (existing) {
      await this.checklistRepository.updateObservation(existing.id, {
        status: valid.status,
        observedAt,
        inspector,
        comments,
        additionalNotes,
      });
    } else {
      const aggregate = InspectionSessionAggregate.rehydrate(session);
      aggregate.addObservation({
        sectorId: resolved.sectorId,
        sectorName: resolved.sectorName,
        componentId: resolved.componentId,
        componentName: resolved.componentName,
        status: valid.status,
        observedAt,
        inspector,
        comments,
        additionalNotes,
      });
      const snapshot = aggregate.snapshot;
      const created = snapshot.observations[snapshot.observations.length - 1];
      await this.checklistRepository.createObservation(created);
    }

    const updated = await this.checklistRepository.getInspectionSessionById(sessionId);
    if (!updated) {
      throw new Error("Inspection session not found after update.");
    }
    return updated;
  }

  async finalizeInspectionSession(sessionId: string) {
    const session = await this.checklistRepository.getInspectionSessionById(sessionId);
    if (!session) {
      throw new Error("Inspection session not found.");
    }

    const sectors = await this.checklistRepository.listSectors();
    const aggregate = InspectionSessionAggregate.rehydrate(session);
    aggregate.finalize(sectors);

    await this.checklistRepository.saveInspectionSession(aggregate.snapshot);

    for (const observation of aggregate.snapshot.observations) {
      if (observation.status === "Fail") {
        await this.ensureCorrectiveJob(observation);
      }
    }

    return aggregate.snapshot;
  }

  async listUnresolvedFindings() {
    return this.checklistRepository.listUnresolvedFindings();
  }

  async listFailureTrends(input: { from?: string | Date; to?: string | Date }) {
    const valid = getTrendsSchema.parse(input);
    const to = valid.to ?? new Date();
    const from = valid.from ?? new Date(to.getTime() - 30 * 86400000);
    return this.checklistRepository.listFailureTrends({ from, to });
  }

  async markObservationResolved(observationId: string) {
    const observation = await this.checklistRepository.getObservationById(observationId);
    if (!observation) {
      return;
    }

    if (observation.status === "Fail") {
      await this.checklistRepository.markObservationResolved(observationId, new Date());
    }
  }

  private async ensureCorrectiveJob(observation: {
    id: string;
    observedAt: Date;
    sectorName: string;
    componentName: string;
    sessionId: string;
  }) {
    const existing = await this.jobRepository.getBySourceObservationId(observation.id);
    if (existing) {
      return existing;
    }

    const candidateDueDate = new Date(observation.observedAt.getTime() + 3 * 86400000);
    const minDueDate = new Date(Date.now() + 3600000);
    const dueDate = candidateDueDate > minDueDate ? candidateDueDate : minDueDate;
    const job = Job.create({
      title: `Corrective: ${observation.sectorName} / ${observation.componentName}`,
      description: "Auto-generated from failed checklist observation.",
      assetRef: null,
      location: observation.sectorName,
      subLocation: observation.componentName,
      priority: "High",
      status: "Scheduled",
      scheduledFor: null,
      dueDate,
      assignedTo: null,
      doneBy: null,
      checkedBy: null,
      requiredSkills: [],
      sourceObservationId: observation.id,
      sourceObservationContext: {
        sessionId: observation.sessionId,
        sectorName: observation.sectorName,
        componentName: observation.componentName,
        status: "Fail",
      },
    });

    await this.jobRepository.create(job.snapshot);
    return job.snapshot;
  }
}

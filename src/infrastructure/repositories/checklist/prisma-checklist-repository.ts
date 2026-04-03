import type { ChecklistRepository, SectorComponentResolution } from "@/application/checklist/checklist-repository";
import {
  OBSERVATION_STATUSES,
  type FailureTrendPoint,
  type InspectionSession,
  type Observation,
  type ObservationStatus,
  type Sector,
  type UnresolvedFinding,
} from "@/domain/checklist/types";
import { prisma } from "@/infrastructure/prisma/client";

const observationStatusSet = new Set<string>(OBSERVATION_STATUSES);

function toObservationStatus(status: string): ObservationStatus {
  if (observationStatusSet.has(status)) {
    return status as ObservationStatus;
  }
  return "NotInspected";
}

function toSector(row: {
  id: string;
  name: string;
  checklist: Array<{
    id: string;
    required: boolean;
    displayOrder: number;
    component: { id: string; name: string };
  }>;
}): Sector {
  return {
    id: row.id,
    name: row.name,
    items: row.checklist
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((item) => ({
        id: item.id,
        componentId: item.component.id,
        componentName: item.component.name,
        required: item.required,
        displayOrder: item.displayOrder,
      })),
  };
}

function toObservation(row: {
  id: string;
  sessionId: string;
  status: string;
  observedAt: Date;
  inspector: string;
  comments: string | null;
  additionalNotes: string | null;
  resolvedAt: Date | null;
  sector: { id: string; name: string };
  component: { id: string; name: string };
}): Observation {
  return {
    id: row.id,
    sessionId: row.sessionId,
    sectorId: row.sector.id,
    sectorName: row.sector.name,
    componentId: row.component.id,
    componentName: row.component.name,
    status: toObservationStatus(row.status),
    observedAt: row.observedAt,
    inspector: row.inspector,
    comments: row.comments,
    additionalNotes: row.additionalNotes,
    resolvedAt: row.resolvedAt,
  };
}

export class PrismaChecklistRepository implements ChecklistRepository {
  async listSectors(): Promise<Sector[]> {
    const rows = await prisma.sector.findMany({
      include: {
        checklist: {
          include: {
            component: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return rows.map((row) => toSector(row));
  }

  async upsertSector(input: {
    name: string;
    items: Array<{ componentName: string; required: boolean; displayOrder: number }>;
  }): Promise<Sector> {
    const row = await prisma.$transaction(async (tx) => {
      const sector = await tx.sector.upsert({
        where: { name: input.name },
        create: { name: input.name },
        update: { name: input.name },
      });

      await tx.sectorChecklistItem.deleteMany({ where: { sectorId: sector.id } });

      for (const item of input.items) {
        const component = await tx.checklistComponent.upsert({
          where: { name: item.componentName },
          create: { name: item.componentName, isActive: true },
          update: { isActive: true },
        });

        await tx.sectorChecklistItem.create({
          data: {
            sectorId: sector.id,
            componentId: component.id,
            required: item.required,
            displayOrder: item.displayOrder,
          },
        });
      }

      return tx.sector.findUniqueOrThrow({
        where: { id: sector.id },
        include: {
          checklist: {
            include: {
              component: true,
            },
            orderBy: {
              displayOrder: "asc",
            },
          },
        },
      });
    });

    return toSector(row);
  }

  async resolveSectorComponent(
    sectorName: string,
    componentName: string,
  ): Promise<SectorComponentResolution | null> {
    const row = await prisma.sectorChecklistItem.findFirst({
      where: {
        sector: {
          name: {
            equals: sectorName,
          },
        },
        component: {
          name: {
            equals: componentName,
          },
        },
      },
      include: {
        sector: true,
        component: true,
      },
    });

    if (!row) return null;

    return {
      sectorId: row.sector.id,
      sectorName: row.sector.name,
      componentId: row.component.id,
      componentName: row.component.name,
    };
  }

  async createInspectionSession(session: InspectionSession): Promise<void> {
    await prisma.inspectionSession.create({
      data: {
        id: session.id,
        inspector: session.inspector,
        inspectedAt: session.inspectedAt,
        notes: session.notes,
        finalizedAt: session.finalizedAt,
        observations: {
          createMany: {
            data: session.observations.map((observation) => ({
              id: observation.id,
              sectorId: observation.sectorId,
              componentId: observation.componentId,
              status: observation.status,
              observedAt: observation.observedAt,
              inspector: observation.inspector,
              comments: observation.comments,
              additionalNotes: observation.additionalNotes,
              resolvedAt: observation.resolvedAt,
            })),
          },
        },
      },
    });
  }

  async saveInspectionSession(session: InspectionSession): Promise<void> {
    await prisma.inspectionSession.update({
      where: { id: session.id },
      data: {
        finalizedAt: session.finalizedAt,
        notes: session.notes,
        inspectedAt: session.inspectedAt,
      },
    });
  }

  async createObservation(observation: Observation): Promise<void> {
    await prisma.observation.create({
      data: {
        id: observation.id,
        sessionId: observation.sessionId,
        sectorId: observation.sectorId,
        componentId: observation.componentId,
        status: observation.status,
        observedAt: observation.observedAt,
        inspector: observation.inspector,
        comments: observation.comments,
        additionalNotes: observation.additionalNotes,
        resolvedAt: observation.resolvedAt,
      },
    });
  }

  async updateObservation(
    observationId: string,
    data: {
      status: Observation["status"];
      observedAt: Date;
      inspector: string;
      comments: string | null;
      additionalNotes: string | null;
    },
  ): Promise<void> {
    await prisma.observation.update({
      where: { id: observationId },
      data: {
        status: data.status,
        observedAt: data.observedAt,
        inspector: data.inspector,
        comments: data.comments,
        additionalNotes: data.additionalNotes,
      },
    });
  }

  async getInspectionSessionById(sessionId: string): Promise<InspectionSession | null> {
    const row = await prisma.inspectionSession.findUnique({
      where: { id: sessionId },
      include: {
        observations: {
          include: {
            sector: true,
            component: true,
          },
        },
      },
    });

    if (!row) return null;

    return {
      id: row.id,
      inspector: row.inspector,
      inspectedAt: row.inspectedAt,
      notes: row.notes,
      finalizedAt: row.finalizedAt,
      observations: row.observations.map((observation) => toObservation(observation)),
    };
  }

  async markObservationResolved(observationId: string, resolvedAt: Date): Promise<void> {
    await prisma.observation.update({
      where: { id: observationId },
      data: { resolvedAt },
    });
  }

  async listUnresolvedFindings(): Promise<UnresolvedFinding[]> {
    const rows = await prisma.observation.findMany({
      where: {
        status: "Fail",
        resolvedAt: null,
      },
      include: {
        sector: true,
        component: true,
        correctiveJob: true,
      },
      orderBy: {
        observedAt: "desc",
      },
    });

    return rows.map((observation) => ({
      observationId: observation.id,
      sessionId: observation.sessionId,
      sectorName: observation.sector.name,
      componentName: observation.component.name,
      inspector: observation.inspector,
      observedAt: observation.observedAt,
      comments: observation.comments,
      additionalNotes: observation.additionalNotes,
      linkedJobId: observation.correctiveJob?.id ?? null,
      linkedJobStatus: observation.correctiveJob?.status ?? null,
    }));
  }

  async listFailureTrends(range: { from: Date; to: Date }): Promise<FailureTrendPoint[]> {
    const rows = await prisma.observation.findMany({
      where: {
        status: "Fail",
        observedAt: {
          gte: range.from,
          lte: range.to,
        },
      },
      select: {
        observedAt: true,
      },
    });

    const buckets = new Map<string, number>();
    rows.forEach((row) => {
      const key = row.observedAt.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });

    return [...buckets.entries()]
      .map(([bucket, failures]) => ({ bucket, failures }))
      .sort((a, b) => a.bucket.localeCompare(b.bucket));
  }

  async getObservationById(observationId: string): Promise<Observation | null> {
    const row = await prisma.observation.findUnique({
      where: { id: observationId },
      include: {
        sector: true,
        component: true,
      },
    });

    return row ? toObservation(row) : null;
  }
}

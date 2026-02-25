import type { JobRepository, JobListFilters } from "@/application/jobs/job-repository";
import {
  JOB_PRIORITIES,
  JOB_STATUSES,
  RUN_OUTCOMES,
  type JobPriority,
  type JobProps,
  type JobStatus,
  type RunOutcome,
} from "@/domain/job/types";
import type { Prisma } from "@prisma/client";
import { OBSERVATION_STATUSES, type ObservationStatus } from "@/domain/checklist/types";
import { prisma } from "@/infrastructure/prisma/client";

type JobRow = Prisma.JobGetPayload<{
  include: {
    runLog: true;
    requiredSkills: true;
    sourceObservation: {
      include: { sector: true; component: true };
    };
  };
}>;

const jobPrioritySet = new Set<string>(JOB_PRIORITIES);
const jobStatusSet = new Set<string>(JOB_STATUSES);
const runOutcomeSet = new Set<string>(RUN_OUTCOMES);
const observationStatusSet = new Set<string>(OBSERVATION_STATUSES);

function toJobPriority(priority: string): JobPriority {
  if (jobPrioritySet.has(priority)) return priority as JobPriority;
  return "Medium";
}

function toJobStatus(status: string): JobStatus {
  if (jobStatusSet.has(status)) return status as JobStatus;
  return "Draft";
}

function toRunOutcome(outcome: string): RunOutcome {
  if (runOutcomeSet.has(outcome)) return outcome as RunOutcome;
  return "ProgressMade";
}

function toObservationStatus(status: string): ObservationStatus {
  if (observationStatusSet.has(status)) return status as ObservationStatus;
  return "NotInspected";
}

function toDomain(row: JobRow): JobProps {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    assetRef: row.assetId && row.assetName ? { assetId: row.assetId, name: row.assetName } : null,
    location: row.location,
    subLocation: row.subLocation,
    priority: toJobPriority(row.priority),
    status: toJobStatus(row.status),
    createdAt: row.createdAt,
    scheduledFor: row.scheduledFor,
    dueDate: row.dueDate,
    assignedTo: row.assignedTo,
    doneBy: row.doneBy,
    checkedBy: row.checkedBy,
    requiredSkills: row.requiredSkills.map((entry) => entry.skillId),
    runLog: row.runLog.map((run) => ({
      id: run.id,
      startedAt: run.startedAt,
      endedAt: run.endedAt,
      performedBy: run.performedBy,
      notes: run.notes,
      outcome: toRunOutcome(run.outcome),
      timeSpentMinutes: run.timeSpentMinutes,
    })),
    completedAt: row.completedAt,
    cancelledReason: row.cancelledReason,
    sourceObservationId: row.sourceObservationId,
    sourceObservationContext: row.sourceObservation
      ? {
          sessionId: row.sourceObservation.sessionId,
          sectorName: row.sourceObservation.sector.name,
          componentName: row.sourceObservation.component.name,
          status: toObservationStatus(row.sourceObservation.status),
        }
      : null,
    version: row.version,
  };
}

async function findById(jobId: string) {
  return prisma.job.findUnique({
    where: { id: jobId },
    include: {
      runLog: true,
      requiredSkills: true,
      sourceObservation: {
        include: {
          sector: true,
          component: true,
        },
      },
    },
  });
}

export class PrismaJobRepository implements JobRepository {
  async create(job: JobProps): Promise<void> {
    await prisma.job.create({
      data: {
        id: job.id,
        title: job.title,
        description: job.description,
        assetId: job.assetRef?.assetId,
        assetName: job.assetRef?.name,
        location: job.location,
        subLocation: job.subLocation,
        priority: job.priority,
        status: job.status,
        createdAt: job.createdAt,
        scheduledFor: job.scheduledFor,
        dueDate: job.dueDate,
        assignedTo: job.assignedTo,
        doneBy: job.doneBy,
        checkedBy: job.checkedBy,
        completedAt: job.completedAt,
        cancelledReason: job.cancelledReason,
        sourceObservationId: job.sourceObservationId,
        version: job.version,
        requiredSkills: {
          createMany: {
            data: job.requiredSkills.map((skillId) => ({ skillId })),
          },
        },
        runLog: {
          createMany: {
            data: job.runLog.map((run) => ({
              id: run.id,
              startedAt: run.startedAt,
              endedAt: run.endedAt,
              performedBy: run.performedBy,
              notes: run.notes,
              outcome: run.outcome,
              timeSpentMinutes: run.timeSpentMinutes,
            })),
          },
        },
      },
    });
  }

  async save(job: JobProps): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const result = await tx.job.updateMany({
        where: { id: job.id, version: job.version },
        data: {
          title: job.title,
          description: job.description,
          assetId: job.assetRef?.assetId,
          assetName: job.assetRef?.name,
          location: job.location,
          subLocation: job.subLocation,
          priority: job.priority,
          status: job.status,
          scheduledFor: job.scheduledFor,
          dueDate: job.dueDate,
          assignedTo: job.assignedTo,
          doneBy: job.doneBy,
          checkedBy: job.checkedBy,
          completedAt: job.completedAt,
          cancelledReason: job.cancelledReason,
          sourceObservationId: job.sourceObservationId,
          version: { increment: 1 },
        },
      });

      if (result.count === 0) {
        throw new Error("Job version conflict.");
      }

      await tx.jobRequiredSkill.deleteMany({ where: { jobId: job.id } });
      if (job.requiredSkills.length > 0) {
        await tx.jobRequiredSkill.createMany({
          data: job.requiredSkills.map((skillId) => ({ jobId: job.id, skillId })),
        });
      }

      await tx.runLogEntry.deleteMany({ where: { jobId: job.id } });
      if (job.runLog.length > 0) {
        await tx.runLogEntry.createMany({
          data: job.runLog.map((run) => ({
            id: run.id,
            jobId: job.id,
            startedAt: run.startedAt,
            endedAt: run.endedAt,
            performedBy: run.performedBy,
            notes: run.notes,
            outcome: run.outcome,
            timeSpentMinutes: run.timeSpentMinutes,
          })),
        });
      }
    });
  }

  async getById(jobId: string): Promise<JobProps | null> {
    const row = await findById(jobId);
    return row ? toDomain(row) : null;
  }

  async getBySourceObservationId(sourceObservationId: string): Promise<JobProps | null> {
    const row = await prisma.job.findUnique({
      where: { sourceObservationId },
      include: {
        runLog: true,
        requiredSkills: true,
        sourceObservation: {
          include: {
            sector: true,
            component: true,
          },
        },
      },
    });
    return row ? toDomain(row) : null;
  }

  async list(filters?: JobListFilters): Promise<JobProps[]> {
    const where: Prisma.JobWhereInput = {
      status: filters?.status,
      assignedTo: filters?.assignee,
    };

    if (filters?.requiredSkill) {
      where.requiredSkills = {
        some: {
          skillId: filters.requiredSkill,
        },
      };
    }

    const rows = await prisma.job.findMany({
      where,
      include: {
        runLog: true,
        requiredSkills: true,
        sourceObservation: {
          include: {
            sector: true,
            component: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return rows.map((row) => toDomain(row));
  }
}

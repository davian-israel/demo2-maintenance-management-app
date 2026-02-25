PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "Job" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "assetId" TEXT,
  "assetName" TEXT,
  "location" TEXT,
  "subLocation" TEXT,
  "locationRef" TEXT,
  "priority" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "scheduledFor" DATETIME,
  "dueDate" DATETIME NOT NULL,
  "assignedTo" TEXT,
  "doneBy" TEXT,
  "checkedBy" TEXT,
  "completedAt" DATETIME,
  "cancelledReason" TEXT,
  "sourceObservationId" TEXT UNIQUE,
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "Job_sourceObservationId_fkey"
    FOREIGN KEY ("sourceObservationId") REFERENCES "Observation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "RunLogEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "jobId" TEXT NOT NULL,
  "startedAt" DATETIME NOT NULL,
  "endedAt" DATETIME,
  "performedBy" TEXT NOT NULL,
  "notes" TEXT NOT NULL,
  "outcome" TEXT NOT NULL,
  "timeSpentMinutes" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RunLogEntry_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Skill" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "retiredAt" DATETIME
);

CREATE TABLE IF NOT EXISTS "JobRequiredSkill" (
  "jobId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  PRIMARY KEY ("jobId", "skillId"),
  CONSTRAINT "JobRequiredSkill_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "JobRequiredSkill_skillId_fkey"
    FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "TeamMember" (
  "teamMemberId" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "TeamMemberSkill" (
  "teamMemberId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "skillPercentage" INTEGER NOT NULL,
  PRIMARY KEY ("teamMemberId", "skillId"),
  CONSTRAINT "TeamMemberSkill_teamMemberId_fkey"
    FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember" ("teamMemberId") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Sector" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ChecklistComponent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SectorChecklistItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sectorId" TEXT NOT NULL,
  "componentId" TEXT NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL,
  CONSTRAINT "SectorChecklistItem_sectorId_fkey"
    FOREIGN KEY ("sectorId") REFERENCES "Sector" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SectorChecklistItem_componentId_fkey"
    FOREIGN KEY ("componentId") REFERENCES "ChecklistComponent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "InspectionSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "inspector" TEXT NOT NULL,
  "inspectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "finalizedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Observation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "sectorId" TEXT NOT NULL,
  "componentId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "observedAt" DATETIME NOT NULL,
  "inspector" TEXT NOT NULL,
  "comments" TEXT,
  "additionalNotes" TEXT,
  "resolvedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Observation_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "InspectionSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Observation_sectorId_fkey"
    FOREIGN KEY ("sectorId") REFERENCES "Sector" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Observation_componentId_fkey"
    FOREIGN KEY ("componentId") REFERENCES "ChecklistComponent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Job_sourceObservationId_key" ON "Job"("sourceObservationId");
CREATE INDEX IF NOT EXISTS "Job_status_idx" ON "Job"("status");
CREATE INDEX IF NOT EXISTS "Job_dueDate_idx" ON "Job"("dueDate");
CREATE INDEX IF NOT EXISTS "Job_createdAt_idx" ON "Job"("createdAt");
CREATE INDEX IF NOT EXISTS "RunLogEntry_jobId_idx" ON "RunLogEntry"("jobId");
CREATE INDEX IF NOT EXISTS "RunLogEntry_startedAt_idx" ON "RunLogEntry"("startedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Skill_name_key" ON "Skill"("name");
CREATE INDEX IF NOT EXISTS "JobRequiredSkill_skillId_idx" ON "JobRequiredSkill"("skillId");
CREATE INDEX IF NOT EXISTS "TeamMember_name_idx" ON "TeamMember"("name");
CREATE INDEX IF NOT EXISTS "TeamMemberSkill_name_idx" ON "TeamMemberSkill"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Sector_name_key" ON "Sector"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "ChecklistComponent_name_key" ON "ChecklistComponent"("name");
CREATE INDEX IF NOT EXISTS "SectorChecklistItem_sectorId_displayOrder_idx" ON "SectorChecklistItem"("sectorId", "displayOrder");
CREATE UNIQUE INDEX IF NOT EXISTS "SectorChecklistItem_sectorId_componentId_key" ON "SectorChecklistItem"("sectorId", "componentId");
CREATE INDEX IF NOT EXISTS "InspectionSession_inspectedAt_idx" ON "InspectionSession"("inspectedAt");
CREATE INDEX IF NOT EXISTS "Observation_status_resolvedAt_idx" ON "Observation"("status", "resolvedAt");
CREATE INDEX IF NOT EXISTS "Observation_observedAt_idx" ON "Observation"("observedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Observation_sessionId_sectorId_componentId_key" ON "Observation"("sessionId", "sectorId", "componentId");

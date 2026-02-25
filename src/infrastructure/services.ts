import { ChecklistService } from "@/application/checklist/checklist-service";
import { JobService } from "@/application/jobs/job-service";
import { ReportingService } from "@/application/reporting/reporting-service";
import { SkillService } from "@/application/skills/skill-service";
import { TeamMemberService } from "@/application/team-members/team-member-service";
import { MemoryChecklistRepository } from "@/infrastructure/repositories/checklist/memory-checklist-repository";
import { PrismaChecklistRepository } from "@/infrastructure/repositories/checklist/prisma-checklist-repository";
import { MemoryJobRepository } from "@/infrastructure/repositories/memory-job-repository";
import { MemoryReportingReadModel } from "@/infrastructure/repositories/memory-reporting-read-model";
import { MemorySkillRepository } from "@/infrastructure/repositories/memory-skill-repository";
import { MemoryTeamMemberRepository } from "@/infrastructure/repositories/memory-team-member-repository";
import { PrismaJobRepository } from "@/infrastructure/repositories/prisma-job-repository";
import { PrismaReportingReadModel } from "@/infrastructure/repositories/prisma-reporting-read-model";
import { PrismaSkillRepository } from "@/infrastructure/repositories/prisma-skill-repository";
import { PrismaTeamMemberRepository } from "@/infrastructure/repositories/prisma-team-member-repository";

const useMemory = process.env.USE_IN_MEMORY_REPO === "true" || !process.env.DATABASE_URL;

const jobRepository = useMemory ? new MemoryJobRepository() : new PrismaJobRepository();
const checklistRepository = useMemory
  ? new MemoryChecklistRepository()
  : new PrismaChecklistRepository();
const skillRepository = useMemory ? new MemorySkillRepository() : new PrismaSkillRepository();
const teamMemberRepository = useMemory
  ? new MemoryTeamMemberRepository()
  : new PrismaTeamMemberRepository();
const reportingReadModel = useMemory
  ? new MemoryReportingReadModel()
  : new PrismaReportingReadModel();
const checklistService = new ChecklistService(checklistRepository, jobRepository);

export const services = {
  checklist: checklistService,
  jobs: new JobService(jobRepository, checklistService),
  skills: new SkillService(skillRepository),
  teamMembers: new TeamMemberService(teamMemberRepository, skillRepository),
  reporting: new ReportingService(reportingReadModel),
};

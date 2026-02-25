import type { JobProps } from "@/domain/job/types";
import type { ChecklistComponent, InspectionSession, Observation, Sector } from "@/domain/checklist/types";
import type { SkillProps } from "@/domain/skill/skill";
import type { TeamMemberProps } from "@/domain/team-member/team-member";

export const memoryStore = {
  jobs: new Map<string, JobProps>(),
  skills: new Map<string, SkillProps>(),
  teamMembers: new Map<string, TeamMemberProps>(),
  sectors: new Map<string, Sector>(),
  components: new Map<string, ChecklistComponent>(),
  sessions: new Map<string, InspectionSession>(),
  observations: new Map<string, Observation>(),
};

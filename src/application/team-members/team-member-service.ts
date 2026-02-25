import type { TeamMemberRepository } from "@/application/team-members/team-member-repository";
import type { SkillRepository } from "@/application/skills/skill-repository";
import {
  assignSkillsToTeamMemberSchema,
  createTeamMemberSchema,
  type AssignSkillsToTeamMemberInput,
  type CreateTeamMemberInput,
} from "@/application/team-members/contracts";
import { TeamMember } from "@/domain/team-member/team-member";

export class TeamMemberService {
  constructor(
    private readonly repository: TeamMemberRepository,
    private readonly skillRepository: SkillRepository,
  ) {}

  async createTeamMember(input: CreateTeamMemberInput) {
    const valid = createTeamMemberSchema.parse(input);

    if (valid.teamMemberId) {
      const existing = await this.repository.getById(valid.teamMemberId);
      if (existing) {
        throw new Error("Team member id must be unique.");
      }
    }

    const teamMember = TeamMember.create({
      teamMemberId: valid.teamMemberId,
      name: valid.name,
      skills: valid.skills,
    });

    await this.repository.create(teamMember.snapshot);
    return teamMember.snapshot;
  }

  async listTeamMembers() {
    return this.repository.list();
  }

  async assignSkills(teamMemberId: string, input: AssignSkillsToTeamMemberInput) {
    const valid = assignSkillsToTeamMemberSchema.parse(input);
    const existing = await this.repository.getById(teamMemberId);
    if (!existing) {
      throw new Error("Team member not found.");
    }

    const skillEntries = await Promise.all(
      valid.skills.map(async (entry) => {
        const skill = await this.skillRepository.findById(entry.skillId);
        if (!skill) {
          throw new Error(`Skill '${entry.skillId}' does not exist in the catalog.`);
        }
        return {
          skillId: skill.id,
          name: skill.name,
          skillPercentage: entry.skillPercentage,
        };
      }),
    );

    const aggregate = TeamMember.rehydrate(existing);
    aggregate.replaceSkills(skillEntries);
    await this.repository.save(aggregate.snapshot);
    return aggregate.snapshot;
  }
}

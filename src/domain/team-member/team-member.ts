import { randomUUID } from "node:crypto";
import { Skill, type SkillProps } from "@/domain/team-member/skill";

class TeamMemberDomainError extends Error {}

type SkillInput = {
  skillId?: string;
  name: string;
  skillPercentage: number;
};

export type TeamMemberProps = {
  teamMemberId: string;
  name: string;
  skills: SkillProps[];
};

export class TeamMember {
  private props: TeamMemberProps;

  private constructor(props: TeamMemberProps) {
    this.props = props;
  }

  static create(input: { teamMemberId?: string; name: string; skills?: SkillInput[] }) {
    const teamMemberId = input.teamMemberId?.trim() || randomUUID();
    const name = input.name.trim();

    if (!name) {
      throw new TeamMemberDomainError("Team member name is required.");
    }

    const skills = TeamMember.buildSkills(input.skills ?? []);
    return new TeamMember({
      teamMemberId,
      name,
      skills,
    });
  }

  static rehydrate(props: TeamMemberProps) {
    return new TeamMember(props);
  }

  updateName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new TeamMemberDomainError("Team member name is required.");
    }
    this.props.name = trimmed;
  }

  replaceSkills(skills: SkillInput[]) {
    this.props.skills = TeamMember.buildSkills(skills);
  }

  get snapshot() {
    return structuredClone(this.props);
  }

  private static buildSkills(skills: SkillInput[]) {
    const seenSkillIds = new Set<string>();
    const mapped: SkillProps[] = [];

    for (const skillInput of skills) {
      const skill = Skill.create(skillInput).snapshot;
      const normalizedId = skill.skillId.toLowerCase();
      if (seenSkillIds.has(normalizedId)) {
        throw new TeamMemberDomainError("Duplicate skillId values are not allowed per team member.");
      }
      seenSkillIds.add(normalizedId);
      mapped.push(skill);
    }

    return mapped;
  }
}

export function isTeamMemberDomainError(error: unknown): error is Error {
  return error instanceof Error && error.name === "Error";
}

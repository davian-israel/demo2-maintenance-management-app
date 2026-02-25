import { randomUUID } from "node:crypto";

class TeamMemberSkillDomainError extends Error {}

export type SkillProps = {
  skillId: string;
  name: string;
  skillPercentage: number;
};

export class Skill {
  private props: SkillProps;

  private constructor(props: SkillProps) {
    this.props = props;
  }

  static create(input: { skillId?: string; name: string; skillPercentage: number }) {
    const name = input.name.trim();
    if (!name) {
      throw new TeamMemberSkillDomainError("Skill name is required.");
    }

    if (
      !Number.isInteger(input.skillPercentage) ||
      input.skillPercentage < 0 ||
      input.skillPercentage > 100
    ) {
      throw new TeamMemberSkillDomainError("Skill percentage must be an integer between 0 and 100.");
    }

    const skillId = input.skillId?.trim() || randomUUID();

    return new Skill({
      skillId,
      name,
      skillPercentage: input.skillPercentage,
    });
  }

  static rehydrate(props: SkillProps) {
    return new Skill(props);
  }

  get snapshot() {
    return structuredClone(this.props);
  }
}

export function isTeamMemberSkillDomainError(error: unknown): error is Error {
  return error instanceof Error && error.name === "Error";
}

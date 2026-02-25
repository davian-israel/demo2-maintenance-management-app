import { randomUUID } from "node:crypto";

class SkillDomainError extends Error {}

export type SkillProps = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  retiredAt: Date | null;
};

export class Skill {
  private props: SkillProps;

  private constructor(props: SkillProps) {
    this.props = props;
  }

  static create(name: string, description: string | null) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new SkillDomainError("Skill name is required.");
    }

    return new Skill({
      id: randomUUID(),
      name: trimmed,
      description,
      isActive: true,
      retiredAt: null,
    });
  }

  static rehydrate(props: SkillProps) {
    return new Skill(props);
  }

  rename(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new SkillDomainError("Skill name cannot be empty.");
    }
    this.props.name = trimmed;
  }

  retire() {
    this.props.isActive = false;
    this.props.retiredAt = new Date();
  }

  get snapshot() {
    return structuredClone(this.props);
  }
}

export function isSkillDomainError(error: unknown): error is Error {
  return error instanceof Error && error.name === "Error";
}

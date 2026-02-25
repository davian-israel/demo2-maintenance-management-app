import type { SkillProps } from "@/domain/skill/skill";

export interface SkillRepository {
  create(skill: SkillProps): Promise<void>;
  list(): Promise<SkillProps[]>;
  findById(skillId: string): Promise<SkillProps | null>;
  findByName(name: string): Promise<SkillProps | null>;
}

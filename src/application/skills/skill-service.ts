import { createSkillSchema, type CreateSkillInput } from "@/application/skills/contracts";
import type { SkillRepository } from "@/application/skills/skill-repository";
import { Skill } from "@/domain/skill/skill";

export class SkillService {
  constructor(private readonly repository: SkillRepository) {}

  async createSkill(input: CreateSkillInput) {
    const valid = createSkillSchema.parse(input);
    const existing = await this.repository.findByName(valid.name);
    if (existing) {
      throw new Error("Skill name must be unique.");
    }
    const skill = Skill.create(valid.name, valid.description ?? null);
    await this.repository.create(skill.snapshot);
    return skill.snapshot;
  }

  async listSkills() {
    return this.repository.list();
  }
}

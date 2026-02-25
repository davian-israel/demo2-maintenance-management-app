import type { SkillRepository } from "@/application/skills/skill-repository";
import type { SkillProps } from "@/domain/skill/skill";
import { memoryStore } from "@/infrastructure/repositories/memory-store";

export class MemorySkillRepository implements SkillRepository {
  async create(skill: SkillProps): Promise<void> {
    memoryStore.skills.set(skill.id, structuredClone(skill));
  }

  async list(): Promise<SkillProps[]> {
    return [...memoryStore.skills.values()].map((skill) => structuredClone(skill));
  }

  async findById(skillId: string): Promise<SkillProps | null> {
    return structuredClone(memoryStore.skills.get(skillId) ?? null);
  }

  async findByName(name: string): Promise<SkillProps | null> {
    return (
      [...memoryStore.skills.values()].find((skill) => skill.name.toLowerCase() === name.toLowerCase()) ?? null
    );
  }
}

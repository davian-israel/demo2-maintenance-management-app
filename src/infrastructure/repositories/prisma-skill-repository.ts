import type { SkillRepository } from "@/application/skills/skill-repository";
import type { SkillProps } from "@/domain/skill/skill";
import { prisma } from "@/infrastructure/prisma/client";

function toDomain(skill: {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  retiredAt: Date | null;
}): SkillProps {
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    isActive: skill.isActive,
    retiredAt: skill.retiredAt,
  };
}

export class PrismaSkillRepository implements SkillRepository {
  async create(skill: SkillProps): Promise<void> {
    await prisma.skill.create({ data: skill });
  }

  async list(): Promise<SkillProps[]> {
    const skills = await prisma.skill.findMany({ orderBy: { name: "asc" } });
    return skills.map(toDomain);
  }

  async findById(skillId: string): Promise<SkillProps | null> {
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });
    return skill ? toDomain(skill) : null;
  }

  async findByName(name: string): Promise<SkillProps | null> {
    const skill = await prisma.skill.findFirst({
      where: { name: { equals: name } },
    });
    return skill ? toDomain(skill) : null;
  }
}

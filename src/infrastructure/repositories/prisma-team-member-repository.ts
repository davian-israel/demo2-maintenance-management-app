import type { TeamMemberRepository } from "@/application/team-members/team-member-repository";
import type { TeamMemberProps } from "@/domain/team-member/team-member";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

type TeamMemberRow = Prisma.TeamMemberGetPayload<{
  include: {
    skills: true;
  };
}>;

function toDomain(row: TeamMemberRow): TeamMemberProps {
  return {
    teamMemberId: row.teamMemberId,
    name: row.name,
    skills: row.skills.map((skill) => ({
      skillId: skill.skillId,
      name: skill.name,
      skillPercentage: skill.skillPercentage,
    })),
  };
}

export class PrismaTeamMemberRepository implements TeamMemberRepository {
  async create(teamMember: TeamMemberProps): Promise<void> {
    await prisma.teamMember.create({
      data: {
        teamMemberId: teamMember.teamMemberId,
        name: teamMember.name,
        skills:
          teamMember.skills.length > 0
            ? {
                createMany: {
                  data: teamMember.skills.map((skill) => ({
                    skillId: skill.skillId,
                    name: skill.name,
                    skillPercentage: skill.skillPercentage,
                  })),
                },
              }
            : undefined,
      },
    });
  }

  async save(teamMember: TeamMemberProps): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.teamMember.update({
        where: { teamMemberId: teamMember.teamMemberId },
        data: {
          name: teamMember.name,
        },
      });

      await tx.teamMemberSkill.deleteMany({
        where: { teamMemberId: teamMember.teamMemberId },
      });

      if (teamMember.skills.length > 0) {
        await tx.teamMemberSkill.createMany({
          data: teamMember.skills.map((skill) => ({
            teamMemberId: teamMember.teamMemberId,
            skillId: skill.skillId,
            name: skill.name,
            skillPercentage: skill.skillPercentage,
          })),
        });
      }
    });
  }

  async list(): Promise<TeamMemberProps[]> {
    const rows = await prisma.teamMember.findMany({
      include: {
        skills: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return rows.map((row) => toDomain(row));
  }

  async getById(teamMemberId: string): Promise<TeamMemberProps | null> {
    const row = await prisma.teamMember.findUnique({
      where: { teamMemberId },
      include: {
        skills: true,
      },
    });

    return row ? toDomain(row) : null;
  }
}

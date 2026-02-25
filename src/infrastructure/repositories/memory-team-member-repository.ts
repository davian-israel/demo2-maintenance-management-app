import type { TeamMemberRepository } from "@/application/team-members/team-member-repository";
import type { TeamMemberProps } from "@/domain/team-member/team-member";
import { memoryStore } from "@/infrastructure/repositories/memory-store";

export class MemoryTeamMemberRepository implements TeamMemberRepository {
  async create(teamMember: TeamMemberProps): Promise<void> {
    memoryStore.teamMembers.set(teamMember.teamMemberId, structuredClone(teamMember));
  }

  async save(teamMember: TeamMemberProps): Promise<void> {
    memoryStore.teamMembers.set(teamMember.teamMemberId, structuredClone(teamMember));
  }

  async list(): Promise<TeamMemberProps[]> {
    return [...memoryStore.teamMembers.values()]
      .map((teamMember) => structuredClone(teamMember))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getById(teamMemberId: string): Promise<TeamMemberProps | null> {
    return structuredClone(memoryStore.teamMembers.get(teamMemberId) ?? null);
  }
}

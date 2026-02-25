import type { TeamMemberProps } from "@/domain/team-member/team-member";

export interface TeamMemberRepository {
  create(teamMember: TeamMemberProps): Promise<void>;
  save(teamMember: TeamMemberProps): Promise<void>;
  list(): Promise<TeamMemberProps[]>;
  getById(teamMemberId: string): Promise<TeamMemberProps | null>;
}

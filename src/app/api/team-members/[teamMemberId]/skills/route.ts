import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamMemberId: string }> },
) {
  const { teamMemberId } = await params;

  try {
    const body = await request.json();
    const teamMember = await services.teamMembers.assignSkills(teamMemberId, body);
    return ok({ teamMember });
  } catch (error) {
    return fail(error, 400);
  }
}

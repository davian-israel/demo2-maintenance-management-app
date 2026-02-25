import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";

export async function GET() {
  try {
    const teamMembers = await services.teamMembers.listTeamMembers();
    return ok({ teamMembers });
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const teamMember = await services.teamMembers.createTeamMember(body);
    return ok({ teamMember }, 201);
  } catch (error) {
    return fail(error, 400);
  }
}

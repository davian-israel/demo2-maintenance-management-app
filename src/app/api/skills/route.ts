import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";

export async function GET() {
  try {
    const skills = await services.skills.listSkills();
    return ok({ skills });
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const skill = await services.skills.createSkill(body);
    return ok({ skill }, 201);
  } catch (error) {
    return fail(error, 400);
  }
}

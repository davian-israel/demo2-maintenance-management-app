import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const assignee = searchParams.get("assignee") ?? undefined;
  const requiredSkill = searchParams.get("requiredSkill") ?? undefined;

  try {
    const jobs = await services.jobs.listJobs({ status, assignee, requiredSkill });
    return ok({ jobs });
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const job = await services.jobs.createJob(body);
    return ok({ job }, 201);
  } catch (error) {
    return fail(error, 400);
  }
}

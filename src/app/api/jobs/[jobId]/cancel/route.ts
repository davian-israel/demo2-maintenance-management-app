import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
    const body = await request.json();
    const job = await services.jobs.cancelJob(jobId, body);
    return ok({ job });
  } catch (error) {
    return fail(error, 400);
  }
}

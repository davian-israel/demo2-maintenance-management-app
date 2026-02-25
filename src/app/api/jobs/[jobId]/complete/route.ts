import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";

export async function POST(_: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
    const job = await services.jobs.completeJob(jobId);
    return ok({ job });
  } catch (error) {
    return fail(error, 400);
  }
}

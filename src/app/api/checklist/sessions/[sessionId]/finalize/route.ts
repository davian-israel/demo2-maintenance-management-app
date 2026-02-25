import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";
import { assertChecklistEnabled } from "@/infrastructure/feature-flags";

export async function POST(_: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    assertChecklistEnabled();
    const { sessionId } = await params;
    const session = await services.checklist.finalizeInspectionSession(sessionId);
    return ok({ session });
  } catch (error) {
    return fail(error, 400);
  }
}

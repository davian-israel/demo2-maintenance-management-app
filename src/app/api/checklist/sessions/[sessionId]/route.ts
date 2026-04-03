import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";
import { assertChecklistEnabled } from "@/infrastructure/feature-flags";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    assertChecklistEnabled();
    const { sessionId } = await params;
    const session = await services.checklist.getInspectionSession(sessionId);
    if (!session) {
      return fail(new Error("Inspection session not found."), 404);
    }
    return ok({ session });
  } catch (error) {
    return fail(error, 400);
  }
}

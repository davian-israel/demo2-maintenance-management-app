import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";
import { assertChecklistEnabled } from "@/infrastructure/feature-flags";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    assertChecklistEnabled();
    const { sessionId } = await context.params;
    const body = await request.json();
    const inspector =
      typeof body.inspector === "string" && body.inspector.trim().length >= 2
        ? body.inspector.trim()
        : null;
    if (!inspector) {
      return fail(new Error("Inspector name is required (min 2 characters)."), 400);
    }

    const { inspector: _drop, ...observationBody } = body;
    const session = await services.checklist.recordObservation(sessionId, inspector, observationBody);
    return ok({ session });
  } catch (error) {
    return fail(error, 400);
  }
}

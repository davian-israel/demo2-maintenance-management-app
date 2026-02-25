import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";
import { assertChecklistEnabled } from "@/infrastructure/feature-flags";

export async function GET(request: Request) {
  try {
    assertChecklistEnabled();
    const { searchParams } = new URL(request.url);
    const trends = await services.checklist.listFailureTrends({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });
    return ok({ trends });
  } catch (error) {
    return fail(error, 400);
  }
}

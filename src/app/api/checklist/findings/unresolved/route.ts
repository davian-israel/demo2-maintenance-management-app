import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";
import { assertChecklistEnabled } from "@/infrastructure/feature-flags";

export async function GET() {
  try {
    assertChecklistEnabled();
    const findings = await services.checklist.listUnresolvedFindings();
    return ok({ findings });
  } catch (error) {
    return fail(error, 500);
  }
}

import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";
import { assertChecklistEnabled } from "@/infrastructure/feature-flags";

export async function POST() {
  try {
    assertChecklistEnabled();
    const result = await services.checklist.seedBaselineCatalog();
    return ok(result, 201);
  } catch (error) {
    return fail(error, 500);
  }
}

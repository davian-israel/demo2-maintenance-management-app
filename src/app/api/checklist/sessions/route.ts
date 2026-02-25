import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";
import { assertChecklistEnabled } from "@/infrastructure/feature-flags";

export async function POST(request: Request) {
  try {
    assertChecklistEnabled();
    const body = await request.json();
    const session = await services.checklist.createInspectionSession(body);
    return ok({ session }, 201);
  } catch (error) {
    return fail(error, 400);
  }
}

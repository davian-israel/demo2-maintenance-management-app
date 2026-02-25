import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";
import { assertChecklistEnabled } from "@/infrastructure/feature-flags";

export async function GET() {
  try {
    assertChecklistEnabled();
    const sectors = await services.checklist.listCatalog();
    return ok({ sectors });
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    assertChecklistEnabled();
    const body = await request.json();
    const sector = await services.checklist.upsertSector(body);
    return ok({ sector }, 201);
  } catch (error) {
    return fail(error, 400);
  }
}

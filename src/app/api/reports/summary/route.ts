import { services } from "@/infrastructure/services";
import { fail, ok } from "@/infrastructure/http";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const year = yearParam ? Number(yearParam) : undefined;
    const summary = await services.reporting.getSummary(Number.isFinite(year) ? year : undefined);
    return ok({ summary });
  } catch (error) {
    return fail(error, 500);
  }
}

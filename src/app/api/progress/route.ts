import { fail, errorMessage, ok } from "@/server/http";
import { getSnapshot } from "@/server/progress-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok(getSnapshot());
  } catch (error) {
    return fail(errorMessage(error), 500);
  }
}

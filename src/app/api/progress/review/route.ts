import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { recordReview } from "@/server/progress-service";
import type { ReviewPayload } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<ReviewPayload>(request);
    return ok(recordReview(payload));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

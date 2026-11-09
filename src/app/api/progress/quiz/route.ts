import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { recordQuizAttempt } from "@/server/progress-service";
import type { QuizAttemptPayload } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<QuizAttemptPayload>(request);
    return ok(recordQuizAttempt(payload));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

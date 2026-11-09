import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { recordExam } from "@/server/progress-service";
import type { ExamPayload } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<ExamPayload>(request);
    return ok(recordExam(payload));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

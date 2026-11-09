import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { recordLesson } from "@/server/progress-service";
import type { LessonPayload } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<LessonPayload>(request);
    return ok(recordLesson(payload));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

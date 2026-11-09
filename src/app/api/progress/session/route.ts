import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { recordSession } from "@/server/progress-service";
import type { SessionPayload } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<SessionPayload>(request);
    return ok(recordSession(payload));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

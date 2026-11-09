import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { recordGame } from "@/server/progress-service";
import type { GameAttemptPayload } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<GameAttemptPayload>(request);
    return ok(recordGame(payload));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

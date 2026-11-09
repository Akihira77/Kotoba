import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { updateSettings } from "@/server/progress-service";
import type { Settings } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<Settings>(request);
    return ok(updateSettings(payload));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

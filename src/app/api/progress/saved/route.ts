import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { saveSavedItem } from "@/server/progress-service";
import type { SavedItemPayload } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<SavedItemPayload>(request);
    return ok(saveSavedItem(payload));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { saveSavedCollection } from "@/server/progress-service";
import type { SavedCollectionPayload } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<SavedCollectionPayload>(request);
    return ok(saveSavedCollection(payload));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

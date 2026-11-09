import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { addCard } from "@/server/progress-service";
import type { AddCardPayload } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<AddCardPayload>(request);
    return ok(addCard(payload));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

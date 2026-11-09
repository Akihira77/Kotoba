import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { toggleCultureFavorite } from "@/server/progress-service";
import type { CultureFavoritePayload } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<CultureFavoritePayload>(request);
    return ok(toggleCultureFavorite(payload));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

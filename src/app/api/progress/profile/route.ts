import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { renameProfile } from "@/server/progress-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<{ name: string }>(request);
    return ok(renameProfile(payload.name));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

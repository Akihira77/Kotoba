import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { resetProgress } from "@/server/progress-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<{ confirm?: boolean }>(request);
    if (!payload.confirm) return fail("Konfirmasi diperlukan", 400);
    return ok(resetProgress());
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

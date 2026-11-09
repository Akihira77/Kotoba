import { ClientError, fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { importProgress } from "@/server/progress-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<{ confirm?: boolean; snapshot?: unknown }>(request);
    if (payload?.confirm !== true) {
      throw new ClientError("Konfirmasi impor diperlukan", 400);
    }
    return ok(importProgress(payload.snapshot));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

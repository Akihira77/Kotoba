import { fail, errorMessage, errorStatus, ok, readJson } from "@/server/http";
import { recordKana } from "@/server/progress-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<{ char: string; script: "hiragana" | "katakana"; correct: boolean }>(request);
    return ok(recordKana(payload));
  } catch (error) {
    return fail(errorMessage(error), errorStatus(error));
  }
}

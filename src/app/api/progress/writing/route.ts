import { NextResponse } from "next/server";
import { errorMessage, errorStatus, readJson } from "@/server/http";
import { recordWriting } from "@/server/progress-service";
import type { WritingPayload } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<WritingPayload>(request);
    return NextResponse.json(recordWriting(payload));
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: errorStatus(error) });
  }
}

import { NextResponse } from "next/server";
import type { StoryPayload } from "@/lib/types";
import { errorMessage, errorStatus, readJson } from "@/server/http";
import { recordStory } from "@/server/progress-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJson<StoryPayload>(request);
    return NextResponse.json(recordStory(payload));
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: errorStatus(error) });
  }
}

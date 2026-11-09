import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Minimal liveness probe: no profile, paths, counts, or database errors. */
export async function GET() {
  return NextResponse.json({ ok: true, version: "0.1.0" });
}

import { NextResponse } from "next/server";
import { exportSnapshot } from "@/server/progress-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = exportSnapshot();
  return new NextResponse(JSON.stringify(snapshot, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="kotoba-progress-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

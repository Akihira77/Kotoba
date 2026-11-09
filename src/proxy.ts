import { NextResponse, type NextRequest } from "next/server";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * Kotoba stores a single local profile without authentication. Binding to
 * loopback is the primary boundary; this proxy rejects DNS-rebinding requests
 * whose Host header is not a loopback name.
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostname = host.replace(/:\d+$/, "").toLowerCase();
  if (!LOOPBACK_HOSTS.has(hostname)) {
    return new NextResponse("Host tidak diizinkan. Kotoba hanya dapat diakses dari localhost.", {
      status: 421,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.svg|manifest.webmanifest).*)",
};

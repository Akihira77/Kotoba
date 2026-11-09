import { NextResponse } from "next/server";

const MAX_BODY_BYTES = 5 * 1024 * 1024;
const INTERNAL_ERROR_PATTERN =
  /SQLITE|constraint failed|FOREIGN KEY|no such table|no such column|Cannot read|undefined is not|fetch failed|ECONN|ENOENT|node:sqlite/i;

export class ClientError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ClientError";
    this.status = status;
  }
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, { status: 200, ...init });
}

export function fail(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Reads a JSON body for a local-first, single-user application.
 *
 * Kotoba is intentionally loopback-only (see src/proxy.ts). These checks close
 * the browser-based CSRF paths that remain on localhost: a cross-origin form or
 * fetch(..., {mode:"no-cors"}) can only send text/plain, form, or
 * application/x-www-form-urlencoded bodies, so requiring application/json
 * plus a same-origin Origin/Sec-Fetch-Site header blocks those writes.
 */
export async function readJson<T>(request: Request): Promise<T> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    throw new ClientError("Permintaan harus menggunakan application/json", 415);
  }

  if (!isSameOriginRequest(request)) {
    throw new ClientError("Asal permintaan tidak diizinkan", 403);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new ClientError("Body permintaan terlalu besar", 413);
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    throw new ClientError("Body permintaan tidak dapat dibaca", 400);
  }
  if (text.length > MAX_BODY_BYTES) {
    throw new ClientError("Body permintaan terlalu besar", 413);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ClientError("Body JSON tidak valid", 400);
  }
}

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * Browser writes must come from the same origin. Next can canonicalize
 * request.url (for example localhost vs 127.0.0.1), so compare the Origin
 * header against the actual Host header first and treat loopback aliases on
 * the same port as equivalent.
 */
export function isSameOriginRequest(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }
  if (originUrl.protocol !== "http:" && originUrl.protocol !== "https:") return false;

  const hostHeader = request.headers.get("host");
  if (!hostHeader) {
    try {
      return originUrl.origin === new URL(request.url).origin;
    } catch {
      return false;
    }
  }

  if (originUrl.host === hostHeader) return true;

  let hostUrl: URL;
  try {
    hostUrl = new URL(`http://${hostHeader}`);
  } catch {
    return false;
  }
  return (
    originUrl.port === hostUrl.port &&
    LOOPBACK_HOSTS.has(originUrl.hostname) &&
    LOOPBACK_HOSTS.has(hostUrl.hostname)
  );
}

/** Keeps validation messages, hides database/runtime internals from clients. */
export function errorMessage(error: unknown): string {
  if (error instanceof ClientError) return error.message;
  if (error instanceof Error) {
    if (INTERNAL_ERROR_PATTERN.test(error.message)) return "Terjadi kesalahan pada server lokal";
    return error.message;
  }
  return "Terjadi kesalahan tak terduga";
}

export function errorStatus(error: unknown): number {
  return error instanceof ClientError ? error.status : 500;
}

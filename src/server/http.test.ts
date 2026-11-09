import { describe, expect, it } from "vitest";
import { isSameOriginRequest } from "./http";

function request(headers: Record<string, string>, url = "http://localhost:3100/api/test") {
  return new Request(url, { method: "POST", headers });
}

describe("isSameOriginRequest", () => {
  it("accepts a matching loopback origin even when Next canonicalizes the request URL", () => {
    expect(
      isSameOriginRequest(
        request(
          { host: "127.0.0.1:3102", origin: "http://127.0.0.1:3102" },
          "http://localhost:3102/api/test",
        ),
      ),
    ).toBe(true);
  });

  it("treats localhost and 127.0.0.1 on the same port as equivalent", () => {
    expect(
      isSameOriginRequest(request({ host: "127.0.0.1:3102", origin: "http://localhost:3102" })),
    ).toBe(true);
  });

  it("rejects a different loopback port", () => {
    expect(
      isSameOriginRequest(request({ host: "127.0.0.1:3102", origin: "http://127.0.0.1:3100" })),
    ).toBe(false);
  });

  it("rejects a cross-origin browser origin", () => {
    expect(
      isSameOriginRequest(request({ host: "127.0.0.1:3102", origin: "http://evil.example" })),
    ).toBe(false);
  });

  it("rejects a cross-site fetch even without an Origin header", () => {
    expect(
      isSameOriginRequest(request({ host: "127.0.0.1:3102", "sec-fetch-site": "cross-site" })),
    ).toBe(false);
  });

  it("allows non-browser clients with no Origin or Sec-Fetch-Site header", () => {
    expect(isSameOriginRequest(request({ host: "127.0.0.1:3102" }))).toBe(true);
  });
});

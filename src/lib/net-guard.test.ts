import { describe, expect, it } from "vitest";
import { isSafeWebhookUrl } from "./net-guard";

describe("proteção SSRF", () => {
  it.each(["http://example.com", "https://localhost/x", "https://127.0.0.1", "https://10.0.0.5", "https://192.168.1.1", "https://169.254.169.254/latest", "https://[::1]/", "https://example.com:8443", "https://user:pw@example.com"])("bloqueia %s", (u) => {
    expect(isSafeWebhookUrl(u)).toBe(false);
  });
  it("aceita https público", () => expect(isSafeWebhookUrl("https://hooks.exemplo.co.mz/payora")).toBe(true));
});
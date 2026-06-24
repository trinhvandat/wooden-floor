import { describe, it, expect } from "vitest";
import { SITE_URL, absoluteUrl } from "./site";

describe("absoluteUrl", () => {
  it("joins a root-relative path onto SITE_URL", () => {
    expect(absoluteUrl("/san-pham")).toBe(`${SITE_URL}/san-pham`);
  });

  it("produces an absolute URL for the homepage", () => {
    expect(absoluteUrl("/")).toBe(`${SITE_URL}/`);
  });

  it("defaults SITE_URL to localhost when the env var is unset", () => {
    // In the test env NEXT_PUBLIC_SITE_URL is not set.
    expect(SITE_URL).toBe("http://localhost:3000");
  });
});

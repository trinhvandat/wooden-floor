import { describe, it, expect } from "vitest";
import robots from "./robots";
import { SITE_URL } from "@/lib/seo/site";

describe("robots", () => {
  it("allows crawling but disallows admin/api/cam-on and points at the sitemap", () => {
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule?.allow).toBe("/");
    expect(rule?.disallow).toEqual(["/admin", "/api", "/cam-on"]);
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});

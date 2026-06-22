import { describe, it, expect } from "vitest";
import { leadInputSchema } from "./schema";

describe("leadInputSchema", () => {
  it("accepts a valid survey lead", () => {
    const r = leadInputSchema.safeParse({
      name: "Nguyen Van A",
      phone: "0901234567",
      source: "survey",
    });
    expect(r.success).toBe(true);
  });

  it("normalises spaced phone numbers", () => {
    const r = leadInputSchema.safeParse({
      name: "A",
      phone: "0901 234 567",
      source: "quote",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.phone).toBe("0901234567");
  });

  it("rejects a missing phone", () => {
    const r = leadInputSchema.safeParse({ name: "A", source: "survey" });
    expect(r.success).toBe(false);
  });

  it("rejects an unknown source", () => {
    const r = leadInputSchema.safeParse({
      name: "A",
      phone: "0901234567",
      source: "facebook",
    });
    expect(r.success).toBe(false);
  });
});

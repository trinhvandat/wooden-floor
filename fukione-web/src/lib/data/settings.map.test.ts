import { describe, it, expect } from "vitest";
import { mapSettings, isZaloEnabled } from "./settings.map";
import type { SettingsDoc } from "./settings.map";

describe("mapSettings", () => {
  it("reconciles businessHours→hours and zaloOA→zaloUrl", () => {
    const doc: SettingsDoc = {
      installPricePerM2: 90000,
      trimEstimate: 700000,
      nap: { name: "FUKIONE", address: "Hà Nội", phone: "0900 000 000" },
      businessHours: "8:00–18:00",
      zaloOA: "https://zalo.me/123",
      showroomAddress: "SR",
      mapEmbed: "<iframe>",
    };
    const s = mapSettings(doc);
    expect(s.hours).toBe("8:00–18:00");
    expect(s.zaloUrl).toBe("https://zalo.me/123");
    expect(s.installPricePerM2).toBe(90000);
    expect(s.nap.phone).toBe("0900 000 000");
    expect(s.showroomAddress).toBe("SR");
  });

  it("falls back to schema-default prices and empty strings when fields are missing", () => {
    const s = mapSettings({});
    expect(s.installPricePerM2).toBe(80000);
    expect(s.trimEstimate).toBe(800000);
    expect(s.hours).toBe("");
    expect(s.zaloUrl).toBe("");
    expect(s.nap).toEqual({ name: "", address: "", phone: "" });
  });
});

describe("isZaloEnabled", () => {
  it("is false for empty or placeholder, true for a real URL", () => {
    expect(isZaloEnabled("")).toBe(false);
    expect(isZaloEnabled("#")).toBe(false);
    expect(isZaloEnabled("  ")).toBe(false);
    expect(isZaloEnabled("https://zalo.me/123")).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { estimateCost } from "./calculator";

const settings = { installPricePerM2: 80000, trimEstimate: 800000 };

describe("estimateCost", () => {
  it("computes material + install + trim for the example case", () => {
    const r = estimateCost({ areaM2: 25, pricePerM2: 450000, withInstall: true }, settings);
    expect(r.material).toBe(11250000);
    expect(r.install).toBe(2000000);
    expect(r.trim).toBe(800000);
    expect(r.total).toBe(14050000);
  });

  it("excludes install when withInstall is false", () => {
    const r = estimateCost({ areaM2: 25, pricePerM2: 450000, withInstall: false }, settings);
    expect(r.install).toBe(0);
    expect(r.total).toBe(12050000);
  });

  it("returns zeros for zero/negative area", () => {
    const r = estimateCost({ areaM2: 0, pricePerM2: 450000, withInstall: true }, settings);
    expect(r.total).toBe(0);
  });
});

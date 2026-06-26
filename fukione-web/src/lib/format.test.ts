import { describe, it, expect } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  it("formats an ISO date as vi-VN day month year", () => {
    expect(formatDate("2026-06-12T00:00:00.000Z")).toBe("12 tháng 6, 2026");
  });
  it("returns empty string for empty/invalid input", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate("not-a-date")).toBe("");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

const { findGlobalMock } = vi.hoisted(() => ({ findGlobalMock: vi.fn() }));
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("payload", () => ({ getPayload: vi.fn(async () => ({ findGlobal: findGlobalMock })) }));

import { getSettings } from "./settings";

beforeEach(() => findGlobalMock.mockReset());

describe("getSettings", () => {
  it("reads the settings global and maps it", async () => {
    findGlobalMock.mockResolvedValue({ businessHours: "8-18", zaloOA: "https://zalo.me/x", installPricePerM2: 90000 });
    const s = await getSettings();
    expect(findGlobalMock).toHaveBeenCalledWith(expect.objectContaining({ slug: "settings" }));
    expect(s.hours).toBe("8-18");
    expect(s.zaloUrl).toBe("https://zalo.me/x");
    expect(s.installPricePerM2).toBe(90000);
  });
});

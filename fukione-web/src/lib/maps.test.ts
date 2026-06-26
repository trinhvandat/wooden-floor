import { describe, it, expect } from "vitest";
import { extractMapSrc } from "./maps";

describe("extractMapSrc", () => {
  it("accepts a plain Google Maps embed URL", () => {
    const src = "https://www.google.com/maps/embed?pb=!1m18!2m3";
    expect(extractMapSrc(src)).toBe(src);
  });

  it("extracts the src from a full <iframe> snippet", () => {
    const snippet =
      '<iframe src="https://www.google.com/maps/embed?pb=!1m18" width="600" height="450" loading="lazy"></iframe>';
    expect(extractMapSrc(snippet)).toBe("https://www.google.com/maps/embed?pb=!1m18");
  });

  it("rejects a non-Google host (URL or snippet)", () => {
    expect(extractMapSrc("https://evil.com/maps/embed?pb=x")).toBeNull();
    expect(extractMapSrc('<iframe src="https://evil.com/x"></iframe>')).toBeNull();
  });

  it("rejects non-https and non-/maps paths", () => {
    expect(extractMapSrc("http://www.google.com/maps/embed?pb=x")).toBeNull();
    expect(extractMapSrc("https://www.google.com/search?q=x")).toBeNull();
  });

  it("rejects a Google host with a /maps-lookalike path", () => {
    expect(extractMapSrc("https://www.google.com/maps-evil/x")).toBeNull();
  });

  it("accepts the bare /maps path and /maps/ subpaths", () => {
    expect(extractMapSrc("https://maps.google.com/maps?q=x&output=embed")).toBe(
      "https://maps.google.com/maps?q=x&output=embed",
    );
    expect(extractMapSrc("https://www.google.com/maps/embed?pb=x")).toBe(
      "https://www.google.com/maps/embed?pb=x",
    );
  });

  it("safely denies (returns null) when a snippet's first src= is a non-Google data-src", () => {
    const snippet =
      '<iframe data-src="https://evil.com/x" src="https://www.google.com/maps/embed?pb=x"></iframe>';
    expect(extractMapSrc(snippet)).toBeNull();
  });

  it("returns null for empty / malformed input", () => {
    expect(extractMapSrc("")).toBeNull();
    expect(extractMapSrc("   ")).toBeNull();
    expect(extractMapSrc("not a url")).toBeNull();
    expect(extractMapSrc("<iframe></iframe>")).toBeNull();
  });
});

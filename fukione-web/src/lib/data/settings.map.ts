import type { Settings } from "@/lib/types";

export interface SettingsDoc {
  installPricePerM2?: number | null;
  trimEstimate?: number | null;
  nap?: { name?: string | null; address?: string | null; phone?: string | null } | null;
  businessHours?: string | null;
  zaloOA?: string | null;
  showroomAddress?: string | null;
  mapEmbed?: string | null;
}

export function mapSettings(doc: SettingsDoc): Settings {
  return {
    installPricePerM2: doc.installPricePerM2 ?? 80_000,
    trimEstimate: doc.trimEstimate ?? 800_000,
    nap: {
      name: doc.nap?.name ?? "",
      address: doc.nap?.address ?? "",
      phone: doc.nap?.phone ?? "",
    },
    hours: doc.businessHours ?? "",
    zaloUrl: doc.zaloOA ?? "",
    showroomAddress: doc.showroomAddress ?? "",
    mapEmbed: doc.mapEmbed ?? "",
  };
}

export function isZaloEnabled(zaloUrl: string): boolean {
  const z = zaloUrl.trim();
  return z !== "" && z !== "#";
}

// Site-wide settings — mirrors the future Payload CMS `Settings` collection

export const SETTINGS = {
  installPricePerM2: 80_000,
  trimEstimate: 800_000,
  nap: {
    name: "FUKIONE",
    address: "Số 12 đường ABC, Cầu Giấy, Hà Nội",
    phone: "0900 000 000",
  },
  hours: "8:00–18:00 hằng ngày",
  zaloUrl: "#",
} as const;

export const ZALO_ENABLED =
  SETTINGS.zaloUrl.trim() !== "" && SETTINGS.zaloUrl.trim() !== "#";

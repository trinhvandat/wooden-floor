import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Settings } from "@/lib/types";
import { mapSettings, type SettingsDoc } from "./settings.map";

export const getSettings = cache(async (): Promise<Settings> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "settings" });
  return mapSettings(doc as unknown as SettingsDoc);
});

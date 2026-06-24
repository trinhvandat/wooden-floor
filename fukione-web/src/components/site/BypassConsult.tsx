import type { Settings } from "@/lib/types";
import { isZaloEnabled } from "@/lib/data/settings.map";

export function BypassConsult({ settings }: { settings: Settings }) {
  const { zaloUrl, nap } = settings;
  const zaloOn = isZaloEnabled(zaloUrl);

  return (
    <p className="text-center text-sm text-muted">
      hoặc{" "}
      {zaloOn && (
        <>
          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-trust hover:underline"
          >
            💬 Zalo
          </a>
          {" · "}
        </>
      )}
      <a
        href={`tel:${nap.phone.replace(/\s/g, "")}`}
        className="font-bold text-trust hover:underline"
      >
        ☎ Gọi ngay
      </a>
    </p>
  );
}

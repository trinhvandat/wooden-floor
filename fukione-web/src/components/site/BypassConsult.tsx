import { SETTINGS } from "@/lib/settings";

export function BypassConsult() {
  const { zaloUrl, nap } = SETTINGS;

  return (
    <p className="text-center text-sm text-muted">
      hoặc{" "}
      <a
        href={zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-trust hover:underline"
      >
        💬 Zalo
      </a>
      {" · "}
      <a
        href={`tel:${nap.phone.replace(/\s/g, "")}`}
        className="font-bold text-trust hover:underline"
      >
        ☎ Gọi ngay
      </a>
    </p>
  );
}

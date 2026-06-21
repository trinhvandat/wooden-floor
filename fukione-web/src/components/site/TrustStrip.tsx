import { Check } from "lucide-react";

interface TrustStripProps {
  items: string[];
}

export function TrustStrip({ items }: TrustStripProps) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {items.map((item) => (
        <span key={item} className="flex items-center gap-1 text-xs font-bold text-trust">
          <Check className="h-3.5 w-3.5 shrink-0" />
          {item}
        </span>
      ))}
    </div>
  );
}

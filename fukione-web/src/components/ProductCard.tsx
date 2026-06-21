import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatVnd } from "@/lib/format";
import { SpecChip } from "./SpecChip";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,.1)]"
    >
      {/* Image block — wood-tone gradient placeholder when no real photo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#C8A97A] to-[#8B5E3C]">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5 p-3">
        <p className="line-clamp-2 text-[13.5px] font-extrabold leading-snug text-ink">
          {product.name}
        </p>

        <p className="text-[15px] font-extrabold text-cta">
          {formatVnd(product.pricePerM2)}
          <span className="text-[11px] font-medium text-muted">/m²</span>
        </p>

        {product.waterproof && (
          <SpecChip>✓ Chống nước</SpecChip>
        )}
      </div>
    </Link>
  );
}

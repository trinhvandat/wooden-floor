export function estimateCost(
  input: { areaM2: number; pricePerM2: number; withInstall: boolean },
  settings: { installPricePerM2: number; trimEstimate: number },
) {
  const area = Math.max(0, input.areaM2);
  if (area === 0) return { material: 0, install: 0, trim: 0, total: 0 };
  const material = area * input.pricePerM2;
  const install = input.withInstall ? area * settings.installPricePerM2 : 0;
  const trim = settings.trimEstimate;
  return { material, install, trim, total: material + install + trim };
}

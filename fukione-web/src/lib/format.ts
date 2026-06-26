/**
 * Format a number as Vietnamese Dong currency.
 * e.g. formatVnd(11250000) === "11.250.000đ"
 */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

/**
 * Format an ISO date string as a Vietnamese long date, e.g. "12 tháng 6, 2026".
 * Returns "" for empty or unparseable input.
 */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

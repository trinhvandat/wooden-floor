/**
 * Format a number as Vietnamese Dong currency.
 * e.g. formatVnd(11250000) === "11.250.000đ"
 */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

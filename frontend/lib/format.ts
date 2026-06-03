import { differenceInDays, format, isToday, isYesterday, parseISO } from "date-fns";

export function formatCurrency(
  amount: number,
  opts: { compact?: boolean; signed?: boolean } = {}
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: opts.compact ? 0 : 2,
    minimumFractionDigits: opts.compact ? 0 : 2,
    signDisplay: opts.signed ? "exceptZero" : "auto",
  });
  return formatter.format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  if (Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 1,
      notation: "compact",
    }).format(amount);
  }
  return formatCurrency(amount, { compact: true });
}

export function formatTransactionDate(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  const daysAgo = differenceInDays(new Date(), d);
  if (daysAgo < 7) return format(d, "EEEE"); // Monday, Tuesday...
  return format(d, "MMM d");
}

export function formatDate(iso: string, pattern = "MMM d, yyyy"): string {
  return format(parseISO(iso), pattern);
}

export function percent(part: number, whole: number): number {
  if (whole === 0) return 0;
  return Math.min(100, Math.round((part / whole) * 100));
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

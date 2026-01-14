import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
}

export function snapValueToStep(
  value: number,
  min: number | undefined,
  max: number | undefined,
  step: number,
): number {
  const offset = min ?? 0;
  const remainder = (value - offset) % step;
  let snappedValue = value - remainder;

  if (Math.abs(remainder) * 2 >= step) {
    snappedValue += remainder > 0 ? step : -step;
  }

  return clamp(snappedValue, min, max);
}

export function handleDecimalOperation(
  operator: "+" | "-",
  value1: number,
  value2: number,
): number {
  let result = operator === "+" ? value1 + value2 : value1 - value2;

  if (value1 % 1 !== 0 || value2 % 1 !== 0) {
    const value1Decimal = value1.toString().split(".");
    const value2Decimal = value2.toString().split(".");
    const value1DecimalLength = value1Decimal[1]?.length || 0;
    const value2DecimalLength = value2Decimal[1]?.length || 0;
    const multiplier = 10 ** Math.max(value1DecimalLength, value2DecimalLength);

    const v1 = Math.round(value1 * multiplier);
    const v2 = Math.round(value2 * multiplier);
    result = operator === "+" ? v1 + v2 : v1 - v2;
    result /= multiplier;
  }

  return result;
}

/**
 * Fuzzy match helper - checks if search query matches target text
 * Case-insensitive and checks if all search terms appear in the target
 */
export function fuzzyMatch(searchQuery: string, targetText: string): boolean {
  if (!searchQuery.trim()) return true;

  const query = searchQuery.toLowerCase().trim();
  const target = targetText.toLowerCase();

  // Split query into words for better fuzzy matching
  const searchTerms = query.split(/\s+/);

  // All search terms must appear in the target
  return searchTerms.every((term) => target.includes(term));
}

/**
 * Get badge style classes based on status string
 * Supports various status types across the application
 */
export function getBadgeStyleByStatus(status: string): string {
  switch (status.toLowerCase()) {
    // 1. Pause / Wait States
    case "waiting":
    case "pending":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/60";

    // 2. Gatekeeping States (Administrative)
    // distinct from "Completed" to show it's ready for the next step
    case "approved":
    case "accepted":
      return "bg-cyan-500/10 text-cyan-600 border-cyan-500/60";

    // 3. Ongoing / Neutral States
    case "active":
    case "in progress":
    case "receiving":
      return "bg-blue-500/10 text-blue-600 border-blue-500/60";

    // 4. Success / Final States
    case "completed":
    case "received":
    case "confirmed":
      return "bg-green-500/10 text-green-600 border-green-500/60";

    // 5. Exception / Rework States
    // "Returned" is rarely "Active" - it usually implies a revision is needed
    case "returned":
      return "bg-orange-500/10 text-orange-600 border-orange-500/60";

    // 6. Failure States
    case "rejected":
    case "cancelled":
      return "bg-red-500/10 text-red-600 border-red-500/60";

    // 7. Neutral / Archived
    default:
      return "bg-slate-500/10 text-slate-600 border-slate-500/60";
  }
}

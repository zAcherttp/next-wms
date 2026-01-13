import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    // Pending/Waiting states
    case "waiting":
    case "pending":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/60";

    // Success/Approved states
    case "approved":
    case "accepted":
      return "bg-green-500/10 text-green-600 border-green-500/60";

    // Active/In Progress states
    case "active":
    case "in progress":
    case "receiving":
      return "bg-green-500/10 text-green-600 border-green-500/60";

    // Completed states
    case "completed":
    case "received":
      return "bg-blue-500/10 text-blue-600 border-blue-500/60";

    // Returned states
    case "returned":
      return "bg-blue-500/10 text-blue-600 border-blue-500/60";

    // Rejected/Cancelled states
    case "rejected":
    case "cancelled":
      return "bg-red-500/10 text-red-600 border-red-500/60";

    // Default/Unknown
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/60";
  }
}

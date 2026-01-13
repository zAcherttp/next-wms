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

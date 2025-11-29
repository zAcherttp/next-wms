/**
 * Prefetch Utilities
 *
 * Provides prefetching capabilities for workspace data to improve
 * perceived performance when switching between workspaces.
 *
 * Usage:
 * - Call prefetchWorkspaceData on hover over workspace items
 * - Uses debouncing to avoid excessive prefetch calls
 */

import { useCallback, useRef } from "react";

/**
 * Options for prefetching workspace data
 */
export interface PrefetchOptions {
  /** Workspace slug to prefetch */
  workspaceSlug: string;

  /** Priority level - 'high' prefetches immediately, 'low' uses longer debounce */
  priority?: "high" | "low";
}

/** Debounce delay for low priority prefetch (ms) */
const LOW_PRIORITY_DELAY = 200;

/** Debounce delay for high priority prefetch (ms) */
const HIGH_PRIORITY_DELAY = 50;

/**
 * Prefetches workspace data for faster navigation
 *
 * Currently triggers Next.js route prefetch via router.prefetch().
 * Can be extended to prefetch additional data (organization details, etc.)
 */
export function prefetchWorkspaceData(options: PrefetchOptions): void {
  const { workspaceSlug, priority = "low" } = options;

  // Use Next.js link prefetch behavior by creating a hidden link
  // This is a lightweight approach that works without direct router access
  const href = `/${workspaceSlug}/dashboard`;

  // Check if prefetch link already exists
  const existingLink = document.querySelector(
    `link[rel="prefetch"][href="${href}"]`,
  );
  if (existingLink) {
    return; // Already prefetched
  }

  // Create prefetch link
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;
  link.as = "document";

  // Set priority hint
  if (priority === "high") {
    link.setAttribute("fetchpriority", "high");
  }

  document.head.appendChild(link);

  // Clean up after a delay to avoid accumulating prefetch links
  setTimeout(
    () => {
      link.remove();
    },
    60000, // Remove after 1 minute
  );
}

/**
 * Hook for debounced workspace prefetching
 *
 * Returns a function that can be called on hover to prefetch workspace data.
 * Automatically debounces rapid hover events.
 *
 * @example
 * ```tsx
 * function WorkspaceItem({ slug }: { slug: string }) {
 *   const prefetch = usePrefetchWorkspace();
 *
 *   return (
 *     <div onMouseEnter={() => prefetch(slug)}>
 *       ...
 *     </div>
 *   );
 * }
 * ```
 */
export function usePrefetchWorkspace() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPrefetchedRef = useRef<string | null>(null);

  const prefetch = useCallback(
    (workspaceSlug: string, priority: "high" | "low" = "low") => {
      // Skip if we just prefetched this workspace
      if (lastPrefetchedRef.current === workspaceSlug) {
        return;
      }

      // Clear any pending prefetch
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const delay =
        priority === "high" ? HIGH_PRIORITY_DELAY : LOW_PRIORITY_DELAY;

      timeoutRef.current = setTimeout(() => {
        prefetchWorkspaceData({ workspaceSlug, priority });
        lastPrefetchedRef.current = workspaceSlug;
        timeoutRef.current = null;
      }, delay);
    },
    [],
  );

  return prefetch;
}

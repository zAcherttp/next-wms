"use client";

/**
 * Permission checking hook - re-exported from auth-queries for backwards compatibility.
 *
 * Uses React Query with memoized Set for O(1) permission lookups.
 */

import { organization } from "@/lib/auth-client";

export { organization } from "@/lib/auth-client";
export {
  type Permissions,
  useHasPermission,
  usePermissions,
} from "@/lib/auth-queries";

/**
 * Return type for the useHasPermission hook.
 */
export interface UseHasPermissionReturn {
  hasPermission: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Check role permission synchronously (client-side only).
 * Does not include dynamic roles - use useHasPermission for full checks.
 *
 * @param permissions - Object mapping resources to required actions
 * @param role - The role to check against
 * @returns Whether the role has the permissions
 */
export function checkRolePermission(
  permissions: Record<string, string[]>,
  role: "member" | "admin" | "owner",
): boolean {
  return organization.checkRolePermission({
    permissions,
    role,
  });
}

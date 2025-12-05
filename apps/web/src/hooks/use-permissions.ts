"use client";

/**
 * Permission hooks - re-exported from auth-queries for backwards compatibility.
 *
 * Uses React Query with memoized Set for O(1) permission lookups.
 */

export {
  type Permissions,
  usePermissionCheck,
  usePermissionMap,
  usePermissions,
} from "@/lib/auth-queries";

/**
 * Return type for usePermissions hook
 */
export interface UsePermissionsReturn {
  hasPermission: (resource: string, action: string) => boolean;
  can: (resource: string) => (action: string) => boolean;
  hasAny: (checks: Array<{ resource: string; action: string }>) => boolean;
  hasAll: (checks: Array<{ resource: string; action: string }>) => boolean;
  role: string | null;
  isReady: boolean;
  isLoading: boolean;
  permissionSet: Set<string>;
}

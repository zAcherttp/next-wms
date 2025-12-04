"use client";

import { useMemo } from "react";
import { organization } from "@/lib/auth-client";
import { selectMembership, selectStatus, useGlobalStore } from "@/stores";

/**
 * Permission check structure matching Better Auth's hasPermission API.
 * Keys are resource names, values are arrays of required actions.
 *
 * @example
 * ```ts
 * const permissions: Permissions = {
 *   member: ["invite", "kick"],
 *   role: ["create"],
 * };
 * ```
 */
export type Permissions = Record<string, string[]>;

/**
 * Return type for the useHasPermission hook.
 */
export interface UseHasPermissionReturn {
  /** Whether the user has the specified permission(s) */
  hasPermission: boolean;
  /** Whether the permission check is in progress (store not ready) */
  isLoading: boolean;
  /** Error that occurred during permission check (always null with O(1) lookup) */
  error: Error | null;
  /** Manually refetch - no-op for O(1) lookup, kept for API compatibility */
  refetch: () => Promise<void>;
}

/**
 * Hook to check if the current user has specific permissions.
 *
 * Uses O(1) Zustand store lookup instead of async API calls.
 * The GlobalStateProvider initializes the permission set on app load.
 *
 * @param permissions - Object mapping resources to required actions
 * @param options - Additional options
 * @returns Permission check result with loading state
 *
 * @example
 * ```tsx
 * function InviteButton() {
 *   const { hasPermission, isLoading } = useHasPermission({
 *     member: ["invite"],
 *   });
 *
 *   if (isLoading) return <Skeleton />;
 *   if (!hasPermission) return null;
 *
 *   return <Button>Invite Member</Button>;
 * }
 * ```
 */
export function useHasPermission(
  permissions: Permissions,
  options: { enabled?: boolean } = {},
): UseHasPermissionReturn {
  const { enabled = true } = options;

  // Get O(1) permission check function from store
  const storeHasPermission = useGlobalStore((state) => state.hasPermission);
  const status = useGlobalStore(selectStatus);
  const membership = useGlobalStore(selectMembership);

  const isLoading = status === "loading" || status === "idle";

  // O(1) permission check - no async, no API calls
  const hasPermission = useMemo(() => {
    if (!enabled || isLoading || !membership) {
      return false;
    }

    // Check all required permissions
    for (const [resource, actions] of Object.entries(permissions)) {
      for (const action of actions) {
        if (!storeHasPermission(resource, action)) {
          return false;
        }
      }
    }
    return true;
  }, [enabled, isLoading, membership, permissions, storeHasPermission]);

  return {
    hasPermission,
    isLoading,
    error: null, // O(1) lookup never throws
    refetch: async () => {
      // No-op - O(1) lookup doesn't need refetch
      // Store is automatically updated by GlobalStateProvider
    },
  };
}

/**
 * Check role permission synchronously (client-side only).
 * Does not include dynamic roles - use useHasPermission for full checks.
 *
 * @param permissions - Object mapping resources to required actions
 * @param role - The role to check against
 * @returns Whether the role has the permissions
 *
 * @example
 * ```ts
 * const canInvite = checkRolePermission({ member: ["invite"] }, "admin");
 * ```
 */
export function checkRolePermission(
  permissions: Permissions,
  role: "member" | "admin" | "owner",
): boolean {
  return organization.checkRolePermission({
    permissions,
    role,
  });
}

/**
 * Hook for checking multiple permissions and getting a permission map.
 *
 * Uses O(1) Zustand store lookup for instant permission checks.
 *
 * @param permissionChecks - Object with named permission checks
 * @returns Object with same keys but boolean values indicating permission status
 *
 * @example
 * ```tsx
 * const permissions = usePermissions({
 *   canInvite: { member: ["invite"] },
 *   canKick: { member: ["kick"] },
 *   canManageRoles: { role: ["create", "update", "delete"] },
 * });
 *
 * if (permissions.canInvite) {
 *   // Show invite button
 * }
 * ```
 */
export function usePermissions<T extends Record<string, Permissions>>(
  permissionChecks: T,
): { [K in keyof T]: boolean } & { isLoading: boolean } {
  // Get O(1) permission check function from store
  const storeHasPermission = useGlobalStore((state) => state.hasPermission);
  const status = useGlobalStore(selectStatus);
  const membership = useGlobalStore(selectMembership);

  const isLoading = status === "loading" || status === "idle";

  // O(1) permission checks - no async, no API calls
  const permissions = useMemo(() => {
    const results: Record<string, boolean> = {};

    if (isLoading || !membership) {
      // Return all false while loading
      for (const key of Object.keys(permissionChecks)) {
        results[key] = false;
      }
      return results;
    }

    for (const [key, perms] of Object.entries(permissionChecks)) {
      // Check if all permissions for this key are satisfied
      let hasAll = true;
      for (const [resource, actions] of Object.entries(perms)) {
        for (const action of actions) {
          if (!storeHasPermission(resource, action)) {
            hasAll = false;
            break;
          }
        }
        if (!hasAll) break;
      }
      results[key] = hasAll;
    }

    return results;
  }, [isLoading, membership, permissionChecks, storeHasPermission]);

  return {
    ...permissions,
    isLoading,
  } as { [K in keyof T]: boolean } & { isLoading: boolean };
}

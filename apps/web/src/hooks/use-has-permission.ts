"use client";

import { useCallback, useEffect, useState } from "react";
import { organization, useActiveMemberRole } from "@/lib/auth-client";

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
  /** Whether the permission check is in progress */
  isLoading: boolean;
  /** Error that occurred during permission check */
  error: Error | null;
  /** Manually refetch the permission check */
  refetch: () => Promise<void>;
}

/**
 * Hook to check if the current user has specific permissions in their active organization.
 *
 * Uses Better Auth's `hasPermission` API for server-side validation.
 * For client-side checks without server round-trip, use `checkRolePermission` directly.
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
  const { data: roleData, isPending: roleLoading } = useActiveMemberRole();

  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkPermission = useCallback(async () => {
    if (!enabled || !roleData?.role) {
      setIsLoading(false);
      setHasPermission(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await organization.hasPermission({
        permissions,
      });

      setHasPermission(result.data?.success ?? false);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Permission check failed"),
      );
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, roleData?.role, permissions]);

  useEffect(() => {
    if (!roleLoading) {
      checkPermission();
    }
  }, [roleLoading, checkPermission]);

  return {
    hasPermission,
    isLoading: isLoading || roleLoading,
    error,
    refetch: checkPermission,
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
  const { data: roleData, isPending: roleLoading } = useActiveMemberRole();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (roleLoading || !roleData?.role) {
      setIsLoading(true);
      return;
    }

    const checkAll = async () => {
      setIsLoading(true);
      const results: Record<string, boolean> = {};

      await Promise.all(
        Object.entries(permissionChecks).map(async ([key, perms]) => {
          try {
            const result = await organization.hasPermission({
              permissions: perms,
            });
            results[key] = result.data?.success ?? false;
          } catch {
            results[key] = false;
          }
        }),
      );

      setPermissions(results);
      setIsLoading(false);
    };

    checkAll();
  }, [roleData?.role, roleLoading, permissionChecks]);

  return {
    ...permissions,
    isLoading,
  } as { [K in keyof T]: boolean } & { isLoading: boolean };
}

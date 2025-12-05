"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { authClient } from "@/lib/auth-client";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Permission check structure matching Better Auth's hasPermission API.
 * Keys are resource names, values are arrays of required actions.
 */
export type Permissions = Record<string, string[]>;

// ============================================================================
// QUERY KEYS
// ============================================================================

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  organizations: () => [...authKeys.all, "organizations"] as const,
  activeOrganization: () => [...authKeys.all, "activeOrganization"] as const,
};

// ============================================================================
// CACHE CONFIG
// ============================================================================

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 30 * 60 * 1000; // 30 minutes

// ============================================================================
// PERMISSION UTILITIES
// ============================================================================

/**
 * Build a Set of "resource:action" strings for O(1) lookup
 */
function buildPermissionSet(
  permissions: Record<string, string[]> | undefined,
): Set<string> {
  const set = new Set<string>();
  if (!permissions) return set;
  for (const [resource, actions] of Object.entries(permissions)) {
    for (const action of actions) {
      set.add(`${resource}:${action}`);
    }
  }
  return set;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get current session/user
 */
export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const result = await authClient.getSession();
      if (result.error)
        throw new Error(result.error.message ?? "Failed to get session");
      return result.data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Get user's organizations list
 */
export function useOrganizations() {
  return useQuery({
    queryKey: authKeys.organizations(),
    queryFn: async () => {
      const result = await authClient.organization.list();
      if (result.error)
        throw new Error(result.error.message ?? "Failed to list organizations");
      return result.data ?? [];
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Get active organization with full details
 */
export function useActiveOrganization() {
  return useQuery({
    queryKey: authKeys.activeOrganization(),
    queryFn: async () => {
      const result = await authClient.organization.getFullOrganization();
      if (result.error) {
        // 404 = no active org, not an error
        if (result.error.status === 404) return null;
        throw new Error(
          result.error.message ?? "Failed to get active organization",
        );
      }
      return result.data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Get active member's role
 */
export function useActiveRole() {
  const { data: activeOrg, ...rest } = useActiveOrganization();
  // @ts-expect-error - activeMember structure varies
  const role = activeOrg?.activeMember?.role ?? null;
  return { data: role, ...rest };
}

/**
 * Get current user (shorthand)
 */
export function useUser() {
  const { data: session, ...rest } = useSession();
  return { data: session?.user ?? null, ...rest };
}

// ============================================================================
// PERMISSION HOOKS
// ============================================================================

/**
 * Hook for efficient client-side permission checking.
 * Uses memoized Set for O(1) lookups.
 *
 * @example
 * ```tsx
 * function InventoryActions() {
 *   const { hasPermission, can, isReady } = usePermissions();
 *
 *   if (!isReady) return <Skeleton />;
 *
 *   const canInventory = can("inventory");
 *   return (
 *     <div>
 *       {canInventory("create") && <CreateButton />}
 *       {hasPermission("reports", "export") && <ExportButton />}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions() {
  const { data: activeOrg, isPending, isError } = useActiveOrganization();

  // Extract role from active organization
  // @ts-expect-error - activeMember structure varies
  const role = activeOrg?.activeMember?.role;
  const permissions: Record<string, string[]> | undefined = role?.permissions;
  const roleName: string | null = role?.role ?? null;

  // Build permission set once (O(1) lookup)
  const permissionSet = useMemo(
    () => buildPermissionSet(permissions),
    [permissions],
  );

  // O(1) permission check
  const hasPermission = useCallback(
    (resource: string, action: string): boolean => {
      return permissionSet.has(`${resource}:${action}`);
    },
    [permissionSet],
  );

  // Curried permission checker for a resource
  const can = useCallback(
    (resource: string) => (action: string) => hasPermission(resource, action),
    [hasPermission],
  );

  // Check if user has ANY of the specified permissions
  const hasAny = useCallback(
    (checks: Array<{ resource: string; action: string }>): boolean => {
      return checks.some(({ resource, action }) =>
        hasPermission(resource, action),
      );
    },
    [hasPermission],
  );

  // Check if user has ALL of the specified permissions
  const hasAll = useCallback(
    (checks: Array<{ resource: string; action: string }>): boolean => {
      return checks.every(({ resource, action }) =>
        hasPermission(resource, action),
      );
    },
    [hasPermission],
  );

  const isReady = !isPending && !isError && !!activeOrg;
  const isLoading = isPending;

  return {
    hasPermission,
    can,
    hasAny,
    hasAll,
    role: roleName,
    isReady,
    isLoading,
    permissionSet,
  };
}

/**
 * Hook for checking a single permission with loading state.
 *
 * @example
 * ```tsx
 * function CreateButton() {
 *   const { allowed, loading } = usePermissionCheck("inventory", "create");
 *   if (loading) return <Skeleton />;
 *   if (!allowed) return null;
 *   return <Button>Create Item</Button>;
 * }
 * ```
 */
export function usePermissionCheck(
  resource: string,
  action: string,
): { allowed: boolean; loading: boolean } {
  const { hasPermission, isLoading, isReady } = usePermissions();
  return {
    allowed: isReady && hasPermission(resource, action),
    loading: isLoading,
  };
}

/**
 * Hook for batch permission checking.
 *
 * @example
 * ```tsx
 * const perms = usePermissionMap({
 *   canInvite: ["member", "invite"],
 *   canKick: ["member", "kick"],
 * });
 *
 * if (perms.canInvite) { ... }
 * ```
 */
export function usePermissionMap<
  T extends Record<string, [resource: string, action: string]>,
>(checks: T): { [K in keyof T]: boolean } & { isReady: boolean } {
  const { hasPermission, isReady } = usePermissions();

  const result = useMemo(() => {
    const obj: Record<string, boolean> = {};
    for (const [key, [resource, action]] of Object.entries(checks)) {
      obj[key] = isReady && hasPermission(resource, action);
    }
    return obj as { [K in keyof T]: boolean };
  }, [checks, hasPermission, isReady]);

  return { ...result, isReady };
}

/**
 * Hook to check if the current user has specific permissions.
 *
 * @example
 * ```tsx
 * const { hasPermission, isLoading } = useHasPermission({
 *   member: ["invite"],
 * });
 * ```
 */
export function useHasPermission(
  permissions: Permissions,
  options: { enabled?: boolean } = {},
): { hasPermission: boolean; isLoading: boolean; error: Error | null } {
  const { enabled = true } = options;
  const { isPending, isError, error: queryError } = useActiveOrganization();
  const { hasPermission: checkPerm, isReady } = usePermissions();

  const isLoading = isPending;

  const hasAllPermissions = useMemo(() => {
    if (!enabled || !isReady) return false;

    for (const [resource, actions] of Object.entries(permissions)) {
      for (const action of actions) {
        if (!checkPerm(resource, action)) {
          return false;
        }
      }
    }
    return true;
  }, [enabled, isReady, permissions, checkPerm]);

  return {
    hasPermission: hasAllPermissions,
    isLoading,
    error: isError ? (queryError as Error) : null,
  };
}

// ============================================================================
// INVALIDATION HOOK
// ============================================================================

/**
 * Hook to invalidate/refetch auth queries
 */
export function useAuthActions() {
  const queryClient = useQueryClient();

  return {
    /** Invalidate all auth queries */
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: authKeys.all }),

    /** Invalidate session */
    invalidateSession: () =>
      queryClient.invalidateQueries({ queryKey: authKeys.session() }),

    /** Invalidate organizations */
    invalidateOrganizations: () =>
      queryClient.invalidateQueries({ queryKey: authKeys.organizations() }),

    /** Invalidate active organization */
    invalidateActiveOrganization: () =>
      queryClient.invalidateQueries({
        queryKey: authKeys.activeOrganization(),
      }),

    /** Switch organization and refetch */
    switchOrganization: async (orgId: string) => {
      await authClient.organization.setActive({ organizationId: orgId });
      await queryClient.invalidateQueries({
        queryKey: authKeys.activeOrganization(),
      });
    },
  };
}

// ============================================================================
// SSR PREFETCH HELPERS
// ============================================================================

/**
 * Prefetch auth data for SSR (call in server component)
 */
export async function prefetchAuthData(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: authKeys.session(),
      queryFn: async () => {
        const result = await authClient.getSession();
        if (result.error) return null;
        return result.data;
      },
      staleTime: STALE_TIME,
    }),
    queryClient.prefetchQuery({
      queryKey: authKeys.organizations(),
      queryFn: async () => {
        const result = await authClient.organization.list();
        if (result.error) return [];
        return result.data ?? [];
      },
      staleTime: STALE_TIME,
    }),
    queryClient.prefetchQuery({
      queryKey: authKeys.activeOrganization(),
      queryFn: async () => {
        const result = await authClient.organization.getFullOrganization();
        if (result.error) return null;
        return result.data;
      },
      staleTime: STALE_TIME,
    }),
  ]);
}

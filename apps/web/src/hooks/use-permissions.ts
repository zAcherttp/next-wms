"use client";

import { useCallback, useMemo } from "react";
import {
  type GlobalStore,
  selectMembership,
  selectStatus,
  useGlobalStore,
} from "@/stores/global-store";

// Typed selectors for store methods to avoid implicit any
const selectHasPermission = (s: GlobalStore) => s.hasPermission;
const selectHasAnyPermission = (s: GlobalStore) => s.hasAnyPermission;
const selectHasAllPermissions = (s: GlobalStore) => s.hasAllPermissions;

/**
 * Permission check result with utilities
 */
export interface UsePermissionsReturn {
  /**
   * Check if user has a specific permission.
   * O(1) lookup using denormalized Set.
   *
   * @example
   * ```ts
   * const { hasPermission } = usePermissions();
   * if (hasPermission("inventory", "create")) {
   *   // User can create inventory
   * }
   * ```
   */
  hasPermission: (resource: string, action: string) => boolean;

  /**
   * Shorthand for common permission checks.
   * Returns a curried function for the resource.
   *
   * @example
   * ```ts
   * const { can } = usePermissions();
   * const canInventory = can("inventory");
   * if (canInventory("create")) { ... }
   * if (canInventory("delete")) { ... }
   * ```
   */
  can: (resource: string) => (action: string) => boolean;

  /**
   * Check multiple permissions at once (ANY match)
   */
  hasAny: (checks: Array<{ resource: string; action: string }>) => boolean;

  /**
   * Check multiple permissions at once (ALL must match)
   */
  hasAll: (checks: Array<{ resource: string; action: string }>) => boolean;

  /**
   * Current user's role name
   */
  role: string | null;

  /**
   * Whether permission data is ready
   */
  isReady: boolean;

  /**
   * Whether the store is still loading
   */
  isLoading: boolean;
}

/**
 * Hook for efficient client-side permission checking.
 *
 * Uses Zustand store with denormalized permission Set for O(1) lookups.
 * Optimized for minimal re-renders using shallow comparison.
 *
 * @example
 * ```tsx
 * function InventoryActions() {
 *   const { hasPermission, can, isReady } = usePermissions();
 *
 *   if (!isReady) return <Skeleton />;
 *
 *   const canInventory = can("inventory");
 *
 *   return (
 *     <div>
 *       {canInventory("create") && <CreateButton />}
 *       {canInventory("delete") && <DeleteButton />}
 *       {hasPermission("reports", "export") && <ExportButton />}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions(): UsePermissionsReturn {
  // Get store methods (stable references)
  const storeHasPermission = useGlobalStore(selectHasPermission);
  const storeHasAny = useGlobalStore(selectHasAnyPermission);
  const storeHasAll = useGlobalStore(selectHasAllPermissions);

  // Get state with shallow comparison for minimal re-renders
  const membership = useGlobalStore(selectMembership);
  const status = useGlobalStore(selectStatus);

  // Memoized role
  const role = useMemo(
    () => membership?.role.role ?? null,
    [membership?.role.role],
  );

  // Status checks
  const isReady = status === "ready";
  const isLoading = status === "loading" || status === "idle";

  // Curried permission checker for a resource
  const can = useCallback(
    (resource: string) => (action: string) =>
      storeHasPermission(resource, action),
    [storeHasPermission],
  );

  return {
    hasPermission: storeHasPermission,
    can,
    hasAny: storeHasAny,
    hasAll: storeHasAll,
    role,
    isReady,
    isLoading,
  };
}

/**
 * Hook for checking a single permission with loading state.
 * Useful for conditional rendering with skeleton fallback.
 *
 * @example
 * ```tsx
 * function CreateInventoryButton() {
 *   const { allowed, loading } = usePermissionCheck("inventory", "create");
 *
 *   if (loading) return <Skeleton className="w-24 h-10" />;
 *   if (!allowed) return null;
 *
 *   return <Button>Create Item</Button>;
 * }
 * ```
 */
export function usePermissionCheck(
  resource: string,
  action: string,
): { allowed: boolean; loading: boolean } {
  const hasPermission = useGlobalStore(selectHasPermission);
  const status = useGlobalStore(selectStatus);

  const loading = status === "loading" || status === "idle";
  const allowed = !loading && hasPermission(resource, action);

  return { allowed, loading };
}

/**
 * Hook for batch permission checking.
 * Returns an object with named permission results.
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const perms = usePermissionMap({
 *     canInvite: ["member", "invite"],
 *     canKick: ["member", "kick"],
 *     canManageRoles: ["role", "update"],
 *     canExportReports: ["reports", "export"],
 *   });
 *
 *   return (
 *     <div>
 *       {perms.canInvite && <InviteButton />}
 *       {perms.canKick && <KickButton />}
 *       {perms.canManageRoles && <RolesSection />}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissionMap<
  T extends Record<string, [resource: string, action: string]>,
>(checks: T): { [K in keyof T]: boolean } & { isReady: boolean } {
  const hasPermission = useGlobalStore(selectHasPermission);
  const status = useGlobalStore(selectStatus);

  const isReady = status === "ready";

  // Build result object
  const result = useMemo(() => {
    const obj: Record<string, boolean> = {};
    for (const [key, [resource, action]] of Object.entries(checks)) {
      obj[key] = isReady && hasPermission(resource, action);
    }
    return obj as { [K in keyof T]: boolean };
  }, [checks, hasPermission, isReady]);

  return { ...result, isReady };
}

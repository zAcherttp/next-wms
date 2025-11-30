/**
 * Type definitions for the global store system.
 * Designed for WMS with multi-tenant, multi-warehouse support.
 */

/**
 * Warehouse/Branch information
 */
export interface Warehouse {
  id: string;
  name: string;
  slug: string;
  address?: string;
  isDefault?: boolean;
}

/**
 * Tenant/Organization information
 */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  warehouses: Warehouse[];
}

/**
 * User session information
 */
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
}

/**
 * Member role with permissions
 */
export interface MemberRole {
  id: string;
  role: string;
  /** Raw permission object from Better Auth */
  permissions: Record<string, string[]>;
}

/**
 * Current membership context
 */
export interface Membership {
  memberId: string;
  role: MemberRole;
  joinedAt: Date;
}

/**
 * Permission check function type
 */
export type PermissionChecker = (resource: string, action: string) => boolean;

/**
 * Convex context for queries/mutations
 */
export interface ConvexContext {
  tenantId: string | null;
  warehouseId: string | null;
  userId: string | null;
}

/**
 * Store initialization status
 */
export type StoreStatus = "idle" | "loading" | "ready" | "error" | "switching";

/**
 * Persisted state (only tenant/warehouse selection)
 */
export interface PersistedState {
  selectedTenantId: string | null;
  selectedWarehouseId: string | null;
}

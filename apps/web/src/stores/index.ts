/**
 * Stores barrel export
 *
 * Central export point for all Zustand stores and related types.
 */

// Re-export the store type
export type { GlobalStore } from "./global-store";
// Global store and selectors
export {
  selectCurrentTenant,
  selectCurrentTenantId,
  selectCurrentWarehouse,
  selectCurrentWarehouseId,
  selectCurrentWarehouses,
  selectError,
  selectIsSwitching,
  selectMembership,
  selectRefetchCounter,
  selectStatus,
  selectTenants,
  selectUser,
  useGlobalStore,
} from "./global-store";

// Types
export type {
  ConvexContext,
  MemberRole,
  Membership,
  PermissionChecker,
  PersistedState,
  StoreStatus,
  Tenant,
  User,
  Warehouse,
} from "./types";

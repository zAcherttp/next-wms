import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  ConvexContext,
  Membership,
  StoreStatus,
  Tenant,
  User,
  Warehouse,
} from "./types";

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface GlobalState {
  // --- Core Data ---
  user: User | null;
  tenants: Tenant[];
  currentTenantId: string | null;
  currentWarehouseId: string | null;
  membership: Membership | null;

  // --- Denormalized Permission Set for O(1) Lookup ---
  /** Format: "resource:action" e.g., "member:invite", "inventory:create" */
  permissionSet: Set<string>;

  // --- Status ---
  status: StoreStatus;
  error: string | null;
  lastSyncAt: number | null;

  // --- Switching Lock (prevent race conditions) ---
  isSwitching: boolean;
}

interface GlobalActions {
  // --- Core Setters ---
  setUser: (user: User | null) => void;
  setTenants: (tenants: Tenant[]) => void;
  setMembership: (membership: Membership | null) => void;

  // --- Tenant/Warehouse Switching ---
  switchTenant: (tenantId: string) => Promise<void>;
  switchWarehouse: (warehouseId: string) => void;

  // --- Permission Checking (O(1)) ---
  hasPermission: (resource: string, action: string) => boolean;
  hasAnyPermission: (
    checks: Array<{ resource: string; action: string }>,
  ) => boolean;
  hasAllPermissions: (
    checks: Array<{ resource: string; action: string }>,
  ) => boolean;

  // --- Initialization ---
  initialize: (data: InitializeData) => void;
  reset: () => void;

  // --- Helpers ---
  getCurrentTenant: () => Tenant | null;
  getCurrentWarehouse: () => Warehouse | null;
  getConvexContext: () => ConvexContext;

  // --- Internal ---
  _updatePermissionSet: (permissions: Record<string, string[]>) => void;
  _setStatus: (status: StoreStatus, error?: string | null) => void;
}

interface InitializeData {
  user: User;
  tenants: Tenant[];
  currentTenantId?: string;
  currentWarehouseId?: string;
  membership?: Membership;
}

export type GlobalStore = GlobalState & GlobalActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: GlobalState = {
  user: null,
  tenants: [],
  currentTenantId: null,
  currentWarehouseId: null,
  membership: null,
  permissionSet: new Set(),
  status: "idle",
  error: null,
  lastSyncAt: null,
  isSwitching: false,
};

// ============================================================================
// STORE CREATION
// ============================================================================

export const useGlobalStore = create<GlobalStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          ...initialState,

          // ----------------------------------------------------------------
          // CORE SETTERS
          // ----------------------------------------------------------------

          setUser: (user) => {
            set(
              (state) => {
                state.user = user;
              },
              false,
              "setUser",
            );
          },

          setTenants: (tenants) => {
            set(
              (state) => {
                state.tenants = tenants;
              },
              false,
              "setTenants",
            );
          },

          setMembership: (membership) => {
            set(
              (state) => {
                state.membership = membership;
                if (membership?.role.permissions) {
                  get()._updatePermissionSet(membership.role.permissions);
                } else {
                  state.permissionSet = new Set();
                }
              },
              false,
              "setMembership",
            );
          },

          // ----------------------------------------------------------------
          // TENANT/WAREHOUSE SWITCHING
          // ----------------------------------------------------------------

          switchTenant: async (tenantId) => {
            const { isSwitching, tenants, currentTenantId } = get();

            // Prevent concurrent switches
            if (isSwitching || tenantId === currentTenantId) return;

            const tenant = tenants.find((t) => t.id === tenantId);
            if (!tenant) {
              set(
                (state) => {
                  state.error = "Tenant not found";
                },
                false,
                "switchTenant/error",
              );
              return;
            }

            set(
              (state) => {
                state.isSwitching = true;
                state.status = "switching";
                state.error = null;
              },
              false,
              "switchTenant/start",
            );

            try {
              // Set new tenant
              set(
                (state) => {
                  state.currentTenantId = tenantId;
                  // Auto-select default warehouse or first one
                  const defaultWarehouse =
                    tenant.warehouses.find((w) => w.isDefault) ??
                    tenant.warehouses[0];
                  state.currentWarehouseId = defaultWarehouse?.id ?? null;
                  state.status = "ready";
                  state.isSwitching = false;
                  state.lastSyncAt = Date.now();
                },
                false,
                "switchTenant/complete",
              );
            } catch (error) {
              set(
                (state) => {
                  state.error =
                    error instanceof Error
                      ? error.message
                      : "Failed to switch tenant";
                  state.status = "error";
                  state.isSwitching = false;
                },
                false,
                "switchTenant/error",
              );
            }
          },

          switchWarehouse: (warehouseId) => {
            const {
              currentTenantId,
              tenants,
              isSwitching,
              currentWarehouseId,
            } = get();

            if (isSwitching || warehouseId === currentWarehouseId) return;

            const tenant = tenants.find((t) => t.id === currentTenantId);
            const warehouse = tenant?.warehouses.find(
              (w) => w.id === warehouseId,
            );

            if (!warehouse) {
              set(
                (state) => {
                  state.error = "Warehouse not found";
                },
                false,
                "switchWarehouse/error",
              );
              return;
            }

            set(
              (state) => {
                state.currentWarehouseId = warehouseId;
                state.lastSyncAt = Date.now();
              },
              false,
              "switchWarehouse",
            );
          },

          // ----------------------------------------------------------------
          // PERMISSION CHECKING (O(1) LOOKUP)
          // ----------------------------------------------------------------

          hasPermission: (resource, action) => {
            const { permissionSet, membership } = get();

            // Owner has all permissions
            if (membership?.role.role === "owner") return true;

            // O(1) Set lookup
            return permissionSet.has(`${resource}:${action}`);
          },

          hasAnyPermission: (checks) => {
            const { hasPermission } = get();
            return checks.some(({ resource, action }) =>
              hasPermission(resource, action),
            );
          },

          hasAllPermissions: (checks) => {
            const { hasPermission } = get();
            return checks.every(({ resource, action }) =>
              hasPermission(resource, action),
            );
          },

          // ----------------------------------------------------------------
          // INITIALIZATION
          // ----------------------------------------------------------------

          initialize: (data) => {
            set(
              (state) => {
                state.user = data.user;
                state.tenants = data.tenants;
                state.currentTenantId = data.currentTenantId ?? null;
                state.currentWarehouseId = data.currentWarehouseId ?? null;
                state.membership = data.membership ?? null;
                state.status = "ready";
                state.error = null;
                state.lastSyncAt = Date.now();

                // Build permission set
                if (data.membership?.role.permissions) {
                  const newSet = new Set<string>();
                  for (const [resource, actions] of Object.entries(
                    data.membership.role.permissions,
                  )) {
                    for (const action of actions) {
                      newSet.add(`${resource}:${action}`);
                    }
                  }
                  state.permissionSet = newSet;
                }
              },
              false,
              "initialize",
            );
          },

          reset: () => {
            set(() => ({ ...initialState }), false, "reset");
          },

          // ----------------------------------------------------------------
          // HELPERS
          // ----------------------------------------------------------------

          getCurrentTenant: () => {
            const { tenants, currentTenantId } = get();
            return tenants.find((t) => t.id === currentTenantId) ?? null;
          },

          getCurrentWarehouse: () => {
            const tenant = get().getCurrentTenant();
            const { currentWarehouseId } = get();
            return (
              tenant?.warehouses.find((w) => w.id === currentWarehouseId) ??
              null
            );
          },

          getConvexContext: () => {
            const { user, currentTenantId, currentWarehouseId } = get();
            return {
              tenantId: currentTenantId,
              warehouseId: currentWarehouseId,
              userId: user?.id ?? null,
            };
          },

          // ----------------------------------------------------------------
          // INTERNAL
          // ----------------------------------------------------------------

          _updatePermissionSet: (permissions) => {
            set(
              (state) => {
                const newSet = new Set<string>();
                for (const [resource, actions] of Object.entries(permissions)) {
                  for (const action of actions) {
                    newSet.add(`${resource}:${action}`);
                  }
                }
                state.permissionSet = newSet;
              },
              false,
              "_updatePermissionSet",
            );
          },

          _setStatus: (status, error = null) => {
            set(
              (state) => {
                state.status = status;
                state.error = error;
              },
              false,
              "_setStatus",
            );
          },
        })),
        {
          name: "wms-global-store",
          // Only persist tenant/warehouse selection
          partialize: (state) => ({
            currentTenantId: state.currentTenantId,
            currentWarehouseId: state.currentWarehouseId,
          }),
          // Custom storage to handle Set serialization issues
          storage: {
            getItem: (name) => {
              const str = localStorage.getItem(name);
              if (!str) return null;
              try {
                return JSON.parse(str);
              } catch {
                return null;
              }
            },
            setItem: (name, value) => {
              localStorage.setItem(name, JSON.stringify(value));
            },
            removeItem: (name) => {
              localStorage.removeItem(name);
            },
          },
        },
      ),
    ),
    {
      name: "WMS Global Store",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);

// ============================================================================
// SELECTORS (for minimal re-renders)
// ============================================================================

export const selectUser = (state: GlobalStore) => state.user;
export const selectTenants = (state: GlobalStore) => state.tenants;
export const selectCurrentTenantId = (state: GlobalStore) =>
  state.currentTenantId;
export const selectCurrentWarehouseId = (state: GlobalStore) =>
  state.currentWarehouseId;
export const selectMembership = (state: GlobalStore) => state.membership;
export const selectStatus = (state: GlobalStore) => state.status;
export const selectError = (state: GlobalStore) => state.error;
export const selectIsSwitching = (state: GlobalStore) => state.isSwitching;

/** Selector for current tenant (derived) */
export const selectCurrentTenant = (state: GlobalStore) =>
  state.tenants.find((t) => t.id === state.currentTenantId) ?? null;

/** Selector for current warehouse (derived) */
export const selectCurrentWarehouse = (state: GlobalStore) => {
  const tenant = selectCurrentTenant(state);
  return (
    tenant?.warehouses.find((w) => w.id === state.currentWarehouseId) ?? null
  );
};

/** Selector for warehouses of current tenant */
export const selectCurrentWarehouses = (state: GlobalStore) => {
  const tenant = selectCurrentTenant(state);
  return tenant?.warehouses ?? [];
};

import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

/**
 * Permission statements for the WMS application.
 * Each key is a resource, and the value is an array of allowed actions.
 *
 * Use `as const` so TypeScript can infer the type correctly.
 */
const statement = {
  // Include default Better Auth statements for organization management
  ...defaultStatements,

  // Role management (for dynamic access control)
  role: ["create", "read", "update", "delete"],

  // Settings access control
  settings: ["profile", "security", "admin", "members", "roles"],

  // Domain-specific: Inventory management
  inventory: ["create", "read", "update", "delete"],

  // Domain-specific: Warehouse/Branch management
  warehouse: ["create", "read", "update", "delete"],

  // Domain-specific: Reports
  reports: ["view", "export"],
} as const;

/**
 * Access control instance with all permission statements.
 */
export const ac = createAccessControl(statement);

/**
 * Owner role - Full access to everything
 */
export const owner = ac.newRole({
  // Full role management
  role: ["create", "read", "update", "delete"],
  // All settings access
  settings: ["profile", "security", "admin", "members", "roles"],
  // Full inventory access
  inventory: ["create", "read", "update", "delete"],
  // Full warehouse access
  warehouse: ["create", "read", "update", "delete"],
  // Full reports access
  reports: ["view", "export"],
  // Include default owner permissions
  ...ownerAc.statements,
});

/**
 * Admin role - Most access except dangerous operations
 */
export const admin = ac.newRole({
  // Can manage roles
  role: ["create", "read", "update", "delete"],
  // All settings except some admin functions
  settings: ["profile", "security", "admin", "members", "roles"],
  // Full inventory access
  inventory: ["create", "read", "update", "delete"],
  // Full warehouse access
  warehouse: ["create", "read", "update", "delete"],
  // Full reports access
  reports: ["view", "export"],
  // Include default admin permissions
  ...adminAc.statements,
});

/**
 * Member role - Basic access for regular users
 */
export const member = ac.newRole({
  // Can view roles
  role: ["read"],
  // Basic settings access
  settings: ["profile", "security"],
  // Can read inventory
  inventory: ["read"],
  // Can read warehouses
  warehouse: ["read"],
  // Can view reports
  reports: ["view"],
  // Include default member permissions
  ...memberAc.statements,
});

/**
 * Default roles configuration for UI
 */
export const DEFAULT_ROLES = [
  { id: "owner", name: "Owner", role: owner, isDefault: true },
  { id: "admin", name: "Admin", role: admin, isDefault: true },
  { id: "member", name: "Member", role: member, isDefault: true },
] as const;

/**
 * Permission display configuration for UI
 * Maps raw permissions to user-friendly display names and groups
 */
export const permissionDisplayConfig = {
  organization: {
    label: "Organization",
    permissions: {
      update: {
        label: "Update workspace settings",
        description: "Modify workspace name, logo, and settings",
      },
      delete: {
        label: "Delete workspace",
        description: "Permanently delete the workspace",
        dangerous: true,
      },
    },
  },
  member: {
    label: "Members",
    permissions: {
      create: { label: "Add members", description: "Add new members directly" },
      update: {
        label: "Update members",
        description: "Modify member information",
      },
      delete: {
        label: "Remove members",
        description: "Remove members from workspace",
      },
    },
    groups: {
      manage: ["create", "update", "delete"],
    },
  },
  role: {
    label: "Roles",
    permissions: {
      create: { label: "Create roles", description: "Create new custom roles" },
      read: {
        label: "View roles",
        description: "See role list and permissions",
      },
      update: { label: "Update roles", description: "Modify role permissions" },
      delete: { label: "Delete roles", description: "Remove custom roles" },
    },
    groups: {
      manage: ["create", "update", "delete"],
    },
  },
  invitation: {
    label: "Invitations",
    permissions: {
      create: {
        label: "Create invitations",
        description: "Send new invitations",
      },
      cancel: {
        label: "Cancel invitations",
        description: "Revoke pending invitations",
      },
    },
  },
  settings: {
    label: "Settings Access",
    permissions: {
      profile: {
        label: "Profile settings",
        description: "Access profile settings page",
      },
      security: {
        label: "Security settings",
        description: "Access security settings page",
      },
      admin: {
        label: "Admin settings",
        description: "Access admin settings pages",
      },
      members: {
        label: "Members settings",
        description: "Access members management page",
      },
      roles: {
        label: "Roles settings",
        description: "Access roles management page",
      },
    },
  },
  inventory: {
    label: "Inventory",
    permissions: {
      create: {
        label: "Create inventory",
        description: "Add new inventory items",
      },
      read: { label: "View inventory", description: "See inventory list" },
      update: {
        label: "Update inventory",
        description: "Modify inventory items",
      },
      delete: {
        label: "Delete inventory",
        description: "Remove inventory items",
      },
    },
    groups: {
      manage: ["create", "read", "update", "delete"],
    },
  },
  warehouse: {
    label: "Warehouses",
    permissions: {
      create: {
        label: "Create warehouses",
        description: "Add new warehouse/branch",
      },
      read: { label: "View warehouses", description: "See warehouse list" },
      update: {
        label: "Update warehouses",
        description: "Modify warehouse details",
      },
      delete: { label: "Delete warehouses", description: "Remove warehouses" },
    },
    groups: {
      manage: ["create", "read", "update", "delete"],
    },
  },
  reports: {
    label: "Reports",
    permissions: {
      view: { label: "View reports", description: "Access report dashboards" },
      export: { label: "Export reports", description: "Download report data" },
    },
  },
} as const;

/**
 * Type for permission statement keys
 */
export type PermissionResource = keyof typeof statement;

/**
 * Type for permission actions per resource
 */
export type PermissionAction<R extends PermissionResource> =
  (typeof statement)[R][number];

/**
 * Type for permission display config keys
 */
export type PermissionDisplayResource = keyof typeof permissionDisplayConfig;

/**
 * Type for role statements - maps resources to readonly arrays of actions
 */
export type RoleStatements = {
  [K in PermissionResource]?: readonly string[];
};

/**
 * Helper type to extract permissions from a role
 */
export type RolePermissions<T extends { statements: RoleStatements }> =
  T["statements"];

/**
 * Type guard to check if a key is a valid permission display resource
 */
export function isPermissionDisplayResource(
  key: string,
): key is PermissionDisplayResource {
  return key in permissionDisplayConfig;
}

/**
 * Helper to get permission display config keys in a type-safe way
 */
export function getPermissionDisplayKeys(): PermissionDisplayResource[] {
  return Object.keys(permissionDisplayConfig) as PermissionDisplayResource[];
}

// ============================================================================
// Permission Check Types & Helpers
// ============================================================================

/**
 * Type-safe permissions object for permission checks.
 * Maps resources to arrays of their valid actions.
 */
export type Permissions = {
  [K in PermissionResource]?: readonly PermissionAction<K>[];
};

/**
 * Loose permissions type for API calls (accepts string arrays).
 */
export type PermissionsInput = Record<string, string[]>;

/**
 * Creates a stable, sorted cache key from a permissions object.
 * Used for consistent TanStack Query cache keys.
 *
 * @example
 * ```ts
 * getPermissionCacheKey({ settings: ["admin"], project: ["create", "read"] })
 * // Returns: "project:create,read|settings:admin"
 * ```
 */
export function getPermissionCacheKey(permissions: PermissionsInput): string {
  return Object.keys(permissions)
    .sort()
    .map(
      (resource) =>
        `${resource}:${[...(permissions[resource] ?? [])].sort().join(",")}`,
    )
    .join("|");
}

/**
 * Creates a TanStack Query key for permission checks.
 *
 * @example
 * ```ts
 * getPermissionQueryKey("user123", { settings: ["admin"] })
 * // Returns: ["user123", "hasPerms", "settings:admin"]
 * ```
 */
export function getPermissionQueryKey(
  userId: string,
  permissions: PermissionsInput,
): readonly [string, "hasPerms", string] {
  return [userId, "hasPerms", getPermissionCacheKey(permissions)] as const;
}

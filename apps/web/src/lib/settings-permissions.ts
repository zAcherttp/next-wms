import type { Permissions } from "@/hooks/use-has-permission";

/**
 * Settings route configuration with required permissions.
 */
export interface SettingsRouteConfig {
  /** Display title */
  title: string;
  /** Route URL (relative to settings base) */
  url: string;
  /** Required permissions to access this route */
  permissions: Permissions;
  /** Whether this is an admin-only route */
  isAdmin?: boolean;
}

/**
 * Settings navigation group configuration.
 */
export interface SettingsNavGroup {
  /** Group title */
  title: string;
  /** Whether to show the group title */
  showTitle?: boolean;
  /** Routes in this group */
  items: SettingsRouteConfig[];
}

/**
 * Permission requirements for each settings route.
 * Used for both navigation filtering and route protection.
 */
export const settingsRoutePermissions: Record<string, Permissions> = {
  // Personal settings - accessible to all members
  preferences: { settings: ["profile"] },
  profile: { settings: ["profile"] },
  security: { settings: ["security"] },

  // Admin settings - require admin permissions
  admin: { settings: ["admin"] },
  "admin/members": { settings: ["members"], member: ["read"] },
  "admin/roles": { settings: ["roles"], role: ["read"] },
  "admin/assignments": { settings: ["roles"], member: ["update"] },
} as const;

/**
 * Get the required permissions for a settings route.
 *
 * @param path - Route path relative to settings base (e.g., "profile", "admin/members")
 * @returns Required permissions or null if route is public
 */
export function getRoutePermissions(path: string): Permissions | null {
  return settingsRoutePermissions[path] ?? null;
}

/**
 * Check if a route is an admin route.
 *
 * @param path - Route path relative to settings base
 * @returns True if this is an admin route
 */
export function isAdminRoute(path: string): boolean {
  return path.startsWith("admin");
}

/**
 * Full settings navigation configuration with permissions.
 * This is the source of truth for sidebar navigation.
 */
export const settingsNavigation: SettingsNavGroup[] = [
  {
    title: "Personal",
    showTitle: true,
    items: [
      {
        title: "Preferences",
        url: "preferences",
        permissions: { settings: ["profile"] },
      },
      {
        title: "Profile",
        url: "profile",
        permissions: { settings: ["profile"] },
      },
      {
        title: "Security & Access",
        url: "security",
        permissions: { settings: ["security"] },
      },
    ],
  },
  {
    title: "Administration",
    showTitle: true,
    items: [
      {
        title: "Workspace",
        url: "admin",
        permissions: { settings: ["admin"] },
        isAdmin: true,
      },
      {
        title: "Members",
        url: "admin/members",
        permissions: { settings: ["members"], member: ["read"] },
        isAdmin: true,
      },
      {
        title: "Roles & Permissions",
        url: "admin/roles",
        permissions: { settings: ["roles"], role: ["read"] },
        isAdmin: true,
      },
    ],
  },
];

/**
 * Filter navigation items based on user permissions.
 *
 * @param groups - Navigation groups to filter
 * @param checkPermission - Function to check if user has permission
 * @returns Filtered navigation groups
 */
export function filterNavigationByPermissions(
  groups: SettingsNavGroup[],
  checkPermission: (permissions: Permissions) => boolean,
): SettingsNavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => checkPermission(item.permissions)),
    }))
    .filter((group) => group.items.length > 0);
}

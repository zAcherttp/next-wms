import { components } from "../_generated/api";
import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Permission error that can be thrown when access is denied.
 */
export class PermissionDeniedError extends Error {
  constructor(
    message: string,
    public resource: string,
    public action: string,
  ) {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

/**
 * Permission check structure matching frontend format.
 * Keys are resource names, values are arrays of required actions.
 */
export type Permissions = Record<string, string[]>;

/**
 * Context with session and member info injected by withPermission.
 */
export interface AuthenticatedContext {
  userId: string;
  organizationId: string;
  memberId: string;
  role: string;
  permissions: Record<string, string[]>;
}

/**
 * Options for the withPermission middleware.
 */
export interface WithPermissionOptions {
  /** Required permissions for this mutation/action */
  permissions: Permissions;
  /**
   * If true, require all permissions. If false (default), require any one permission.
   * For most operations, you want "all" (the default).
   */
  requireAll?: boolean;
}

/**
 * Get member and their permissions for the given organization.
 */
async function getMemberWithPermissions(
  ctx: MutationCtx | ActionCtx | QueryCtx,
  userId: string,
  organizationId: string,
): Promise<{
  memberId: string;
  role: string;
  permissions: Record<string, string[]>;
} | null> {
  // Find the member record
  const member = await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "member",
    where: [
      { field: "userId", value: userId },
      { field: "organizationId", value: organizationId },
    ],
  });

  if (!member) return null;

  const role = (member.role as string) ?? "member";

  // Get the role permissions
  // For built-in roles, we use the default permissions
  // For custom roles, we need to look up the role record
  let permissions: Record<string, string[]> = {};

  if (role === "owner") {
    // Owner has all permissions
    permissions = {
      organization: ["create", "read", "update", "delete"],
      member: ["create", "read", "update", "delete", "invite", "kick"],
      role: ["create", "read", "update", "delete"],
      invitation: ["create", "read", "cancel"],
      settings: ["profile", "security", "admin", "members", "roles"],
      inventory: ["create", "read", "update", "delete"],
      warehouse: ["create", "read", "update", "delete"],
      reports: ["view", "export"],
    };
  } else if (role === "admin") {
    permissions = {
      organization: ["read", "update"],
      member: ["create", "read", "update", "invite", "kick"],
      role: ["create", "read", "update", "delete"],
      invitation: ["create", "read", "cancel"],
      settings: ["profile", "security", "admin", "members", "roles"],
      inventory: ["create", "read", "update", "delete"],
      warehouse: ["create", "read", "update", "delete"],
      reports: ["view", "export"],
    };
  } else if (role === "member") {
    permissions = {
      organization: ["read"],
      member: ["read"],
      role: ["read"],
      settings: ["profile", "security"],
      inventory: ["read"],
      warehouse: ["read"],
      reports: ["view"],
    };
  } else {
    // Custom role - look up permissions from organizationRole table
    // The organizationRole table stores individual permission entries per role
    const rolePermissions = await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model: "organizationRole",
        where: [
          { field: "role", value: role },
          { field: "organizationId", value: organizationId },
        ],
        paginationOpts: { numItems: 100, cursor: null },
      },
    );

    // Build permissions object from individual entries
    // Each entry has { role, permission, organizationId }
    // permission format is typically "resource:action"
    if (rolePermissions?.page && rolePermissions.page.length > 0) {
      for (const entry of rolePermissions.page) {
        const permissionStr = entry.permission as string;
        if (permissionStr?.includes(":")) {
          const [resource, action] = permissionStr.split(":");
          if (resource && action) {
            if (!permissions[resource]) {
              permissions[resource] = [];
            }
            permissions[resource].push(action);
          }
        }
      }
    }
  }

  return {
    memberId: member._id as string,
    role,
    permissions,
  };
}

/**
 * Check if the given permissions satisfy the required permissions.
 */
function checkPermissions(
  userPermissions: Record<string, string[]>,
  required: Permissions,
  requireAll: boolean,
): { allowed: boolean; missingResource?: string; missingAction?: string } {
  const checks: boolean[] = [];
  let firstMissingResource: string | undefined;
  let firstMissingAction: string | undefined;

  for (const [resource, actions] of Object.entries(required)) {
    for (const action of actions) {
      const hasPermission =
        userPermissions[resource]?.includes(action) ?? false;
      checks.push(hasPermission);

      if (!hasPermission && !firstMissingResource) {
        firstMissingResource = resource;
        firstMissingAction = action;
      }
    }
  }

  if (requireAll) {
    const allowed = checks.every(Boolean);
    return {
      allowed,
      missingResource: allowed ? undefined : firstMissingResource,
      missingAction: allowed ? undefined : firstMissingAction,
    };
  }

  const allowed = checks.some(Boolean);
  return {
    allowed,
    missingResource: allowed ? undefined : firstMissingResource,
    missingAction: allowed ? undefined : firstMissingAction,
  };
}

/**
 * Permission middleware that takes explicit userId.
 * Use this when you have the userId from the auth context.
 *
 * @example
 * ```ts
 * export const kickMember = mutation({
 *   args: { memberId: v.id("member"), userId: v.string() },
 *   handler: async (ctx, args) => {
 *     const auth = await requirePermissionWithUser(ctx, args.userId, organizationId, {
 *       permissions: { member: ["kick"] },
 *     });
 *
 *     // Verified - perform the operation
 *   },
 * });
 * ```
 */
export async function requirePermissionWithUser(
  ctx: MutationCtx | ActionCtx | QueryCtx,
  userId: string,
  organizationId: string,
  options: WithPermissionOptions,
): Promise<AuthenticatedContext> {
  const { permissions: required, requireAll = true } = options;

  // Get member and permissions
  const memberInfo = await getMemberWithPermissions(
    ctx,
    userId,
    organizationId,
  );

  if (!memberInfo) {
    throw new PermissionDeniedError(
      "You are not a member of this organization",
      "organization",
      "access",
    );
  }

  // Owner has all permissions
  if (memberInfo.role === "owner") {
    return {
      userId,
      organizationId,
      memberId: memberInfo.memberId,
      role: memberInfo.role,
      permissions: memberInfo.permissions,
    };
  }

  // Check if user has required permissions
  const { allowed, missingResource, missingAction } = checkPermissions(
    memberInfo.permissions,
    required,
    requireAll,
  );

  if (!allowed) {
    throw new PermissionDeniedError(
      `Permission denied: requires ${missingResource}:${missingAction}`,
      missingResource ?? "unknown",
      missingAction ?? "unknown",
    );
  }

  return {
    userId,
    organizationId,
    memberId: memberInfo.memberId,
    role: memberInfo.role,
    permissions: memberInfo.permissions,
  };
}

/**
 * Helper to check if user has a specific permission without throwing.
 * Returns true if allowed, false if denied.
 */
export async function hasPermission(
  ctx: MutationCtx | ActionCtx | QueryCtx,
  userId: string,
  organizationId: string,
  resource: string,
  action: string,
): Promise<boolean> {
  try {
    await requirePermissionWithUser(ctx, userId, organizationId, {
      permissions: { [resource]: [action] },
    });
    return true;
  } catch {
    return false;
  }
}

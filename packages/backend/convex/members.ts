/**
 * Member management mutations with permission checks.
 *
 * These mutations demonstrate how to use the withPermission middleware
 * to validate permissions server-side before performing sensitive operations.
 *
 * NOTE: Actual member/invitation mutations should go through Better Auth's
 * organization API endpoints. These examples show the permission validation
 * pattern that would be applied before delegating to the auth system.
 */

import { v } from "convex/values";
import { components } from "./_generated/api";
import { query } from "./_generated/server";
import { requirePermissionWithUser } from "./lib/withPermission";

/**
 * List members of an organization.
 * Requires: member:read permission
 */
export const listMembers = query({
  args: {
    userId: v.string(),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify permission
    await requirePermissionWithUser(ctx, args.userId, args.organizationId, {
      permissions: { member: ["read"] },
    });

    // Fetch members
    const members = await ctx.runQuery(components.betterAuth.adapter.findMany, {
      model: "member",
      where: [{ field: "organizationId", value: args.organizationId }],
      paginationOpts: { numItems: 100, cursor: null },
    });

    return members?.page ?? [];
  },
});

/**
 * Get a single member by ID.
 * Requires: member:read permission
 */
export const getMember = query({
  args: {
    userId: v.string(),
    organizationId: v.string(),
    memberId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify permission
    await requirePermissionWithUser(ctx, args.userId, args.organizationId, {
      permissions: { member: ["read"] },
    });

    // Fetch member
    const member = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "member",
      where: [{ field: "id", value: args.memberId }],
    });

    if (!member || member.organizationId !== args.organizationId) {
      return null;
    }

    return member;
  },
});

/**
 * List pending invitations for an organization.
 * Requires: invitation:read permission
 */
export const listInvitations = query({
  args: {
    userId: v.string(),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify permission
    await requirePermissionWithUser(ctx, args.userId, args.organizationId, {
      permissions: { invitation: ["read"] },
    });

    // Fetch invitations
    const invitations = await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model: "invitation",
        where: [
          { field: "organizationId", value: args.organizationId },
          { field: "status", value: "pending" },
        ],
        paginationOpts: { numItems: 100, cursor: null },
      },
    );

    return invitations?.page ?? [];
  },
});

/**
 * Check if user can perform a member action.
 * This is a permission-only check, useful for UI rendering decisions.
 */
export const canManageMember = query({
  args: {
    userId: v.string(),
    organizationId: v.string(),
    targetMemberId: v.string(),
    action: v.union(v.literal("kick"), v.literal("update")),
  },
  handler: async (ctx, args) => {
    try {
      // Get the acting user's context
      const authContext = await requirePermissionWithUser(
        ctx,
        args.userId,
        args.organizationId,
        { permissions: { member: [args.action] } },
      );

      // Get target member to check role hierarchy
      const targetMember = await ctx.runQuery(
        components.betterAuth.adapter.findOne,
        {
          model: "member",
          where: [{ field: "id", value: args.targetMemberId }],
        },
      );

      if (!targetMember) {
        return { allowed: false, reason: "Member not found" };
      }

      // Can't manage yourself
      if (authContext.memberId === args.targetMemberId) {
        return { allowed: false, reason: "Cannot manage yourself" };
      }

      // Can't manage owners
      if (targetMember.role === "owner") {
        return { allowed: false, reason: "Cannot manage owners" };
      }

      // Admins can't manage other admins unless they're an owner
      if (targetMember.role === "admin" && authContext.role !== "owner") {
        return {
          allowed: false,
          reason: "Only owners can manage administrators",
        };
      }

      return { allowed: true };
    } catch {
      return { allowed: false, reason: "Permission denied" };
    }
  },
});

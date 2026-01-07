/**
 * Auth Sync Utilities
 * 
 * This module provides functions to sync data from Better Auth (Neon DB) to Convex DB.
 * These functions will be called via Better Auth hooks to keep data in sync.
 * 
 * Flow:
 * 1. Better Auth (Neon DB) is the source of truth for authentication
 * 2. When auth events occur (user created, org created, etc.), hooks trigger
 * 3. These functions sync the minimal required data to Convex
 * 4. Convex tables reference the auth tables via authId fields
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ================================================================
// USER SYNC
// ================================================================

/**
 * Sync user from Better Auth to Convex
 * Called when a user is created or updated in Better Auth
 */
export const syncUser = mutation({
  args: {
    authId: v.string(),
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("auth_users")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        emailVerified: args.emailVerified,
        image: args.image,
        updatedAt: args.updatedAt,
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("auth_users", {
        authId: args.authId,
        name: args.name,
        email: args.email,
        emailVerified: args.emailVerified,
        image: args.image,
        createdAt: args.createdAt,
        updatedAt: args.updatedAt,
      });
      return userId;
    }
  },
});

/**
 * Get user by Better Auth ID
 */
export const getUserByAuthId = query({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auth_users")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();
  },
});

/**
 * Delete user from Convex (soft delete in auth, complete removal here)
 */
export const deleteUser = mutation({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("auth_users")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

// ================================================================
// ORGANIZATION SYNC
// ================================================================

/**
 * Sync organization from Better Auth to Convex
 * Called when an organization is created or updated in Better Auth
 */
export const syncOrganization = mutation({
  args: {
    authId: v.string(),
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if organization already exists
    const existingOrg = await ctx.db
      .query("auth_organizations")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();

    if (existingOrg) {
      // Update existing organization
      await ctx.db.patch(existingOrg._id, {
        name: args.name,
        slug: args.slug,
        logo: args.logo,
        metadata: args.metadata,
      });
      return existingOrg._id;
    } else {
      // Create new organization
      const orgId = await ctx.db.insert("auth_organizations", {
        authId: args.authId,
        name: args.name,
        slug: args.slug,
        logo: args.logo,
        metadata: args.metadata,
        createdAt: args.createdAt,
      });
      return orgId;
    }
  },
});

/**
 * Get organization by Better Auth ID
 */
export const getOrganizationByAuthId = query({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auth_organizations")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();
  },
});

/**
 * Get organization by slug
 */
export const getOrganizationBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auth_organizations")
      .withIndex("slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * Delete organization from Convex
 */
export const deleteOrganization = mutation({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("auth_organizations")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();

    if (org) {
      await ctx.db.delete(org._id);
    }
  },
});

// ================================================================
// MEMBER SYNC
// ================================================================

/**
 * Sync member from Better Auth to Convex
 * Called when a user joins/leaves an organization or role changes
 */
export const syncMember = mutation({
  args: {
    authId: v.string(),
    organizationAuthId: v.string(),
    userAuthId: v.string(),
    role: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if member already exists
    const existingMember = await ctx.db
      .query("auth_members")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();

    if (existingMember) {
      // Update existing member
      await ctx.db.patch(existingMember._id, {
        role: args.role,
      });
      return existingMember._id;
    } else {
      // Create new member
      const memberId = await ctx.db.insert("auth_members", {
        authId: args.authId,
        organizationAuthId: args.organizationAuthId,
        userAuthId: args.userAuthId,
        role: args.role,
        createdAt: args.createdAt,
      });
      return memberId;
    }
  },
});

/**
 * Get member by Better Auth ID
 */
export const getMemberByAuthId = query({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auth_members")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();
  },
});

/**
 * Get all members for an organization
 */
export const getMembersByOrganization = query({
  args: { organizationAuthId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auth_members")
      .withIndex("organizationAuthId", (q) => 
        q.eq("organizationAuthId", args.organizationAuthId)
      )
      .collect();
  },
});

/**
 * Get all organizations for a user
 */
export const getMembersByUser = query({
  args: { userAuthId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auth_members")
      .withIndex("userAuthId", (q) => q.eq("userAuthId", args.userAuthId))
      .collect();
  },
});

/**
 * Delete member from Convex
 */
export const deleteMember = mutation({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("auth_members")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();

    if (member) {
      await ctx.db.delete(member._id);
    }
  },
});

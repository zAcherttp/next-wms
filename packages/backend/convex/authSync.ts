/**
 * Auth Sync Utilities
 * 
 * This module provides functions to sync data from Better Auth (Neon DB) to Convex DB.
 * These functions will be called via Better Auth hooks to keep data in sync.
 * 
 * Flow:
 * 1. Better Auth (Neon DB) is the source of truth for authentication
 * 2. When auth events occur (user created, org created, etc.), hooks trigger
 * 3. These functions sync the auth data into the merged tables in Convex
 * 4. Convex tables contain both auth fields and application-specific fields
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ================================================================
// USER SYNC
// ================================================================

/**
 * Sync user from Better Auth to Convex
 * Updates the users table with auth data
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
      .query("users")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();

    if (existingUser) {
      // Update existing user's auth fields
      await ctx.db.patch(existingUser._id, {
        fullName: args.name,
        email: args.email,
        emailVerified: args.emailVerified,
        image: args.image,
        authUpdatedAt: args.updatedAt,
      });
      console.log(`[Convex Sync] User updated: ${args.authId}`);
      return existingUser._id;
    } else {
      // Create new user without organizationId
      // User will be linked to organization when they create/join one
      console.warn(`[Convex Sync] User ${args.authId} not found, creating first.`);
      const userId = await ctx.db.insert("users", {
        authId: args.authId,
        fullName: args.name,
        email: args.email,
        emailVerified: args.emailVerified,
        image: args.image,
        authCreatedAt: args.createdAt,
        authUpdatedAt: args.updatedAt,
        // Application defaults for new users
        organizationId: undefined, // Will be set when user joins/creates org
        username: args.email.split('@')[0], // Default username from email
        isActive: true,
        isDeleted: false,
      });
      console.log(`[Convex Sync] User created: ${args.authId}`);
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
      .query("users")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();
  },
});

/**
 * Get user by Convex document ID
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Delete user from Convex (soft delete)
 */
export const deleteUser = mutation({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();

    if (user) {
      // Soft delete
      await ctx.db.patch(user._id, {
        isDeleted: true,
        deletedAt: Date.now(),
      });
    }
  },
});

// ================================================================
// ORGANIZATION SYNC
// ================================================================

/**
 * Sync organization from Better Auth to Convex
 * Updates the organizations table with auth data
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
      .query("organizations")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();

    if (existingOrg) {
      // Update existing organization's auth fields
      await ctx.db.patch(existingOrg._id, {
        name: args.name,
        slug: args.slug,
        logo: args.logo,
        authMetadata: args.metadata,
      });
      return existingOrg._id;
    } else {
      // Note: For new organizations, we should create them here with default values
      // The application can update the organization-specific fields later
      const orgId = await ctx.db.insert("organizations", {
        authId: args.authId,
        name: args.name,
        slug: args.slug,
        logo: args.logo,
        authMetadata: args.metadata,
        authCreatedAt: args.createdAt,
        // Default application-specific fields
        address: "",
        isActive: true,
        isDeleted: false,
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
      .query("organizations")
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
      .query("organizations")
      .withIndex("slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * Get organization by Convex document ID
 */
export const getOrganizationById = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

/**
 * Delete organization from Convex (soft delete)
 */
export const deleteOrganization = mutation({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .first();

    if (org) {
      // Soft delete
      await ctx.db.patch(org._id, {
        isDeleted: true,
        deletedAt: Date.now(),
      });
    }
  },
});

// ================================================================
// BATCH SYNC OPERATIONS
// ================================================================

/**
 * Initial sync - sync all users from Better Auth to Convex
 * This should be called once during migration
 * Note: Only updates users that already exist in Convex
 */
export const batchSyncUsers = mutation({
  args: {
    users: v.array(
      v.object({
        authId: v.string(),
        name: v.string(),
        email: v.string(),
        emailVerified: v.boolean(),
        image: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const user of args.users) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("authId", (q) => q.eq("authId", user.authId))
        .first();

      if (existingUser) {
        await ctx.db.patch(existingUser._id, {
          fullName: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          authUpdatedAt: user.updatedAt,
        });
        results.push({ authId: user.authId, status: "updated" });
      } else {
        results.push({ authId: user.authId, status: "skipped - not found" });
      }
    }
    return results;
  },
});

/**
 * Initial sync - sync all organizations from Better Auth to Convex
 * This should be called once during migration
 */
export const batchSyncOrganizations = mutation({
  args: {
    organizations: v.array(
      v.object({
        authId: v.string(),
        name: v.string(),
        slug: v.string(),
        logo: v.optional(v.string()),
        metadata: v.optional(v.string()),
        createdAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const org of args.organizations) {
      const existingOrg = await ctx.db
        .query("organizations")
        .withIndex("authId", (q) => q.eq("authId", org.authId))
        .first();

      if (existingOrg) {
        await ctx.db.patch(existingOrg._id, {
          name: org.name,
          slug: org.slug,
          logo: org.logo,
          authMetadata: org.metadata,
        });
        results.push({ authId: org.authId, status: "updated" });
      } else {
        // Create new organization with defaults
        const orgId = await ctx.db.insert("organizations", {
          authId: org.authId,
          name: org.name,
          slug: org.slug,
          logo: org.logo,
          authMetadata: org.metadata,
          authCreatedAt: org.createdAt,
          address: "",
          isActive: true,
          isDeleted: false,
        });
        results.push({ authId: org.authId, status: "created", id: orgId });
      }
    }
    return results;
  },
});

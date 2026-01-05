import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

/**
 * Internal helper to create a notification.
 * Can be called from other mutations/actions.
 */
export async function createNotification(
  ctx: MutationCtx,
  args: {
    organizationId: Id<"organizations">;
    notificationCategoryTypeId: Id<"system_lookups">;
    notificationType: string;
    recipientUserId: Id<"users">;
    title: string;
    message: string;
    priorityTypeId: Id<"system_lookups">;
    actionUrl?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }
) {
  await ctx.db.insert("notifications", {
    organizationId: args.organizationId,
    notificationCategoryTypeId: args.notificationCategoryTypeId,
    notificationType: args.notificationType,
    recipientUserId: args.recipientUserId,
    title: args.title,
    message: args.message,
    priorityTypeId: args.priorityTypeId,
    actionUrl: args.actionUrl,
    relatedEntityType: args.relatedEntityType,
    relatedEntityId: args.relatedEntityId,
    // readAt and dismissedAt are undefined initially
  });
}

/**
 * Public mutation to create a notification.
 */
export const create = mutation({
  args: {
    organizationId: v.id("organizations"),
    notificationCategoryTypeId: v.id("system_lookups"),
    notificationType: v.string(),
    recipientUserId: v.id("users"),
    title: v.string(),
    message: v.string(),
    priorityTypeId: v.id("system_lookups"),
    actionUrl: v.optional(v.string()),
    relatedEntityType: v.optional(v.string()),
    relatedEntityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await createNotification(ctx, args);
  },
});

/**
 * Get notifications for a user.
 * Returns list sorted by creation time (newest first).
 */
export const list = query({
  args: {
    userId: v.id("users"),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("recipientUserId", (q) => q.eq("recipientUserId", args.userId))
      .order("desc") // Newest first
      .collect();

    if (args.unreadOnly) {
      return notifications.filter((n) => !n.readAt);
    }

    return notifications;
  },
});

/**
 * Mark a notification as read.
 */
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      readAt: Date.now(),
    });
  },
});

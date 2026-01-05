import { internalMutation } from "./_generated/server";

export const fixInvalidNotifications = internalMutation({
  args: {},
  handler: async (ctx) => {
    // 1. Ensure we have necessary reference data (Org, User, Lookups)
    // If they don't exist, we create dummy ones to satisfy the schema constraints.
    
    let organization = await ctx.db.query("organizations").first();
    if (!organization) {
        const orgId = await ctx.db.insert("organizations", {
            name: "Default Organization",
            address: "N/A",
            isActive: true,
            isDeleted: false
        });
        organization = await ctx.db.get(orgId);
    }

    let user = await ctx.db.query("users").first();
    if (!user) {
        const userId = await ctx.db.insert("users", {
            organizationId: organization!._id,
            username: "system_admin",
            passwordHash: "placeholder",
            fullName: "System Admin",
            email: "admin@example.com",
            isActive: true,
            isDeleted: false
        });
        user = await ctx.db.get(userId);
    }

    let alertType = await ctx.db
      .query("system_lookups")
      .withIndex("lookupType", (q) => q.eq("lookupType", "NOTIFICATION_TYPE"))
      .first();
    
    if (!alertType) {
        const id = await ctx.db.insert("system_lookups", {
            lookupType: "NOTIFICATION_TYPE",
            lookupCode: "INFO",
            lookupValue: "Information",
            description: "General information",
            sortOrder: 1
        });
        alertType = await ctx.db.get(id);
    }

    let priority = await ctx.db
      .query("system_lookups")
      .withIndex("lookupType", (q) => q.eq("lookupType", "PRIORITY"))
      .first();

    if (!priority) {
        const id = await ctx.db.insert("system_lookups", {
            lookupType: "PRIORITY",
            lookupCode: "NORMAL",
            lookupValue: "Normal",
            description: "Normal priority",
            sortOrder: 1
        });
        priority = await ctx.db.get(id);
    }

    if (!organization || !user || !alertType || !priority) {
        return "Error: Could not ensure reference data exists.";
    }

    // 2. Fetch all notifications (even invalid ones if possible)
    // Note: If schema validation prevents reading, we might need to relax schema first.
    const notifications = await ctx.db.query("notifications").collect();
    let fixedCount = 0;

    for (const noti of notifications) {
      // Check if missing required fields
      // @ts-ignore
      const isInvalid = !noti.notificationCategoryTypeId || !noti.organizationId || !noti.recipientUserId || !noti.priorityTypeId;

      if (isInvalid) {
        // @ts-ignore
        const oldUserId = noti.userId; // "u001"
        // @ts-ignore
        const oldType = noti.type; // "info"
        // @ts-ignore
        const oldIsRead = noti.isRead; // false

        try {
            await ctx.db.patch(noti._id, {
                organizationId: organization._id,
                notificationCategoryTypeId: alertType!._id,
                priorityTypeId: priority!._id,
                recipientUserId: user!._id, // Map "u001" to a real user ID
                
                // Map old fields to new schema
                notificationType: oldType || "General",
                readAt: oldIsRead ? Date.now() : undefined,
                
                // Ensure title/message exist (they should be there based on error log)
                title: noti.title || "Untitled Notification",
                message: noti.message || "No content",
            });
            fixedCount++;
        } catch (e) {
            console.error(`Failed to patch notification ${noti._id}:`, e);
        }
      }
    }

    return `Process complete. Fixed ${fixedCount} notifications.`;
  },
});

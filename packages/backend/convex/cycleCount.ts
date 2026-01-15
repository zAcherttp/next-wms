import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

// ================================================================
// REFERENCE DATA QUERIES
// ================================================================

/**
 * getStorageZones
 *
 * Purpose: Retrieves all storage zones for a specific branch
 *
 * Access: Available to all authenticated users within the organization
 */
export const getStorageZones = query({
  args: {
    branchId: v.id("branches"),
  },
  handler: async (ctx, args) => {
    const zones = await ctx.db
      .query("storage_zones")
      .withIndex("branchId", (q) => q.eq("branchId", args.branchId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    return zones;
  },
});

/**
 * getCycleCountLookups
 *
 * Purpose: Retrieves all system lookups needed for cycle count session creation
 *
 * Access: Available to all authenticated users
 */
export const getCycleCountLookups = query({
  args: {},
  handler: async (ctx) => {
    // Get session type lookup for "Cycle Count"
    const sessionType = await ctx.db
      .query("system_lookups")
      .filter((q) =>
        q.and(
          q.eq(q.field("lookupType"), "SessionType"),
          q.eq(q.field("lookupCode"), "CYCLE_COUNT"),
        ),
      )
      .first();

    // Get cycle count types (Daily, Weekly)
    const cycleCountTypes = await ctx.db
      .query("system_lookups")
      .withIndex("lookupType", (q) => q.eq("lookupType", "CycleCountType"))
      .collect();

    // Get session status types
    const sessionStatuses = await ctx.db
      .query("system_lookups")
      .withIndex("lookupType", (q) => q.eq("lookupType", "SessionStatus"))
      .collect();

    // Get the "Pending" status as default for new sessions
    const pendingStatus = sessionStatuses.find(
      (s) => s.lookupCode === "PENDING",
    );

    return {
      sessionTypeId: sessionType?._id ?? null,
      cycleCountTypes: cycleCountTypes.map((t) => ({
        _id: t._id,
        lookupCode: t.lookupCode,
        lookupValue: t.lookupValue,
      })),
      sessionStatuses: sessionStatuses.map((s) => ({
        _id: s._id,
        lookupCode: s.lookupCode,
        lookupValue: s.lookupValue,
      })),
      defaultStatusId: pendingStatus?._id ?? null,
    };
  },
});

/**
 * getAdjustmentLookups
 *
 * Purpose: Retrieves all system lookups needed for adjustment dialogs
 *
 * Access: Available to all authenticated users
 */
export const getAdjustmentLookups = query({
  args: {},
  handler: async (ctx) => {
    // Get adjustment types (Quantity, Location)
    const adjustmentTypes = await ctx.db
      .query("system_lookups")
      .withIndex("lookupType", (q) => q.eq("lookupType", "AdjustmentType"))
      .collect();

    // Get adjustment statuses (Pending, Approved, Rejected)
    const adjustmentStatuses = await ctx.db
      .query("system_lookups")
      .withIndex("lookupType", (q) => q.eq("lookupType", "AdjustmentStatus"))
      .collect();

    // Get adjustment reasons (Damaged, Count Discrepancy, Expired)
    const adjustmentReasons = await ctx.db
      .query("system_lookups")
      .withIndex("lookupType", (q) => q.eq("lookupType", "AdjustmentReason"))
      .collect();

    // Find the default "Pending" status
    const pendingStatus = adjustmentStatuses.find(
      (s) => s.lookupCode === "PENDING",
    );

    // Find quantity and location types
    const quantityType = adjustmentTypes.find(
      (t) => t.lookupCode === "QUANTITY",
    );
    const locationType = adjustmentTypes.find(
      (t) => t.lookupCode === "LOCATION",
    );

    return {
      adjustmentTypes: adjustmentTypes.map((t) => ({
        _id: t._id,
        lookupCode: t.lookupCode,
        lookupValue: t.lookupValue,
      })),
      adjustmentStatuses: adjustmentStatuses.map((s) => ({
        _id: s._id,
        lookupCode: s.lookupCode,
        lookupValue: s.lookupValue,
      })),
      adjustmentReasons: adjustmentReasons.map((r) => ({
        _id: r._id,
        lookupCode: r.lookupCode,
        lookupValue: r.lookupValue,
      })),
      defaultStatusId: pendingStatus?._id ?? null,
      quantityTypeId: quantityType?._id ?? null,
      locationTypeId: locationType?._id ?? null,
    };
  },
});

/**
 * getInventoryBatchesByZone
 *
 * Purpose: Retrieves inventory batches (items) for a specific zone
 * Used by location transfer dialog to show items available for transfer
 *
 * Access: Available to all authenticated users
 */
export const getInventoryBatchesByZone = query({
  args: {
    zoneId: v.id("storage_zones"),
    branchId: v.id("branches"),
  },
  handler: async (ctx, args) => {
    // Get all inventory batches in this zone
    const batches = await ctx.db
      .query("inventory_batches")
      .withIndex("zoneId", (q) => q.eq("zoneId", args.zoneId))
      .filter((q) =>
        q.and(
          q.eq(q.field("branchId"), args.branchId),
          q.gt(q.field("quantity"), 0),
          q.eq(q.field("isDeleted"), false),
        ),
      )
      .collect();

    // Enrich batches with product variant and product info
    const enrichedBatches = await Promise.all(
      batches.map(async (batch) => {
        // Get product variant (SKU)
        const productVariant = await ctx.db.get(batch.skuId);
        // Get parent product
        const product = productVariant
          ? await ctx.db.get(productVariant.productId)
          : null;

        return {
          _id: batch._id,
          batchCode:
            batch.internalBatchNumber ?? batch.supplierBatchNumber ?? "N/A",
          productId: productVariant?._id ?? "unknown",
          productName: product?.name ?? "Unknown Product",
          productCode: productVariant?.skuCode ?? "N/A",
          currentQuantity: batch.quantity,
          expiresAt: batch.expiresAt,
          zoneId: batch.zoneId,
        };
      }),
    );

    return enrichedBatches;
  },
});

/**
 * getOrganizationUsers
 *
 * Purpose: Retrieves all users (workers) for a specific organization
 *
 * Access: Available to all authenticated users within the organization
 */
export const getOrganizationUsers = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    // Get all members of the organization
    const members = await ctx.db
      .query("members")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .collect();

    // Get user details for each member
    const users = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        if (!user || user.isDeleted) return null;
        return {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
        };
      }),
    );

    return users.filter((u) => u !== null);
  },
});

// ================================================================
// SESSION QUERIES & MUTATIONS
// ================================================================

/**
 * getAllCycleCountSession
 *
 * Purpose: Retrieves all cycle count sessions for a specific organization
 *
 * Process:
 * 1. Queries the work_sessions table filtered by organization
 * 2. Further filters by session type to get only cycle count sessions
 * 3. Returns all matching cycle count sessions
 *
 * Access: Available to all authenticated users within the organization
 * Typical users: Warehouse managers, inventory staff, supervisors, admins
 */
export const getAllCycleCountSession = query({
  args: {
    organizationId: v.id("organizations"),
    branchId: v.id("branches"),
    sessionTypeId: v.id("system_lookups"),
  },
  handler: async (ctx, args) => {
    // Step 1: Query work_sessions table filtered by organization
    const cycleCounts = await ctx.db
      .query("work_sessions")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      // Step 2: Filter by session type and branch to get only cycle count sessions
      .filter((q) =>
        q.and(
          q.eq(q.field("sessionTypeId"), args.sessionTypeId),
          q.eq(q.field("branchId"), args.branchId),
        ),
      )
      .collect();

    // Step 3: Return all cycle count sessions
    return cycleCounts;
  },
});

/**
 * getSessionsByStatus
 *
 * Purpose: Retrieves cycle count sessions filtered by status
 *
 * Process:
 * 1. Queries the work_sessions table using sessionStatusTypeId index
 * 2. Filters by organization and session type
 * 3. Returns all matching sessions with the specified status
 *
 * Access: Available to all authenticated users within the organization
 * Typical users: Warehouse managers, supervisors, admins
 */
export const getSessionsByStatus = query({
  args: {
    organizationId: v.id("organizations"),
    branchId: v.id("branches"),
    sessionTypeId: v.id("system_lookups"),
    sessionStatusTypeId: v.id("system_lookups"),
  },
  handler: async (ctx, args) => {
    // Step 1: Query work_sessions table using status index
    const sessions = await ctx.db
      .query("work_sessions")
      .withIndex("sessionStatusTypeId", (q) =>
        q.eq("sessionStatusTypeId", args.sessionStatusTypeId),
      )
      // Step 2: Filter by organization, branch and session type
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), args.organizationId),
          q.eq(q.field("branchId"), args.branchId),
          q.eq(q.field("sessionTypeId"), args.sessionTypeId),
        ),
      )
      .collect();

    // Step 3: Return filtered sessions
    return sessions;
  },
});

/**
 * createCycleCountSession
 *
 * Purpose: Creates a new cycle count session (work session) with zone assignments and line items
 *
 * Process:
 * 1. Validates that at least one zone assignment is provided
 * 2. Creates the work session with cycle count session type, name, description, and count type
 * 3. Creates zone-worker assignments
 * 4. Creates all associated session line items
 * 5. Returns the newly created session ID
 *
 * Access: Restricted to authorized users with permission to create cycle count sessions
 * Typical users: Warehouse managers, supervisors, admins
 */
export const createCycleCountSession = mutation({
  args: {
    organizationId: v.id("organizations"),
    branchId: v.id("branches"),
    sessionTypeId: v.id("system_lookups"),
    sessionCode: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    cycleCountTypeId: v.id("system_lookups"), // Daily/Weekly
    assignedUserId: v.id("users"), // Primary assigned user
    sessionStatusTypeId: v.id("system_lookups"),
    zoneAssignments: v.array(
      v.object({
        zoneId: v.id("storage_zones"),
        assignedUserId: v.optional(v.id("users")), // Made optional - can assign later
      }),
    ),
    lineItems: v.optional(
      v.array(
        v.object({
          skuId: v.id("product_variants"),
          expectedQuantity: v.number(),
          zoneId: v.optional(v.id("storage_zones")),
          batchId: v.optional(v.id("inventory_batches")),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    // Step 1: Validate that zone assignments are provided
    if (!args.zoneAssignments || args.zoneAssignments.length === 0) {
      throw new Error(
        "Cycle count session must have at least one zone assignment",
      );
    }

    // Step 2: Create the work session for cycle count
    const sessionId = await ctx.db.insert("work_sessions", {
      organizationId: args.organizationId,
      branchId: args.branchId,
      sessionTypeId: args.sessionTypeId,
      sessionCode: args.sessionCode,
      name: args.name,
      description: args.description,
      cycleCountTypeId: args.cycleCountTypeId,
      assignedUserId: args.assignedUserId,
      sessionStatusTypeId: args.sessionStatusTypeId,
    });

    // Step 3: Get the "not_started" status for zone assignments
    const notStartedStatus = await ctx.db
      .query("system_lookups")
      .filter((q) =>
        q.and(
          q.eq(q.field("lookupType"), "ZoneAssignmentStatus"),
          q.eq(q.field("lookupCode"), "NOT_STARTED"),
        ),
      )
      .first();

    // Step 4: Create zone-worker assignments with initial status
    for (const assignment of args.zoneAssignments) {
      await ctx.db.insert("session_zone_assignments", {
        sessionId,
        zoneId: assignment.zoneId,
        assignedUserId: assignment.assignedUserId ?? args.assignedUserId, // Fall back to primary user
        assignmentStatusTypeId: notStartedStatus?._id,
      });
    }

    // Step 5: Create session line items
    if (args.lineItems && args.lineItems.length > 0) {
      // Use provided line items
      for (const item of args.lineItems) {
        await ctx.db.insert("session_line_items", {
          sessionId,
          skuId: item.skuId,
          expectedQuantity: item.expectedQuantity,
          actualQuantity: 0,
          zoneId: item.zoneId,
          batchId: item.batchId,
        });
      }
    } else {
      // Auto-generate line items from inventory batches in selected zones
      const zoneIds = args.zoneAssignments.map((a) => a.zoneId);
      for (const zoneId of zoneIds) {
        const batches = await ctx.db
          .query("inventory_batches")
          .withIndex("zoneId", (q) => q.eq("zoneId", zoneId))
          .filter((q) =>
            q.and(
              q.eq(q.field("organizationId"), args.organizationId),
              q.eq(q.field("branchId"), args.branchId),
              q.eq(q.field("isDeleted"), false),
              q.gt(q.field("quantity"), 0),
            ),
          )
          .collect();

        for (const batch of batches) {
          await ctx.db.insert("session_line_items", {
            sessionId,
            skuId: batch.skuId,
            expectedQuantity: batch.quantity,
            actualQuantity: 0,
            zoneId: zoneId,
            batchId: batch._id,
          });
        }
      }
    }

    // Step 6: Return the newly created session ID
    return sessionId;
  },
});

/**
 * viewCycleCountSessionDetail
 *
 * Purpose: Retrieves a specific cycle count session by its ID along with zone assignments, line items, and inventory transactions
 *
 * Process:
 * 1. Fetches the work session from the database using the provided ID
 * 2. Validates that the session exists
 * 3. Queries all zone assignments for the session
 * 4. Queries all associated session line items
 * 5. Queries all inventory transactions related to the session
 * 6. Returns the session with all related data
 *
 * Access: Available to all authenticated users within the organization
 * Typical users: Warehouse managers, inventory staff, supervisors, admins
 */
export const viewCycleCountSessionDetail = query({
  args: {
    sessionId: v.id("work_sessions"),
  },
  handler: async (ctx, args) => {
    // Step 1: Fetch the work session by ID
    const session = await ctx.db.get(args.sessionId);

    // Step 2: Validate session exists
    if (!session) {
      return null;
    }

    // Step 3: Query all zone assignments for this session
    const zoneAssignments = await ctx.db
      .query("session_zone_assignments")
      .withIndex("sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Step 4: Query all associated session line items
    const lineItems = await ctx.db
      .query("session_line_items")
      .withIndex("sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Step 5: Query all inventory transactions related to this session
    const inventoryTransactions = await ctx.db
      .query("inventory_transactions")
      .filter((q) => q.eq(q.field("workSessionId"), args.sessionId))
      .collect();

    // Step 6: Return the complete session with all related data
    return {
      ...session,
      zoneAssignments,
      lineItems,
      inventoryTransactions,
    };
  },
});

/**
 * updateSessionStatus
 *
 * Purpose: Updates the status of a cycle count session
 *
 * Process:
 * 1. Fetches the session to validate it exists
 * 2. Updates the session status and optional timestamp fields
 * 3. Returns the updated session ID
 *
 * Access: Restricted to authorized users with permission to manage sessions
 * Typical users: Warehouse managers, supervisors, admins
 */
export const updateSessionStatus = mutation({
  args: {
    sessionId: v.id("work_sessions"),
    sessionStatusTypeId: v.id("system_lookups"),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    verifiedAt: v.optional(v.number()),
    verifiedByUserId: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Step 1: Fetch the session to validate it exists
    const session = await ctx.db.get(args.sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    // Step 2: Build update object with provided fields
    const updateData: Record<string, unknown> = {
      sessionStatusTypeId: args.sessionStatusTypeId,
    };

    if (args.startedAt !== undefined) updateData.startedAt = args.startedAt;
    if (args.completedAt !== undefined)
      updateData.completedAt = args.completedAt;
    if (args.verifiedAt !== undefined) updateData.verifiedAt = args.verifiedAt;
    if (args.verifiedByUserId !== undefined)
      updateData.verifiedByUserId = args.verifiedByUserId;
    if (args.rejectionReason !== undefined)
      updateData.rejectionReason = args.rejectionReason;

    // Step 3: Update the session
    await ctx.db.patch(args.sessionId, updateData);

    // Step 4: Return the updated session ID
    return args.sessionId;
  },
});

/**
 * updateSessionLineItem
 *
 * Purpose: Updates a session line item with the actual counted quantity
 *
 * Process:
 * 1. Fetches the line item to validate it exists
 * 2. Updates the actual quantity and optional fields
 * 3. Returns the updated line item ID
 *
 * Access: Available to assigned workers and supervisors
 * Typical users: Warehouse staff performing counts, supervisors
 */
export const updateSessionLineItem = mutation({
  args: {
    lineItemId: v.id("session_line_items"),
    actualQuantity: v.number(),
    scannedByUserId: v.optional(v.id("users")),
    scannedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Step 1: Fetch the line item to validate it exists
    const lineItem = await ctx.db.get(args.lineItemId);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    // Step 2: Update the line item with actual quantity
    await ctx.db.patch(args.lineItemId, {
      actualQuantity: args.actualQuantity,
      scannedAt: args.scannedAt ?? Date.now(),
      scannedByUserId: args.scannedByUserId,
      notes: args.notes,
    });

    // Step 3: Return the updated line item ID
    return args.lineItemId;
  },
});

// ================================================================
// EMPLOYEE SCANNER UI QUERIES & MUTATIONS
// ================================================================

/**
 * getMyAssignedSessions
 *
 * Purpose: Retrieves all cycle count sessions where the current user is assigned to at least one zone
 *
 * Process:
 * 1. Queries session_zone_assignments for the user
 * 2. Gets unique session IDs
 * 3. Fetches session details with status and progress info
 * 4. Returns sessions that are not completed/cancelled
 *
 * Access: Available to all authenticated users
 * Typical users: Warehouse staff checking their assigned work
 */
export const getMyAssignedSessions = query({
  args: {
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    branchId: v.id("branches"),
  },
  handler: async (ctx, args) => {
    // Step 1: Get all zone assignments for this user
    const myAssignments = await ctx.db
      .query("session_zone_assignments")
      .withIndex("assignedUserId", (q) => q.eq("assignedUserId", args.userId))
      .collect();

    if (myAssignments.length === 0) {
      return [];
    }

    // Step 2: Get unique session IDs
    const sessionIds = [...new Set(myAssignments.map((a) => a.sessionId))];

    // Step 3: Fetch session details
    const sessions = await Promise.all(
      sessionIds.map(async (sessionId) => {
        const session = await ctx.db.get(sessionId);
        if (!session) return null;

        // Check if session belongs to org/branch
        if (
          session.organizationId !== args.organizationId ||
          session.branchId !== args.branchId
        ) {
          return null;
        }

        // Get session status
        const sessionStatus = await ctx.db.get(session.sessionStatusTypeId);
        const statusValue = sessionStatus?.lookupValue?.toLowerCase();

        // Skip completed/cancelled sessions
        if (statusValue === "completed" || statusValue === "cancelled") {
          return null;
        }

        // Get user's zone assignments for this session
        const userZoneAssignments = myAssignments.filter(
          (a) => a.sessionId === sessionId,
        );

        // Get zone details and assignment status
        const zonesWithStatus = await Promise.all(
          userZoneAssignments.map(async (assignment) => {
            const zone = await ctx.db.get(assignment.zoneId);
            const assignmentStatus = assignment.assignmentStatusTypeId
              ? await ctx.db.get(assignment.assignmentStatusTypeId)
              : null;
            return {
              zoneId: assignment.zoneId,
              zoneName: zone?.name ?? "Unknown Zone",
              assignmentStatus: assignmentStatus?.lookupValue ?? "Not Started",
              assignmentId: assignment._id,
            };
          }),
        );

        return {
          _id: session._id,
          sessionCode: session.sessionCode,
          name: session.name ?? session.sessionCode,
          sessionStatus: sessionStatus?.lookupValue ?? "Unknown",
          assignedZones: zonesWithStatus,
          createdAt: session._creationTime,
        };
      }),
    );

    // Filter out nulls and return
    return sessions.filter((s) => s !== null);
  },
});

/**
 * getZoneLineItems
 *
 * Purpose: Retrieves all line items for a specific zone in a session (for scanner UI)
 *
 * Process:
 * 1. Validates the zone assignment exists and user is assigned
 * 2. Fetches all line items for the zone
 * 3. Enriches with product details
 * 4. Returns items sorted by scan status
 *
 * Access: Available to assigned workers
 * Typical users: Warehouse staff using scanner UI
 */
export const getZoneLineItems = query({
  args: {
    sessionId: v.id("work_sessions"),
    zoneId: v.id("storage_zones"),
  },
  handler: async (ctx, args) => {
    // Step 1: Get all line items for this session and zone
    const lineItems = await ctx.db
      .query("session_line_items")
      .withIndex("sessionId", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("zoneId"), args.zoneId))
      .collect();

    // Step 2: Enrich with product details
    const enrichedItems = await Promise.all(
      lineItems.map(async (item) => {
        const sku = await ctx.db.get(item.skuId);
        const product = sku?.productId ? await ctx.db.get(sku.productId) : null;
        const scannedByUser = item.scannedByUserId
          ? await ctx.db.get(item.scannedByUserId)
          : null;

        return {
          _id: item._id,
          skuId: item.skuId,
          skuCode: sku?.skuCode ?? "Unknown SKU",
          productName: product?.name ?? "Unknown Product",
          expectedQuantity: item.expectedQuantity,
          actualQuantity: item.actualQuantity,
          variance: item.actualQuantity - item.expectedQuantity,
          isScanned: item.scannedAt !== undefined,
          scannedAt: item.scannedAt,
          scannedByUser: scannedByUser?.fullName ?? null,
          notes: item.notes,
          batchId: item.batchId,
        };
      }),
    );

    // Step 3: Sort by scan status (unscanned first)
    return enrichedItems.sort((a, b) => {
      if (a.isScanned === b.isScanned) return 0;
      return a.isScanned ? 1 : -1;
    });
  },
});

/**
 * updateZoneAssignmentStatus
 *
 * Purpose: Updates the status of a zone assignment (start/complete work)
 *
 * Process:
 * 1. Validates the assignment exists
 * 2. Updates status and timestamps
 * 3. Returns the updated assignment ID
 *
 * Access: Available to assigned workers and supervisors
 * Typical users: Warehouse staff starting/completing zone work
 */
export const updateZoneAssignmentStatus = mutation({
  args: {
    assignmentId: v.id("session_zone_assignments"),
    assignmentStatusTypeId: v.id("system_lookups"),
  },
  handler: async (ctx, args) => {
    // Step 1: Fetch the assignment to validate it exists
    const assignment = await ctx.db.get(args.assignmentId);

    if (!assignment) {
      throw new Error("Zone assignment not found");
    }

    // Step 2: Get the status to determine which timestamp to set
    const status = await ctx.db.get(args.assignmentStatusTypeId);
    const statusCode = status?.lookupCode?.toLowerCase();

    // Step 3: Build update object
    const updateData: Record<string, unknown> = {
      assignmentStatusTypeId: args.assignmentStatusTypeId,
    };

    if (statusCode === "in_progress" && !assignment.startedAt) {
      updateData.startedAt = Date.now();
    }

    if (statusCode === "completed") {
      updateData.completedAt = Date.now();
    }

    // Step 4: Update the assignment
    await ctx.db.patch(args.assignmentId, updateData);

    return args.assignmentId;
  },
});

/**
 * getZoneAssignmentDetail
 *
 * Purpose: Retrieves detailed information about a specific zone assignment for the scanner UI
 *
 * Process:
 * 1. Fetches the zone assignment
 * 2. Gets related session, zone, and user details
 * 3. Calculates progress statistics
 * 4. Returns comprehensive assignment data
 *
 * Access: Available to assigned workers and supervisors
 */
export const getZoneAssignmentDetail = query({
  args: {
    assignmentId: v.id("session_zone_assignments"),
  },
  handler: async (ctx, args) => {
    // Step 1: Get the zone assignment
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) return null;

    // Step 2: Get related entities
    const session = await ctx.db.get(assignment.sessionId);
    const zone = await ctx.db.get(assignment.zoneId);
    const assignedUser = await ctx.db.get(assignment.assignedUserId);
    const assignmentStatus = assignment.assignmentStatusTypeId
      ? await ctx.db.get(assignment.assignmentStatusTypeId)
      : null;

    // Step 3: Get line items for this zone
    const lineItems = await ctx.db
      .query("session_line_items")
      .withIndex("sessionId", (q) => q.eq("sessionId", assignment.sessionId))
      .filter((q) => q.eq(q.field("zoneId"), assignment.zoneId))
      .collect();

    // Step 4: Calculate progress
    const totalItems = lineItems.length;
    const scannedItems = lineItems.filter((i) => i.scannedAt !== undefined).length;
    const itemsWithVariance = lineItems.filter(
      (i) => i.scannedAt !== undefined && i.actualQuantity !== i.expectedQuantity,
    ).length;

    return {
      _id: assignment._id,
      sessionId: assignment.sessionId,
      sessionCode: session?.sessionCode ?? "Unknown",
      sessionName: session?.name ?? session?.sessionCode ?? "Unknown",
      zoneId: assignment.zoneId,
      zoneName: zone?.name ?? "Unknown Zone",
      assignedUserId: assignment.assignedUserId,
      assignedUserName: assignedUser?.fullName ?? "Unknown",
      status: assignmentStatus?.lookupValue ?? "Not Started",
      statusCode: assignmentStatus?.lookupCode ?? "not_started",
      startedAt: assignment.startedAt,
      completedAt: assignment.completedAt,
      progress: {
        totalItems,
        scannedItems,
        itemsWithVariance,
        progressPercent: totalItems > 0 ? Math.round((scannedItems / totalItems) * 100) : 0,
      },
    };
  },
});

// ================================================================
// ADJUSTMENT QUERIES & MUTATIONS
// ================================================================

/**
 * getQuantityAdjustmentsForTable
 *
 * Purpose: Retrieves quantity adjustment requests with enriched data for table display
 *
 * Process:
 * 1. Gets the "QUANTITY" adjustment type lookup
 * 2. Queries adjustment_requests filtered by type, organization and branch
 * 3. Enriches each request with user info, status, reason, and detail summary
 *
 * Access: Available to all authenticated users within the organization
 */
export const getQuantityAdjustmentsForTable = query({
  args: {
    organizationId: v.id("organizations"),
    branchId: v.id("branches"),
  },
  handler: async (ctx, args) => {
    // Get the quantity adjustment type ID
    const quantityType = await ctx.db
      .query("system_lookups")
      .filter((q) =>
        q.and(
          q.eq(q.field("lookupType"), "AdjustmentType"),
          q.eq(q.field("lookupCode"), "QUANTITY"),
        ),
      )
      .first();

    if (!quantityType) return [];

    // Query adjustment requests
    const adjustmentRequests = await ctx.db
      .query("adjustment_requests")
      .withIndex("adjustmentTypeId", (q) =>
        q.eq("adjustmentTypeId", quantityType._id as unknown as string),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), args.organizationId as unknown as string),
          q.eq(q.field("branchId"), args.branchId as unknown as string),
        ),
      )
      .order("desc")
      .collect();

    // Enrich each request with related data
    const enrichedRequests = await Promise.all(
      adjustmentRequests.map(async (request) => {
        // Get user info
        const requestedByUser = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), request.requestedByUserId))
          .first();

        // Get status lookup
        const statusLookup = await ctx.db.get(
          request.adjustmentStatusTypeId as unknown as Id<"system_lookups">,
        );

        // Get details for this request
        const details = await ctx.db
          .query("adjustment_request_details")
          .withIndex("adjustmentRequestId", (q) =>
            q.eq("adjustmentRequestId", request._id),
          )
          .collect();

        // Get first detail for product info
        const firstDetail = details[0];
        let productName = "Multiple Products";

        if (firstDetail && details.length === 1) {
          // Try to get product name from SKU
          const productVariant = firstDetail.skuId
            ? await ctx.db
                .query("product_variants")
                .filter((q) => q.eq(q.field("skuCode"), firstDetail.skuId))
                .first()
            : null;

          if (productVariant) {
            const product = await ctx.db.get(productVariant.productId);
            productName = product?.name ?? firstDetail.skuId;
          } else {
            productName = firstDetail.skuId;
          }
        }

        // Get reason lookup
        const reasonLookup = firstDetail?.reasonTypeId
          ? await ctx.db.get(firstDetail.reasonTypeId as unknown as Id<"system_lookups">)
          : null;

        // Calculate totals from all details
        const totalExpected = details.reduce((sum, d) => sum + d.expectedQuantity, 0);
        const totalActual = details.reduce((sum, d) => sum + d.actualQuantity, 0);

        return {
          _id: request._id,
          requestCode: request.requestCode,
          productName,
          currentQty: totalExpected,
          adjustedQty: totalActual,
          reason: reasonLookup?.lookupValue ?? "Unknown",
          status: statusLookup?.lookupValue ?? "Unknown",
          requestedBy: requestedByUser ? { fullName: requestedByUser.fullName } : null,
          createdAt: request.requestedAt,
        };
      }),
    );

    return enrichedRequests;
  },
});

/**
 * getLocationAdjustmentsForTable
 *
 * Purpose: Retrieves location adjustment requests with enriched data for table display
 *
 * Process:
 * 1. Gets the "LOCATION" adjustment type lookup
 * 2. Queries adjustment_requests filtered by type, organization and branch
 * 3. Enriches each request with user info, status, reason, and location details
 *
 * Access: Available to all authenticated users within the organization
 */
export const getLocationAdjustmentsForTable = query({
  args: {
    organizationId: v.id("organizations"),
    branchId: v.id("branches"),
  },
  handler: async (ctx, args) => {
    // Get the location adjustment type ID
    const locationType = await ctx.db
      .query("system_lookups")
      .filter((q) =>
        q.and(
          q.eq(q.field("lookupType"), "AdjustmentType"),
          q.eq(q.field("lookupCode"), "LOCATION"),
        ),
      )
      .first();

    if (!locationType) return [];

    // Query adjustment requests
    const adjustmentRequests = await ctx.db
      .query("adjustment_requests")
      .withIndex("adjustmentTypeId", (q) =>
        q.eq("adjustmentTypeId", locationType._id as unknown as string),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), args.organizationId as unknown as string),
          q.eq(q.field("branchId"), args.branchId as unknown as string),
        ),
      )
      .order("desc")
      .collect();

    // Enrich each request with related data
    const enrichedRequests = await Promise.all(
      adjustmentRequests.map(async (request) => {
        // Get user info
        const requestedByUser = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), request.requestedByUserId))
          .first();

        // Get status lookup
        const statusLookup = await ctx.db.get(
          request.adjustmentStatusTypeId as unknown as Id<"system_lookups">,
        );

        // Get details for this request
        const details = await ctx.db
          .query("adjustment_request_details")
          .withIndex("adjustmentRequestId", (q) =>
            q.eq("adjustmentRequestId", request._id),
          )
          .collect();

        // Get first detail for product and location info
        const firstDetail = details[0];
        let productName = "Multiple Products";
        let fromLocation = "N/A";
        let toLocation = "N/A";

        if (firstDetail) {
          // Get product name
          if (details.length === 1) {
            const productVariant = firstDetail.skuId
              ? await ctx.db
                  .query("product_variants")
                  .filter((q) => q.eq(q.field("skuCode"), firstDetail.skuId))
                  .first()
              : null;

            if (productVariant) {
              const product = await ctx.db.get(productVariant.productId);
              productName = product?.name ?? firstDetail.skuId;
            } else {
              productName = firstDetail.skuId;
            }
          }

          // Get from zone name
          if (firstDetail.fromZoneId) {
            const fromZone = await ctx.db.get(
              firstDetail.fromZoneId as unknown as Id<"storage_zones">,
            );
            fromLocation = fromZone?.name ?? firstDetail.fromZoneId;
          }

          // Get to zone name
          if (firstDetail.toZoneId) {
            const toZone = await ctx.db.get(
              firstDetail.toZoneId as unknown as Id<"storage_zones">,
            );
            toLocation = toZone?.name ?? firstDetail.toZoneId;
          }
        }

        // Get reason lookup
        const reasonLookup = firstDetail?.reasonTypeId
          ? await ctx.db.get(firstDetail.reasonTypeId as unknown as Id<"system_lookups">)
          : null;

        // Calculate total quantity from all details
        const totalQuantity = details.reduce((sum, d) => sum + (d.quantity ?? 0), 0);

        return {
          _id: request._id,
          requestCode: request.requestCode,
          productName,
          fromLocation,
          toLocation,
          quantity: totalQuantity,
          reason: reasonLookup?.lookupValue ?? "Location Transfer",
          status: statusLookup?.lookupValue ?? "Unknown",
          requestedBy: requestedByUser ? { fullName: requestedByUser.fullName } : null,
          createdAt: request.requestedAt,
        };
      }),
    );

    return enrichedRequests;
  },
});

/**
 * getAdjustmentStats
 *
 * Purpose: Retrieves summary statistics for adjustment requests
 *
 * Access: Available to all authenticated users within the organization
 */
export const getAdjustmentStats = query({
  args: {
    organizationId: v.id("organizations"),
    branchId: v.id("branches"),
  },
  handler: async (ctx, args) => {
    // Get all adjustment requests for this branch
    const adjustmentRequests = await ctx.db
      .query("adjustment_requests")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", args.organizationId as unknown as string),
      )
      .filter((q) => q.eq(q.field("branchId"), args.branchId as unknown as string))
      .collect();

    // Get status lookups
    const pendingStatus = await ctx.db
      .query("system_lookups")
      .filter((q) =>
        q.and(
          q.eq(q.field("lookupType"), "AdjustmentStatus"),
          q.eq(q.field("lookupCode"), "PENDING"),
        ),
      )
      .first();

    const approvedStatus = await ctx.db
      .query("system_lookups")
      .filter((q) =>
        q.and(
          q.eq(q.field("lookupType"), "AdjustmentStatus"),
          q.eq(q.field("lookupCode"), "APPROVED"),
        ),
      )
      .first();

    const rejectedStatus = await ctx.db
      .query("system_lookups")
      .filter((q) =>
        q.and(
          q.eq(q.field("lookupType"), "AdjustmentStatus"),
          q.eq(q.field("lookupCode"), "REJECTED"),
        ),
      )
      .first();

    // Count by status
    const pendingCount = adjustmentRequests.filter(
      (r) => r.adjustmentStatusTypeId === (pendingStatus?._id as unknown as string),
    ).length;
    const approvedCount = adjustmentRequests.filter(
      (r) => r.adjustmentStatusTypeId === (approvedStatus?._id as unknown as string),
    ).length;
    const rejectedCount = adjustmentRequests.filter(
      (r) => r.adjustmentStatusTypeId === (rejectedStatus?._id as unknown as string),
    ).length;

    return {
      totalQuantityRequests: adjustmentRequests.length,
      pendingApproval: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
    };
  },
});

/**
 * getAllAdjustmentRequests
 *
 * Purpose: Retrieves all adjustment requests for a specific organization
 *
 * Process:
 * 1. Queries the adjustment_requests table using the organizationId index
 * 2. Returns all adjustment requests for the organization
 *
 * Access: Available to all authenticated users within the organization
 * Typical users: Warehouse managers, inventory staff, supervisors, admins
 */
export const getAllAdjustmentRequests = query({
  args: {
    organizationId: v.string(),
    branchId: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: Query adjustment_requests table filtered by organization
    const adjustmentRequests = await ctx.db
      .query("adjustment_requests")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .filter((q) => q.eq(q.field("branchId"), args.branchId))
      .collect();

    // Step 2: Return all adjustment requests
    return adjustmentRequests;
  },
});

/**
 * getAdjustmentsByType
 *
 * Purpose: Retrieves adjustment requests filtered by type (quantity or location)
 *
 * Process:
 * 1. Queries the adjustment_requests table using the adjustmentTypeId index
 * 2. Filters by organization
 * 3. Returns all matching adjustment requests
 *
 * Access: Available to all authenticated users within the organization
 * Typical users: Warehouse managers, inventory staff, supervisors, admins
 */
export const getAdjustmentsByType = query({
  args: {
    organizationId: v.string(),
    branchId: v.string(),
    adjustmentTypeId: v.string(), // "quantity" or "location"
  },
  handler: async (ctx, args) => {
    // Step 1: Query adjustment_requests table using type index
    const adjustmentRequests = await ctx.db
      .query("adjustment_requests")
      .withIndex("adjustmentTypeId", (q) =>
        q.eq("adjustmentTypeId", args.adjustmentTypeId),
      )
      // Step 2: Filter by organization and branch
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), args.organizationId),
          q.eq(q.field("branchId"), args.branchId),
        ),
      )
      .collect();

    // Step 3: Return filtered adjustment requests
    return adjustmentRequests;
  },
});

/**
 * getAdjustmentRequestById
 *
 * Purpose: Retrieves a specific adjustment request by its ID along with its details
 *
 * Process:
 * 1. Fetches the adjustment request from the database using the provided ID
 * 2. Validates that the request exists
 * 3. Queries all associated adjustment request details
 * 4. Returns the adjustment request with its details
 *
 * Access: Available to all authenticated users within the organization
 * Typical users: Warehouse managers, inventory staff, supervisors, admins
 */
export const getAdjustmentRequestById = query({
  args: {
    adjustmentRequestId: v.id("adjustment_requests"),
  },
  handler: async (ctx, args) => {
    // Step 1: Fetch the adjustment request by ID
    const adjustmentRequest = await ctx.db.get(args.adjustmentRequestId);

    // Step 2: Validate request exists
    if (!adjustmentRequest) {
      return null;
    }

    // Step 3: Query all associated adjustment request details
    const details = await ctx.db
      .query("adjustment_request_details")
      .withIndex("adjustmentRequestId", (q) =>
        q.eq("adjustmentRequestId", args.adjustmentRequestId),
      )
      .collect();

    // Step 4: Return the complete adjustment request with details
    return {
      ...adjustmentRequest,
      details,
    };
  },
});

/**
 * createNewAdjustmentRequest
 *
 * Purpose: Creates a new inventory adjustment request (quantity or location) with line items
 *
 * Process:
 * 1. Validates that at least one detail line item is provided
 * 2. Creates the adjustment request header with type and initial status
 * 3. Creates all associated adjustment request detail records
 * 4. Returns the newly created adjustment request ID
 *
 * Access: Restricted to authorized users with permission to create adjustment requests
 * Typical users: Warehouse managers, inventory staff, supervisors, admins
 */
export const createNewAdjustmentRequest = mutation({
  args: {
    organizationId: v.string(),
    branchId: v.string(),
    requestCode: v.string(),
    adjustmentTypeId: v.string(), // "quantity" or "location"
    requestedByUserId: v.string(),
    adjustmentStatusTypeId: v.string(),
    details: v.array(
      v.object({
        batchId: v.string(),
        skuId: v.string(),
        // For quantity adjustments
        expectedQuantity: v.optional(v.number()),
        actualQuantity: v.optional(v.number()),
        varianceQuantity: v.optional(v.number()),
        costImpact: v.optional(v.number()),
        // For location adjustments
        fromZoneId: v.optional(v.string()),
        toZoneId: v.optional(v.string()),
        quantity: v.optional(v.number()),
        // Common fields
        reasonTypeId: v.string(),
        customReasonNotes: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Step 1: Validate that details are provided
    if (!args.details || args.details.length === 0) {
      throw new Error(
        "Adjustment request must have at least one detail line item",
      );
    }

    // Step 2: Create the adjustment request header
    const adjustmentRequestId = await ctx.db.insert("adjustment_requests", {
      organizationId: args.organizationId,
      branchId: args.branchId,
      requestCode: args.requestCode,
      adjustmentTypeId: args.adjustmentTypeId,
      requestedByUserId: args.requestedByUserId,
      requestedAt: Date.now(),
      adjustmentStatusTypeId: args.adjustmentStatusTypeId,
    });

    // Step 3: Create all adjustment request detail records
    for (const detail of args.details) {
      await ctx.db.insert("adjustment_request_details", {
        adjustmentRequestId,
        batchId: detail.batchId,
        skuId: detail.skuId,
        expectedQuantity: detail.expectedQuantity ?? 0,
        actualQuantity: detail.actualQuantity ?? 0,
        varianceQuantity: detail.varianceQuantity ?? 0,
        costImpact: detail.costImpact ?? 0,
        fromZoneId: detail.fromZoneId,
        toZoneId: detail.toZoneId,
        quantity: detail.quantity,
        reasonTypeId: detail.reasonTypeId,
        customReasonNotes: detail.customReasonNotes,
      });
    }

    // Step 4: Return the newly created adjustment request ID
    return adjustmentRequestId;
  },
});

/**
 * setAdjustmentRequestStatus
 *
 * Purpose: Updates the status of a specific adjustment request
 *
 * Process:
 * 1. Fetches the adjustment request by ID to validate it exists
 * 2. Updates the status and optional approval fields
 * 3. Returns the updated adjustment request ID
 *
 * Access: Restricted to authorized users with permission to manage adjustment requests
 * Typical users: Warehouse managers, supervisors, admins
 */
export const setAdjustmentRequestStatus = mutation({
  args: {
    adjustmentRequestId: v.id("adjustment_requests"),
    adjustmentStatusTypeId: v.string(),
    approvedByUserId: v.optional(v.string()),
    resolutionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Step 1: Fetch the adjustment request to validate it exists
    const adjustmentRequest = await ctx.db.get(args.adjustmentRequestId);

    if (!adjustmentRequest) {
      throw new Error("Adjustment request not found");
    }

    // Step 2: Build update object
    const updateData: Record<string, unknown> = {
      adjustmentStatusTypeId: args.adjustmentStatusTypeId,
    };

    if (args.approvedByUserId !== undefined) {
      updateData.approvedByUserId = args.approvedByUserId;
      updateData.approvedAt = Date.now();
    }

    if (args.resolutionNotes !== undefined) {
      updateData.resolutionNotes = args.resolutionNotes;
    }

    // Step 3: Update the adjustment request
    await ctx.db.patch(args.adjustmentRequestId, updateData);

    // Step 4: Return the updated request ID
    return args.adjustmentRequestId;
  },
});

// ================================================================
// EXPIRY QUERIES
// ================================================================

/**
 * getExpiringBatches
 *
 * Purpose: Retrieves all inventory batches that are approaching expiry within a specified number of days
 *
 * Process:
 * 1. Calculates the expiry threshold date based on provided days
 * 2. Queries the inventory_batches table filtered by organization
 * 3. Filters for non-deleted batches with expiresAt within the threshold
 * 4. Returns batches with calculated days to expiry
 *
 * Access: Available to all authenticated users within the organization
 * Typical users: Warehouse managers, inventory staff, supervisors, admins
 */
export const getExpiringBatches = query({
  args: {
    organizationId: v.id("organizations"),
    branchId: v.id("branches"),
    daysThreshold: v.number(), // Number of days to look ahead for expiry
  },
  handler: async (ctx, args) => {
    // Step 1: Calculate the expiry threshold date
    const now = Date.now();
    const thresholdDate = now + args.daysThreshold * 24 * 60 * 60 * 1000;

    // Step 2: Query inventory_batches table filtered by organization
    const batches = await ctx.db
      .query("inventory_batches")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      // Step 3: Filter for non-deleted batches with expiry within threshold and branch
      .filter((q) =>
        q.and(
          q.eq(q.field("branchId"), args.branchId),
          q.eq(q.field("isDeleted"), false),
          q.neq(q.field("expiresAt"), undefined),
          q.lte(q.field("expiresAt"), thresholdDate),
        ),
      )
      .collect();

    // Step 4: Calculate days to expiry and return enriched data
    return batches.map((batch) => {
      const daysToExpiry = batch.expiresAt
        ? Math.ceil((batch.expiresAt - now) / (24 * 60 * 60 * 1000))
        : null;

      return {
        ...batch,
        daysToExpiry,
        isExpired: daysToExpiry !== null && daysToExpiry <= 0,
      };
    });
  },
});

/**
 * getExpiringBatchesByZone
 *
 * Purpose: Retrieves expiring batches grouped by storage zone for targeted cycle count planning
 *
 * Process:
 * 1. Calculates the expiry threshold date based on provided days
 * 2. Queries inventory_batches filtered by organization and zone
 * 3. Filters for non-deleted batches with expiresAt within the threshold
 * 4. Returns batches with calculated days to expiry
 *
 * Access: Available to all authenticated users within the organization
 * Typical users: Warehouse managers, supervisors planning cycle counts
 */
export const getExpiringBatchesByZone = query({
  args: {
    organizationId: v.id("organizations"),
    branchId: v.id("branches"),
    zoneId: v.id("storage_zones"),
    daysThreshold: v.number(),
  },
  handler: async (ctx, args) => {
    // Step 1: Calculate the expiry threshold date
    const now = Date.now();
    const thresholdDate = now + args.daysThreshold * 24 * 60 * 60 * 1000;

    // Step 2: Query inventory_batches table filtered by zone
    const batches = await ctx.db
      .query("inventory_batches")
      .withIndex("zoneId", (q) => q.eq("zoneId", args.zoneId))
      // Step 3: Filter for organization, branch, non-deleted, and expiry within threshold
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), args.organizationId),
          q.eq(q.field("branchId"), args.branchId),
          q.eq(q.field("isDeleted"), false),
          q.neq(q.field("expiresAt"), undefined),
          q.lte(q.field("expiresAt"), thresholdDate),
        ),
      )
      .collect();

    // Step 4: Calculate days to expiry and return enriched data
    return batches.map((batch) => {
      const daysToExpiry = batch.expiresAt
        ? Math.ceil((batch.expiresAt - now) / (24 * 60 * 60 * 1000))
        : null;

      return {
        ...batch,
        daysToExpiry,
        isExpired: daysToExpiry !== null && daysToExpiry <= 0,
      };
    });
  },
});

// ================================================================
// LIST & STATS QUERIES
// ================================================================

/**
 * listWithDetails
 *
 * Purpose: Retrieves all cycle count sessions with enriched data for the table view
 *
 * Process:
 * 1. Queries work_sessions table filtered by organization and branch
 * 2. Filters by session type (cycle count)
 * 3. Enriches each session with cycle count type, status, assigned user, and zones count
 * 4. Returns formatted list matching CycleCountSessionListItem type
 *
 * Access: Available to all authenticated users within the organization
 */
export const listWithDetails = query({
  args: {
    organizationId: v.string(),
    branchId: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: Get the cycle count session type lookup
    const cycleCountSessionType = await ctx.db
      .query("system_lookups")
      .filter((q) =>
        q.and(
          q.eq(q.field("lookupType"), "session_type"),
          q.eq(q.field("lookupValue"), "Cycle Count"),
        ),
      )
      .first();

    if (!cycleCountSessionType) {
      return [];
    }

    // Step 2: Query work_sessions table filtered by organization
    const sessions = await ctx.db
      .query("work_sessions")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", args.organizationId as any),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("branchId"), args.branchId as any),
          q.eq(q.field("sessionTypeId"), cycleCountSessionType._id),
        ),
      )
      .order("desc")
      .collect();

    // Step 3: Enrich each session with related data
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        // Get cycle count type
        const cycleCountType = session.cycleCountTypeId
          ? await ctx.db.get(session.cycleCountTypeId)
          : null;

        // Get session status
        const sessionStatus = await ctx.db.get(session.sessionStatusTypeId);

        // Get assigned user
        const assignedUser = await ctx.db.get(session.assignedUserId);

        // Count zones for this session
        const zoneAssignments = await ctx.db
          .query("session_zone_assignments")
          .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
          .collect();

        return {
          _id: session._id,
          sessionCode: session.sessionCode,
          name: session.name ?? session.sessionCode,
          cycleCountType: cycleCountType
            ? { lookupValue: cycleCountType.lookupValue }
            : null,
          sessionStatus: sessionStatus
            ? { lookupValue: sessionStatus.lookupValue }
            : null,
          createdByUser: assignedUser
            ? { fullName: assignedUser.fullName ?? assignedUser.email }
            : null,
          zonesCount: zoneAssignments.length,
          createdAt: session._creationTime,
        };
      }),
    );

    return enrichedSessions;
  },
});

/**
 * getStats
 *
 * Purpose: Retrieves cycle count statistics for the dashboard
 *
 * Process:
 * 1. Gets all cycle count sessions for the organization/branch
 * 2. Counts active sessions, completed sessions, and total zones
 * 3. Calculates verification rate from session metrics
 *
 * Access: Available to all authenticated users within the organization
 */
export const getStats = query({
  args: {
    organizationId: v.string(),
    branchId: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: Get the cycle count session type lookup
    const cycleCountSessionType = await ctx.db
      .query("system_lookups")
      .filter((q) =>
        q.and(
          q.eq(q.field("lookupType"), "session_type"),
          q.eq(q.field("lookupValue"), "Cycle Count"),
        ),
      )
      .first();

    if (!cycleCountSessionType) {
      return {
        activeSessions: 0,
        totalZones: 0,
        completedSessions: 0,
        verificationRate: 0,
      };
    }

    // Step 2: Get active and completed status lookups
    const activeStatus = await ctx.db
      .query("system_lookups")
      .filter((q) =>
        q.and(
          q.eq(q.field("lookupType"), "session_status"),
          q.eq(q.field("lookupValue"), "Active"),
        ),
      )
      .first();

    const completedStatus = await ctx.db
      .query("system_lookups")
      .filter((q) =>
        q.and(
          q.eq(q.field("lookupType"), "session_status"),
          q.eq(q.field("lookupValue"), "Completed"),
        ),
      )
      .first();

    // Step 3: Query all cycle count sessions for this org/branch
    const allSessions = await ctx.db
      .query("work_sessions")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", args.organizationId as any),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("branchId"), args.branchId as any),
          q.eq(q.field("sessionTypeId"), cycleCountSessionType._id),
        ),
      )
      .collect();

    // Step 4: Count active and completed sessions
    const activeSessions = activeStatus
      ? allSessions.filter(
          (s) => s.sessionStatusTypeId === activeStatus._id,
        ).length
      : 0;

    const completedSessions = completedStatus
      ? allSessions.filter(
          (s) => s.sessionStatusTypeId === completedStatus._id,
        ).length
      : 0;

    // Step 5: Count total unique zones across all sessions
    const allZoneAssignments = await Promise.all(
      allSessions.map(async (session) => {
        const assignments = await ctx.db
          .query("session_zone_assignments")
          .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
          .collect();
        return assignments.map((a) => a.zoneId);
      }),
    );
    const uniqueZones = new Set(allZoneAssignments.flat());
    const totalZones = uniqueZones.size;

    // Step 6: Calculate average verification rate from session metrics
    const allMetrics = await Promise.all(
      allSessions.map(async (session) => {
        const metrics = await ctx.db
          .query("session_metrics")
          .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
          .first();
        return metrics?.accuracyRate;
      }),
    );
    const validMetrics = allMetrics.filter(
      (rate): rate is number => rate !== undefined && rate !== null,
    );
    const verificationRate =
      validMetrics.length > 0
        ? Math.round(
            validMetrics.reduce((sum, rate) => sum + rate, 0) /
              validMetrics.length,
          )
        : 0;

    return {
      activeSessions,
      totalZones,
      completedSessions,
      verificationRate,
    };
  },
});

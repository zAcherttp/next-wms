import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
    sessionTypeId: v.id("system_lookups"),
  },
  handler: async (ctx, args) => {
    // Step 1: Query work_sessions table filtered by organization
    const cycleCounts = await ctx.db
      .query("work_sessions")
      .withIndex("organizationId", (q) => 
        q.eq("organizationId", args.organizationId)
      )
      // Step 2: Filter by session type to get only cycle count sessions
      .filter((q) => 
        q.eq(q.field("sessionTypeId"), args.sessionTypeId)
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
    sessionTypeId: v.id("system_lookups"),
    sessionStatusTypeId: v.id("system_lookups"),
  },
  handler: async (ctx, args) => {
    // Step 1: Query work_sessions table using status index
    const sessions = await ctx.db
      .query("work_sessions")
      .withIndex("sessionStatusTypeId", (q) => 
        q.eq("sessionStatusTypeId", args.sessionStatusTypeId)
      )
      // Step 2: Filter by organization and session type
      .filter((q) => 
        q.and(
          q.eq(q.field("organizationId"), args.organizationId),
          q.eq(q.field("sessionTypeId"), args.sessionTypeId)
        )
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
        assignedUserId: v.id("users"),
      })
    ),
    lineItems: v.array(
      v.object({
        skuId: v.id("product_variants"),
        expectedQuantity: v.number(),
        zoneId: v.optional(v.id("storage_zones")),
        batchId: v.optional(v.id("inventory_batches")),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Step 1: Validate that zone assignments are provided
    if (!args.zoneAssignments || args.zoneAssignments.length === 0) {
      throw new Error("Cycle count session must have at least one zone assignment");
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

    // Step 3: Create zone-worker assignments
    for (const assignment of args.zoneAssignments) {
      await ctx.db.insert("session_zone_assignments", {
        sessionId,
        zoneId: assignment.zoneId,
        assignedUserId: assignment.assignedUserId,
      });
    }

    // Step 4: Create all session line items
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

    // Step 5: Return the newly created session ID
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
      .withIndex("sessionId", (q) => 
        q.eq("sessionId", args.sessionId)
      )
      .collect();

    // Step 4: Query all associated session line items
    const lineItems = await ctx.db
      .query("session_line_items")
      .withIndex("sessionId", (q) => 
        q.eq("sessionId", args.sessionId)
      )
      .collect();

    // Step 5: Query all inventory transactions related to this session
    const inventoryTransactions = await ctx.db
      .query("inventory_transactions")
      .filter((q) => 
        q.eq(q.field("workSessionId"), args.sessionId)
      )
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
    if (args.completedAt !== undefined) updateData.completedAt = args.completedAt;
    if (args.verifiedAt !== undefined) updateData.verifiedAt = args.verifiedAt;
    if (args.verifiedByUserId !== undefined) updateData.verifiedByUserId = args.verifiedByUserId;
    if (args.rejectionReason !== undefined) updateData.rejectionReason = args.rejectionReason;

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
      notes: args.notes,
    });

    // Step 3: Return the updated line item ID
    return args.lineItemId;
  },
});

// ================================================================
// ADJUSTMENT QUERIES & MUTATIONS
// ================================================================

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
  },
  handler: async (ctx, args) => {
    // Step 1: Query adjustment_requests table filtered by organization
    const adjustmentRequests = await ctx.db
      .query("adjustment_requests")
      .withIndex("organizationId", (q) => 
        q.eq("organizationId", args.organizationId)
      )
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
    adjustmentTypeId: v.string(), // "quantity" or "location"
  },
  handler: async (ctx, args) => {
    // Step 1: Query adjustment_requests table using type index
    const adjustmentRequests = await ctx.db
      .query("adjustment_requests")
      .withIndex("adjustmentTypeId", (q) => 
        q.eq("adjustmentTypeId", args.adjustmentTypeId)
      )
      // Step 2: Filter by organization
      .filter((q) => 
        q.eq(q.field("organizationId"), args.organizationId)
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
        q.eq("adjustmentRequestId", args.adjustmentRequestId)
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
      })
    ),
  },
  handler: async (ctx, args) => {
    // Step 1: Validate that details are provided
    if (!args.details || args.details.length === 0) {
      throw new Error("Adjustment request must have at least one detail line item");
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
        q.eq("organizationId", args.organizationId)
      )
      // Step 3: Filter for non-deleted batches with expiry within threshold
      .filter((q) => 
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.neq(q.field("expiresAt"), undefined),
          q.lte(q.field("expiresAt"), thresholdDate)
        )
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
      .withIndex("zoneId", (q) => 
        q.eq("zoneId", args.zoneId)
      )
      // Step 3: Filter for organization, non-deleted, and expiry within threshold
      .filter((q) => 
        q.and(
          q.eq(q.field("organizationId"), args.organizationId),
          q.eq(q.field("isDeleted"), false),
          q.neq(q.field("expiresAt"), undefined),
          q.lte(q.field("expiresAt"), thresholdDate)
        )
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

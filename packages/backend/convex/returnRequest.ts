import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Get supplier by ID (handles string ID from return_requests table)
 */
async function getSupplierById(ctx: any, supplierId: string) {
  try {
    const supplier = await ctx.db.get(supplierId as Id<"suppliers">);
    return supplier;
  } catch {
    return null;
  }
}

/**
 * Get user by ID (handles string ID from return_requests table)
 */
async function getUserById(ctx: any, userId: string) {
  try {
    const user = await ctx.db.get(userId as Id<"users">);
    return user;
  } catch {
    return null;
  }
}

/**
 * Get system lookup by ID
 */
async function getSystemLookup(ctx: any, lookupId: string) {
  try {
    const lookup = await ctx.db.get(lookupId as Id<"system_lookups">);
    return lookup;
  } catch {
    return null;
  }
}

/**
 * Get product variant by ID
 */
async function getProductVariant(ctx: any, skuId: string) {
  try {
    const variant = await ctx.db.get(skuId as Id<"product_variants">);
    return variant;
  } catch {
    return null;
  }
}

// ================================================================
// QUERIES
// ================================================================

/**
 * getAllReturnRequest
 *
 * Purpose: Retrieves all active return requests for a specific organization
 *
 * Process:
 * 1. Queries the return_requests table using the organizationId index
 * 2. Filters results to only include non-deleted records (isDeleted = false)
 * 3. Returns the complete list of active return requests
 *
 * Access: Available to all authenticated users within the organization
 * Typical users: Warehouse managers, inventory staff, admins
 */
export const getAllReturnRequest = query({
  args: {
    organizationId: v.string(),
    branchId: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: Query return_requests table filtered by organization
    const returnRequests = await ctx.db
      .query("return_requests")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      // Step 2: Exclude soft-deleted records and filter by branch
      .filter((q) =>
        q.and(
          q.eq(q.field("branchId"), args.branchId),
          q.eq(q.field("isDeleted"), false),
        ),
      )
      .collect();

    // Step 3: Return all active return requests
    return returnRequests;
  },
});

/**
 * listWithDetails
 *
 * Purpose: Retrieves all active return requests with related data (supplier, user, status)
 *
 * Process:
 * 1. Queries the return_requests table using the organizationId index
 * 2. Filters results to only include non-deleted records
 * 3. Enriches each request with supplier name, user name, and status
 * 4. Counts total SKUs and items for each request
 *
 * Access: Available to all authenticated users within the organization
 */
export const listWithDetails = query({
  args: {
    organizationId: v.string(),
    branchId: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: Query return_requests table filtered by organization
    const returnRequests = await ctx.db
      .query("return_requests")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("branchId"), args.branchId),
          q.eq(q.field("isDeleted"), false),
        ),
      )
      .order("desc")
      .collect();

    // Step 2: Enrich each request with related data
    const enrichedRequests = await Promise.all(
      returnRequests.map(async (request) => {
        // Get supplier
        const supplier = await getSupplierById(ctx, request.supplierId);

        // Get requested by user
        const requestedByUser = await getUserById(ctx, request.requestedByUserId);

        // Get status
        const status = await getSystemLookup(ctx, request.returnStatusTypeId);

        // Get details to count total SKUs and items
        const details = await ctx.db
          .query("return_request_details")
          .withIndex("returnRequestId", (q) =>
            q.eq("returnRequestId", request._id),
          )
          .collect();

        const totalSKUs = details.length;
        const totalItems = details.reduce(
          (sum, detail) => sum + detail.quantityToReturn,
          0,
        );

        return {
          _id: request._id,
          requestCode: request.requestCode,
          requestedAt: request.requestedAt,
          supplier: supplier ? { name: supplier.name } : null,
          requestedByUser: requestedByUser
            ? { fullName: requestedByUser.fullName }
            : null,
          returnStatus: status ? { lookupValue: status.lookupValue } : null,
          totalSKUs,
          totalItems,
        };
      }),
    );

    return enrichedRequests;
  },
});

/**
 * getFilteredReturnRequestByStatus
 *
 * Purpose: Retrieves return requests filtered by specific status type
 *
 * Process:
 * 1. Queries the return_requests table using the returnStatusTypeId index
 * 2. Filters by organization and status type
 * 3. Excludes soft-deleted records (isDeleted = false)
 * 4. Returns all matching return requests
 *
 * Access: Available to all authenticated users within the organization
 * Typical users: Warehouse managers, inventory staff, supervisors, admins
 */
export const getFilteredReturnRequestByStatus = query({
  args: {
    organizationId: v.string(),
    branchId: v.string(),
    returnStatusTypeId: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: Query return_requests table using returnStatusTypeId index
    const returnRequests = await ctx.db
      .query("return_requests")
      .withIndex("returnStatusTypeId", (q) =>
        q.eq("returnStatusTypeId", args.returnStatusTypeId),
      )
      // Step 2: Filter by organization, branch and exclude soft-deleted records
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), args.organizationId),
          q.eq(q.field("branchId"), args.branchId),
          q.eq(q.field("isDeleted"), false),
        ),
      )
      .collect();

    // Step 3: Return filtered return requests
    return returnRequests;
  },
});

/**
 * getReturnRequestById
 *
 * Purpose: Retrieves a specific return request by its ID along with its line item details
 *
 * Process:
 * 1. Fetches the return request from the database using the provided ID
 * 2. Validates that the request exists and is not deleted
 * 3. Queries all associated return request details (line items)
 * 4. Returns the return request with its details
 *
 * Access: Available to all authenticated users within the organization
 * Typical users: Warehouse managers, inventory staff, supervisors, admins
 */
export const getReturnRequestById = query({
  args: {
    returnRequestId: v.id("return_requests"),
  },
  handler: async (ctx, args) => {
    // Step 1: Fetch the return request by ID
    const returnRequest = await ctx.db.get(args.returnRequestId);

    // Step 2: Validate request exists and is not deleted
    if (!returnRequest || returnRequest.isDeleted) {
      return null;
    }

    // Step 3: Query all associated return request details
    const returnDetails = await ctx.db
      .query("return_request_details")
      .withIndex("returnRequestId", (q) =>
        q.eq("returnRequestId", args.returnRequestId),
      )
      .collect();

    // Step 4: Return the complete return request with details
    return {
      ...returnRequest,
      details: returnDetails,
    };
  },
});

/**
 * getReturnRequestWithDetails
 *
 * Purpose: Retrieves a specific return request by its ID with all enriched data
 *
 * Process:
 * 1. Fetches the return request from the database
 * 2. Enriches with supplier, user, and status information
 * 3. Enriches each detail line with SKU/product info and reason
 * 4. Returns the complete return request with all related data
 *
 * Access: Available to all authenticated users within the organization
 */
export const getReturnRequestWithDetails = query({
  args: {
    returnRequestId: v.id("return_requests"),
  },
  handler: async (ctx, args) => {
    // Step 1: Fetch the return request by ID
    const returnRequest = await ctx.db.get(args.returnRequestId);

    // Step 2: Validate request exists and is not deleted
    if (!returnRequest || returnRequest.isDeleted) {
      return null;
    }

    // Step 3: Get related data for the header
    const supplier = await getSupplierById(ctx, returnRequest.supplierId);
    const requestedByUser = await getUserById(ctx, returnRequest.requestedByUserId);
    const status = await getSystemLookup(ctx, returnRequest.returnStatusTypeId);

    // Step 4: Query all associated return request details
    const returnDetails = await ctx.db
      .query("return_request_details")
      .withIndex("returnRequestId", (q) =>
        q.eq("returnRequestId", args.returnRequestId),
      )
      .collect();

    // Step 5: Enrich each detail with product/SKU info and reason
    const enrichedDetails = await Promise.all(
      returnDetails.map(async (detail) => {
        const productVariant = await getProductVariant(ctx, detail.skuId);
        const reason = await getSystemLookup(ctx, detail.reasonTypeId);

        // Get product name if variant exists
        let productName: string | null = null;
        if (productVariant) {
          const product = await ctx.db.get(productVariant.productId as Id<"products">);
          productName = (product as { name?: string } | null)?.name ?? null;
        }

        return {
          _id: detail._id,
          skuCode: productVariant?.skuCode ?? "Unknown SKU",
          productName,
          quantityToReturn: detail.quantityToReturn,
          expectedCreditAmount: detail.expectedCreditAmount,
          reason: reason ? { lookupValue: reason.lookupValue } : null,
          customReasonNotes: detail.customReasonNotes,
          batchId: detail.batchId,
        };
      }),
    );

    // Calculate totals
    const totalSKUs = returnDetails.length;
    const totalExpectedQuantity = returnDetails.reduce(
      (sum, detail) => sum + detail.quantityToReturn,
      0,
    );
    const totalExpectedCredit = returnDetails.reduce(
      (sum, detail) => sum + detail.expectedCreditAmount,
      0,
    );

    // Step 6: Return the complete return request with enriched details
    return {
      _id: returnRequest._id,
      requestCode: returnRequest.requestCode,
      requestedAt: returnRequest.requestedAt,
      supplier: supplier ? { name: supplier.name } : null,
      requestedByUser: requestedByUser
        ? { fullName: requestedByUser.fullName }
        : null,
      returnStatus: status ? { lookupValue: status.lookupValue } : null,
      totalSKUs,
      totalExpectedQuantity,
      totalExpectedCredit,
      details: enrichedDetails,
    };
  },
});

/**
 * setReturnRequestStatus
 *
 * Purpose: Updates the status of a specific return request
 *
 * Process:
 * 1. Fetches the return request by ID to validate it exists
 * 2. Verifies the request is not deleted
 * 3. Updates the returnStatusTypeId to the new status
 * 4. Returns the updated return request ID
 *
 * Access: Restricted to authorized users with permission to manage return requests
 * Typical users: Warehouse managers, supervisors, admins
 */
export const setReturnRequestStatus = mutation({
  args: {
    returnRequestId: v.id("return_requests"),
    returnStatusTypeId: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: Fetch the return request to validate it exists
    const returnRequest = await ctx.db.get(args.returnRequestId);

    // Step 2: Validate request exists and is not deleted
    if (!returnRequest || returnRequest.isDeleted) {
      throw new Error("Return request not found or has been deleted");
    }

    // Step 3: Update the status
    await ctx.db.patch(args.returnRequestId, {
      returnStatusTypeId: args.returnStatusTypeId,
    });

    // Step 4: Return the updated request ID
    return args.returnRequestId;
  },
});

/**
 * createReturnRequest
 *
 * Purpose: Creates a new return request along with its line item details
 *
 * Process:
 * 1. Validates that at least one detail line item is provided
 * 2. Creates the return request header with initial status
 * 3. Creates all associated return request detail records
 * 4. Returns the newly created return request ID
 *
 * Access: Restricted to authorized users with permission to create return requests
 * Typical users: Warehouse managers, inventory staff, admins
 */
export const createReturnRequest = mutation({
  args: {
    organizationId: v.string(),
    branchId: v.string(),
    requestCode: v.string(),
    supplierId: v.string(),
    requestedByUserId: v.string(),
    returnStatusTypeId: v.string(),
    details: v.array(
      v.object({
        batchId: v.string(),
        skuId: v.string(),
        quantityToReturn: v.number(),
        reasonTypeId: v.string(),
        customReasonNotes: v.optional(v.string()),
        expectedCreditAmount: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Step 1: Validate that details are provided
    if (!args.details || args.details.length === 0) {
      throw new Error("Return request must have at least one detail line item");
    }

    // Step 2: Create the return request header
    const returnRequestId = await ctx.db.insert("return_requests", {
      organizationId: args.organizationId,
      branchId: args.branchId,
      requestCode: args.requestCode,
      supplierId: args.supplierId,
      requestedByUserId: args.requestedByUserId,
      requestedAt: Date.now(),
      returnStatusTypeId: args.returnStatusTypeId,
      isDeleted: false,
    });

    // Step 3: Create all return request detail records
    for (const detail of args.details) {
      await ctx.db.insert("return_request_details", {
        returnRequestId,
        batchId: detail.batchId,
        skuId: detail.skuId,
        quantityToReturn: detail.quantityToReturn,
        reasonTypeId: detail.reasonTypeId,
        customReasonNotes: detail.customReasonNotes,
        expectedCreditAmount: detail.expectedCreditAmount,
      });
    }

    // Step 4: Return the newly created return request ID
    return returnRequestId;
  },
});

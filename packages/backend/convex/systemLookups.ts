/**
 * SYSTEM LOOKUPS API
 *
 * Provides access to system lookup values used across the application.
 * Lookup types include:
 * - StorageRequirement (NORMAL, COLD, FREEZER)
 * - TrackingMethod (FIFO, FEFO, SERIAL)
 * - UnitOfMeasure (PCS, BOX, KG)
 * - BarcodeType (EAN13, QR)
 * - And many more...
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * GET BY TYPE - Get all lookups of a specific type
 */
export const getByType = query({
  args: {
    lookupType: v.string(),
  },
  handler: async (ctx, args) => {
    const lookups = await ctx.db
      .query("system_lookups")
      .withIndex("lookupType", (q) => q.eq("lookupType", args.lookupType))
      .collect();

    // Sort by sortOrder
    return lookups.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * GET BY TYPE AND CODE - Get a specific lookup by type and code
 */
export const getByTypeAndCode = query({
  args: {
    lookupType: v.string(),
    lookupCode: v.string(),
  },
  handler: async (ctx, args) => {
    const lookup = await ctx.db
      .query("system_lookups")
      .withIndex("lookupType_lookupCode", (q) =>
        q.eq("lookupType", args.lookupType).eq("lookupCode", args.lookupCode),
      )
      .first();

    return lookup;
  },
});

/**
 * GET BY ID - Get a lookup by its ID
 */
export const get = query({
  args: {
    id: v.id("system_lookups"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * GET MULTIPLE BY TYPE - Get multiple lookup types at once
 * Useful for loading form dropdowns in one query
 */
export const getMultipleTypes = query({
  args: {
    lookupTypes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const results: Record<
      string,
      Array<{
        _id: string;
        lookupType: string;
        lookupCode: string;
        lookupValue: string;
        description: string;
        sortOrder: number;
      }>
    > = {};

    for (const lookupType of args.lookupTypes) {
      const lookups = await ctx.db
        .query("system_lookups")
        .withIndex("lookupType", (q) => q.eq("lookupType", lookupType))
        .collect();

      results[lookupType] = lookups.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return results;
  },
});

// Common lookup type constants for type safety
export const LOOKUP_TYPES = {
  // Product related
  STORAGE_REQUIREMENT: "StorageRequirement",
  TRACKING_METHOD: "TrackingMethod",
  UNIT_OF_MEASURE: "UnitOfMeasure",
  BARCODE_TYPE: "BarcodeType",

  // Order statuses
  PURCHASE_ORDER_STATUS: "PurchaseOrderStatus",
  OUTBOUND_ORDER_STATUS: "OutboundOrderStatus",
  TRANSFER_ORDER_STATUS: "TransferOrderStatus",
  RETURN_STATUS: "ReturnStatus",

  // Session related
  SESSION_TYPE: "SessionType",
  SESSION_STATUS: "SessionStatus",
  CYCLE_COUNT_TYPE: "CycleCountType",
  RECEIVE_SESSION_STATUS: "ReceiveSessionStatus",
  RECEIVE_SESSION_ITEM_STATUS: "ReceiveSessionItemStatus",

  // Inventory related
  BATCH_STATUS: "BatchStatus",
  SERIAL_STATUS: "SerialStatus",
  INVENTORY_TRANSACTION_TYPE: "InventoryTransactionType",

  // Adjustment related
  ADJUSTMENT_STATUS: "AdjustmentStatus",
  ADJUSTMENT_TYPE: "AdjustmentType",
  ADJUSTMENT_REASON: "AdjustmentReason",

  // Other
  ZONE_TYPE: "ZoneType",
  NOTIFICATION_CATEGORY: "NotificationCategory",
  PRIORITY: "Priority",
  FORECAST_TYPE: "ForecastType",
  SHARING_SCOPE: "SharingScope",
  AUDIT_ACTION: "AuditAction",
  INVITATION_STATUS: "InvitationStatus",
  ASSIGNMENT_STATUS: "AssignmentStatus",
  RETURN_REASON: "ReturnReason",
} as const;

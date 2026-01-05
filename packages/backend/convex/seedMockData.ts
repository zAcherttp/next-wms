import { mutation } from "./_generated/server";

/**
 * Seed comprehensive mock data for all database tables
 * Run this once to populate the database with test data
 */
export const seedAllTestData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    // ================================================================
    // 1. SYSTEM LOOKUPS (All lookup types needed across the system)
    // ================================================================

    // Purchase Order Status types
    const pendingStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "PurchaseOrderStatus",
      lookupCode: "PENDING",
      lookupValue: "Pending",
      description: "Purchase order is pending approval",
      sortOrder: 1,
    });

    const approvedStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "PurchaseOrderStatus",
      lookupCode: "APPROVED",
      lookupValue: "Approved",
      description: "Purchase order has been approved",
      sortOrder: 2,
    });

    const receivedStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "PurchaseOrderStatus",
      lookupCode: "RECEIVED",
      lookupValue: "Received",
      description: "Purchase order has been received",
      sortOrder: 3,
    });

    const cancelledStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "PurchaseOrderStatus",
      lookupCode: "CANCELLED",
      lookupValue: "Cancelled",
      description: "Purchase order has been cancelled",
      sortOrder: 4,
    });

    // Outbound Order Status types
    const outboundPendingStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "OutboundOrderStatus",
      lookupCode: "PENDING",
      lookupValue: "Pending",
      description: "Outbound order is pending",
      sortOrder: 1,
    });

    const outboundProcessingStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "OutboundOrderStatus",
      lookupCode: "PROCESSING",
      lookupValue: "Processing",
      description: "Outbound order is being processed",
      sortOrder: 2,
    });

    const outboundShippedStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "OutboundOrderStatus",
      lookupCode: "SHIPPED",
      lookupValue: "Shipped",
      description: "Outbound order has been shipped",
      sortOrder: 3,
    });

    const outboundDeliveredStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "OutboundOrderStatus",
      lookupCode: "DELIVERED",
      lookupValue: "Delivered",
      description: "Outbound order has been delivered",
      sortOrder: 4,
    });

    // Transfer Order Status types
    const transferPendingStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "TransferOrderStatus",
      lookupCode: "PENDING",
      lookupValue: "Pending",
      description: "Transfer order is pending",
      sortOrder: 1,
    });

    const transferInTransitStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "TransferOrderStatus",
      lookupCode: "IN_TRANSIT",
      lookupValue: "In Transit",
      description: "Transfer order is in transit",
      sortOrder: 2,
    });

    const transferCompletedStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "TransferOrderStatus",
      lookupCode: "COMPLETED",
      lookupValue: "Completed",
      description: "Transfer order has been completed",
      sortOrder: 3,
    });

    // Session Status types
    const sessionPendingStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "SessionStatus",
      lookupCode: "PENDING",
      lookupValue: "Pending",
      description: "Session is pending",
      sortOrder: 1,
    });

    const sessionInProgressStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "SessionStatus",
      lookupCode: "IN_PROGRESS",
      lookupValue: "In Progress",
      description: "Session is in progress",
      sortOrder: 2,
    });

    const sessionCompletedStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "SessionStatus",
      lookupCode: "COMPLETED",
      lookupValue: "Completed",
      description: "Session has been completed",
      sortOrder: 3,
    });

    const sessionVerifiedStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "SessionStatus",
      lookupCode: "VERIFIED",
      lookupValue: "Verified",
      description: "Session has been verified",
      sortOrder: 4,
    });

    // Session Type lookups
    const receiveSessionTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "SessionType",
      lookupCode: "RECEIVE",
      lookupValue: "Receive",
      description: "Receiving session for inbound goods",
      sortOrder: 1,
    });

    const pickSessionTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "SessionType",
      lookupCode: "PICK",
      lookupValue: "Pick",
      description: "Picking session for outbound orders",
      sortOrder: 2,
    });

    const cycleCountSessionTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "SessionType",
      lookupCode: "CYCLE_COUNT",
      lookupValue: "Cycle Count",
      description: "Inventory cycle count session",
      sortOrder: 3,
    });

    // Cycle Count Type lookups
    const dailyCycleCountTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "CycleCountType",
      lookupCode: "DAILY",
      lookupValue: "Daily",
      description: "Daily cycle count",
      sortOrder: 1,
    });

    const weeklyCycleCountTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "CycleCountType",
      lookupCode: "WEEKLY",
      lookupValue: "Weekly",
      description: "Weekly cycle count",
      sortOrder: 2,
    });

    // Batch Status types
    const batchActiveStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "BatchStatus",
      lookupCode: "ACTIVE",
      lookupValue: "Active",
      description: "Batch is active and available",
      sortOrder: 1,
    });

    const batchReservedStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "BatchStatus",
      lookupCode: "RESERVED",
      lookupValue: "Reserved",
      description: "Batch is reserved for an order",
      sortOrder: 2,
    });

    const batchExpiredStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "BatchStatus",
      lookupCode: "EXPIRED",
      lookupValue: "Expired",
      description: "Batch has expired",
      sortOrder: 3,
    });

    // Serial Number Status types
    const serialAvailableStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "SerialStatus",
      lookupCode: "AVAILABLE",
      lookupValue: "Available",
      description: "Serial number is available",
      sortOrder: 1,
    });

    const serialSoldStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "SerialStatus",
      lookupCode: "SOLD",
      lookupValue: "Sold",
      description: "Serial number has been sold",
      sortOrder: 2,
    });

    // Inventory Transaction Types
    const receiveTransactionTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "InventoryTransactionType",
      lookupCode: "RECEIVE",
      lookupValue: "Receive",
      description: "Inventory received from purchase order",
      sortOrder: 1,
    });

    const pickTransactionTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "InventoryTransactionType",
      lookupCode: "PICK",
      lookupValue: "Pick",
      description: "Inventory picked for outbound order",
      sortOrder: 2,
    });

    const adjustTransactionTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "InventoryTransactionType",
      lookupCode: "ADJUST",
      lookupValue: "Adjustment",
      description: "Inventory adjustment",
      sortOrder: 3,
    });

    const transferTransactionTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "InventoryTransactionType",
      lookupCode: "TRANSFER",
      lookupValue: "Transfer",
      description: "Inventory transferred between branches",
      sortOrder: 4,
    });

    // Adjustment Status types
    const adjustmentPendingStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "AdjustmentStatus",
      lookupCode: "PENDING",
      lookupValue: "Pending",
      description: "Adjustment is pending approval",
      sortOrder: 1,
    });

    const adjustmentApprovedStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "AdjustmentStatus",
      lookupCode: "APPROVED",
      lookupValue: "Approved",
      description: "Adjustment has been approved",
      sortOrder: 2,
    });

    const adjustmentRejectedStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "AdjustmentStatus",
      lookupCode: "REJECTED",
      lookupValue: "Rejected",
      description: "Adjustment has been rejected",
      sortOrder: 3,
    });

    // Adjustment Type lookups
    const quantityAdjustmentTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "AdjustmentType",
      lookupCode: "QUANTITY",
      lookupValue: "Quantity Adjustment",
      description: "Quantity adjustment type",
      sortOrder: 1,
    });

    const locationAdjustmentTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "AdjustmentType",
      lookupCode: "LOCATION",
      lookupValue: "Location Adjustment",
      description: "Location adjustment type",
      sortOrder: 2,
    });

    // Adjustment Reason types
    const damagedReasonTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "AdjustmentReason",
      lookupCode: "DAMAGED",
      lookupValue: "Damaged",
      description: "Item was damaged",
      sortOrder: 1,
    });

    const countDiscrepancyReasonTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "AdjustmentReason",
      lookupCode: "COUNT_DISCREPANCY",
      lookupValue: "Count Discrepancy",
      description: "Count discrepancy found during cycle count",
      sortOrder: 2,
    });

    const expiredReasonTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "AdjustmentReason",
      lookupCode: "EXPIRED",
      lookupValue: "Expired",
      description: "Item has expired",
      sortOrder: 3,
    });

    // Return Status types
    const returnPendingStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "ReturnStatus",
      lookupCode: "PENDING",
      lookupValue: "Pending",
      description: "Return request is pending",
      sortOrder: 1,
    });

    const returnApprovedStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "ReturnStatus",
      lookupCode: "APPROVED",
      lookupValue: "Approved",
      description: "Return request has been approved",
      sortOrder: 2,
    });

    const returnCompletedStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "ReturnStatus",
      lookupCode: "COMPLETED",
      lookupValue: "Completed",
      description: "Return has been completed",
      sortOrder: 3,
    });

    // Return Reason types
    const defectiveReturnReasonId = await ctx.db.insert("system_lookups", {
      lookupType: "ReturnReason",
      lookupCode: "DEFECTIVE",
      lookupValue: "Defective",
      description: "Product is defective",
      sortOrder: 1,
    });

    const wrongItemReturnReasonId = await ctx.db.insert("system_lookups", {
      lookupType: "ReturnReason",
      lookupCode: "WRONG_ITEM",
      lookupValue: "Wrong Item",
      description: "Wrong item was received",
      sortOrder: 2,
    });

    // Receive Session Status types
    const receiveSessionPendingStatusId = await ctx.db.insert(
      "system_lookups",
      {
        lookupType: "ReceiveSessionStatus",
        lookupCode: "PENDING",
        lookupValue: "Pending",
        description: "Receive session is pending",
        sortOrder: 1,
      }
    );

    const receiveSessionInProgressStatusId = await ctx.db.insert(
      "system_lookups",
      {
        lookupType: "ReceiveSessionStatus",
        lookupCode: "IN_PROGRESS",
        lookupValue: "In Progress",
        description: "Receive session is in progress",
        sortOrder: 2,
      }
    );

    const receiveSessionCompleteStatusId = await ctx.db.insert(
      "system_lookups",
      {
        lookupType: "ReceiveSessionStatus",
        lookupCode: "COMPLETE",
        lookupValue: "Complete",
        description: "Receive session is complete",
        sortOrder: 3,
      }
    );

    // Receive Session Item Status types
    const receiveItemPendingStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "ReceiveSessionItemStatus",
      lookupCode: "PENDING",
      lookupValue: "Pending",
      description: "Item is pending receiving",
      sortOrder: 1,
    });

    const receiveItemPartialStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "ReceiveSessionItemStatus",
      lookupCode: "PARTIAL",
      lookupValue: "Partial",
      description: "Item is partially received",
      sortOrder: 2,
    });

    const receiveItemCompleteStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "ReceiveSessionItemStatus",
      lookupCode: "COMPLETE",
      lookupValue: "Complete",
      description: "Item is fully received",
      sortOrder: 3,
    });

    const receiveItemReturnRequestedStatusId = await ctx.db.insert(
      "system_lookups",
      {
        lookupType: "ReceiveSessionItemStatus",
        lookupCode: "RETURN_REQUESTED",
        lookupValue: "Return Requested",
        description: "Return has been requested for this item",
        sortOrder: 4,
      }
    );

    // Invitation Status types
    const invitationPendingStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "InvitationStatus",
      lookupCode: "PENDING",
      lookupValue: "Pending",
      description: "Invitation is pending",
      sortOrder: 1,
    });

    const invitationAcceptedStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "InvitationStatus",
      lookupCode: "ACCEPTED",
      lookupValue: "Accepted",
      description: "Invitation has been accepted",
      sortOrder: 2,
    });

    const invitationExpiredStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "InvitationStatus",
      lookupCode: "EXPIRED",
      lookupValue: "Expired",
      description: "Invitation has expired",
      sortOrder: 3,
    });

    // Assignment Status types
    const assignmentActiveStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "AssignmentStatus",
      lookupCode: "ACTIVE",
      lookupValue: "Active",
      description: "Assignment is active",
      sortOrder: 1,
    });

    const assignmentInactiveStatusId = await ctx.db.insert("system_lookups", {
      lookupType: "AssignmentStatus",
      lookupCode: "INACTIVE",
      lookupValue: "Inactive",
      description: "Assignment is inactive",
      sortOrder: 2,
    });

    // Zone Type lookups
    const receivingZoneTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "ZoneType",
      lookupCode: "RECEIVING",
      lookupValue: "Receiving",
      description: "Receiving zone for inbound goods",
      sortOrder: 1,
    });

    const storageZoneTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "ZoneType",
      lookupCode: "STORAGE",
      lookupValue: "Storage",
      description: "Main storage zone",
      sortOrder: 2,
    });

    const pickingZoneTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "ZoneType",
      lookupCode: "PICKING",
      lookupValue: "Picking",
      description: "Picking zone for order fulfillment",
      sortOrder: 3,
    });

    const shippingZoneTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "ZoneType",
      lookupCode: "SHIPPING",
      lookupValue: "Shipping",
      description: "Shipping zone for outbound orders",
      sortOrder: 4,
    });

    // Notification Category types
    const alertNotificationCategoryId = await ctx.db.insert("system_lookups", {
      lookupType: "NotificationCategory",
      lookupCode: "ALERT",
      lookupValue: "Alert",
      description: "Important alert notifications",
      sortOrder: 1,
    });

    const infoNotificationCategoryId = await ctx.db.insert("system_lookups", {
      lookupType: "NotificationCategory",
      lookupCode: "INFO",
      lookupValue: "Information",
      description: "Informational notifications",
      sortOrder: 2,
    });

    const reminderNotificationCategoryId = await ctx.db.insert(
      "system_lookups",
      {
        lookupType: "NotificationCategory",
        lookupCode: "REMINDER",
        lookupValue: "Reminder",
        description: "Reminder notifications",
        sortOrder: 3,
      }
    );

    // Priority types
    const lowPriorityTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "Priority",
      lookupCode: "LOW",
      lookupValue: "Low",
      description: "Low priority",
      sortOrder: 1,
    });

    const mediumPriorityTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "Priority",
      lookupCode: "MEDIUM",
      lookupValue: "Medium",
      description: "Medium priority",
      sortOrder: 2,
    });

    const highPriorityTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "Priority",
      lookupCode: "HIGH",
      lookupValue: "High",
      description: "High priority",
      sortOrder: 3,
    });

    // Forecast Type lookups
    const demandForecastTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "ForecastType",
      lookupCode: "DEMAND",
      lookupValue: "Demand Forecast",
      description: "Demand forecast type",
      sortOrder: 1,
    });

    const seasonalForecastTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "ForecastType",
      lookupCode: "SEASONAL",
      lookupValue: "Seasonal Forecast",
      description: "Seasonal forecast type",
      sortOrder: 2,
    });

    // Sharing Scope types
    const privateShareScopeId = await ctx.db.insert("system_lookups", {
      lookupType: "SharingScope",
      lookupCode: "PRIVATE",
      lookupValue: "Private",
      description: "Private - visible only to owner",
      sortOrder: 1,
    });

    const organizationShareScopeId = await ctx.db.insert("system_lookups", {
      lookupType: "SharingScope",
      lookupCode: "ORGANIZATION",
      lookupValue: "Organization",
      description: "Visible to entire organization",
      sortOrder: 2,
    });

    // Audit Action types
    const createActionTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "AuditAction",
      lookupCode: "CREATE",
      lookupValue: "Create",
      description: "Record created",
      sortOrder: 1,
    });

    const updateActionTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "AuditAction",
      lookupCode: "UPDATE",
      lookupValue: "Update",
      description: "Record updated",
      sortOrder: 2,
    });

    const deleteActionTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "AuditAction",
      lookupCode: "DELETE",
      lookupValue: "Delete",
      description: "Record deleted",
      sortOrder: 3,
    });

    // Barcode Type lookups
    const ean13BarcodeTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "BarcodeType",
      lookupCode: "EAN13",
      lookupValue: "EAN-13",
      description: "EAN-13 barcode format",
      sortOrder: 1,
    });

    const qrBarcodeTypeId = await ctx.db.insert("system_lookups", {
      lookupType: "BarcodeType",
      lookupCode: "QR",
      lookupValue: "QR Code",
      description: "QR code format",
      sortOrder: 2,
    });

    // Unit of Measure types
    const unitPieceId = await ctx.db.insert("system_lookups", {
      lookupType: "UnitOfMeasure",
      lookupCode: "PCS",
      lookupValue: "Piece",
      description: "Individual piece/unit",
      sortOrder: 1,
    });

    const unitBoxId = await ctx.db.insert("system_lookups", {
      lookupType: "UnitOfMeasure",
      lookupCode: "BOX",
      lookupValue: "Box",
      description: "Box/carton unit",
      sortOrder: 2,
    });

    const unitKgId = await ctx.db.insert("system_lookups", {
      lookupType: "UnitOfMeasure",
      lookupCode: "KG",
      lookupValue: "Kilogram",
      description: "Weight in kilograms",
      sortOrder: 3,
    });

    // Storage Requirement types
    const normalStorageId = await ctx.db.insert("system_lookups", {
      lookupType: "StorageRequirement",
      lookupCode: "NORMAL",
      lookupValue: "Normal",
      description: "Standard storage conditions",
      sortOrder: 1,
    });

    const coldStorageId = await ctx.db.insert("system_lookups", {
      lookupType: "StorageRequirement",
      lookupCode: "COLD",
      lookupValue: "Cold Storage",
      description: "Refrigerated storage required",
      sortOrder: 2,
    });

    const freezerStorageId = await ctx.db.insert("system_lookups", {
      lookupType: "StorageRequirement",
      lookupCode: "FREEZER",
      lookupValue: "Freezer",
      description: "Frozen storage required",
      sortOrder: 3,
    });

    // Tracking Method types
    const fifoTrackingId = await ctx.db.insert("system_lookups", {
      lookupType: "TrackingMethod",
      lookupCode: "FIFO",
      lookupValue: "FIFO",
      description: "First In First Out tracking",
      sortOrder: 1,
    });

    const fefoTrackingId = await ctx.db.insert("system_lookups", {
      lookupType: "TrackingMethod",
      lookupCode: "FEFO",
      lookupValue: "FEFO",
      description: "First Expired First Out tracking",
      sortOrder: 2,
    });

    const serialTrackingId = await ctx.db.insert("system_lookups", {
      lookupType: "TrackingMethod",
      lookupCode: "SERIAL",
      lookupValue: "Serial Number",
      description: "Serial number tracking",
      sortOrder: 3,
    });

    // ================================================================
    // 2. ORGANIZATIONS
    // ================================================================

    const organizationId = await ctx.db.insert("organizations", {
      name: "Test Warehouse Corp",
      address: "123 Warehouse Street, District 1, Ho Chi Minh City",
      contactInfo: {
        phone: "+84 28 1234 5678",
        email: "contact@testwarehouse.com",
      },
      isActive: true,
      isDeleted: false,
    });

    const organization2Id = await ctx.db.insert("organizations", {
      name: "Secondary Distribution Inc",
      address: "456 Logistics Avenue, District 7, Ho Chi Minh City",
      contactInfo: {
        phone: "+84 28 9876 5432",
        email: "info@secondarydist.com",
      },
      isActive: true,
      isDeleted: false,
    });

    // Organization Settings
    await ctx.db.insert("organization_settings", {
      organizationId,
      settingKey: "default_currency",
      settingValue: { currency: "VND", symbol: "₫" },
    });

    await ctx.db.insert("organization_settings", {
      organizationId,
      settingKey: "timezone",
      settingValue: { timezone: "Asia/Ho_Chi_Minh", offset: "+07:00" },
    });

    await ctx.db.insert("organization_settings", {
      organizationId,
      settingKey: "inventory_settings",
      settingValue: {
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        autoReorderEnabled: true,
      },
    });

    // ================================================================
    // 3. BRANCHES
    // ================================================================

    const branchId = await ctx.db.insert("branches", {
      organizationId,
      name: "Main Warehouse Branch",
      address: "456 Storage Road, District 7, Ho Chi Minh City",
      phoneNumber: "+84 28 8765 4321",
      isActive: true,
      isDeleted: false,
    });

    const branch2Id = await ctx.db.insert("branches", {
      organizationId,
      name: "Secondary Branch",
      address: "789 Logistics Ave, District 2, Ho Chi Minh City",
      phoneNumber: "+84 28 1111 2222",
      isActive: true,
      isDeleted: false,
    });

    const branch3Id = await ctx.db.insert("branches", {
      organizationId,
      name: "North Distribution Center",
      address: "321 Industrial Park, Binh Duong Province",
      phoneNumber: "+84 274 3333 4444",
      isActive: true,
      isDeleted: false,
    });

    // Branch Settings
    await ctx.db.insert("branch_settings", {
      branchId,
      settingKey: "working_hours",
      settingValue: {
        start: "08:00",
        end: "18:00",
        workDays: [1, 2, 3, 4, 5, 6],
      },
    });

    await ctx.db.insert("branch_settings", {
      branchId,
      settingKey: "receiving_dock_count",
      settingValue: { docks: 5, maxCapacity: 20 },
    });

    await ctx.db.insert("branch_settings", {
      branchId: branch2Id,
      settingKey: "working_hours",
      settingValue: { start: "07:00", end: "19:00", workDays: [1, 2, 3, 4, 5] },
    });

    // ================================================================
    // 4. USERS
    // ================================================================

    const userId = await ctx.db.insert("users", {
      organizationId,
      username: "testuser",
      passwordHash: "hashed_password_placeholder",
      fullName: "Test User",
      email: "testuser@testwarehouse.com",
      isActive: true,
      preferences: { theme: "light", language: "en" },
      isDeleted: false,
    });

    const adminUserId = await ctx.db.insert("users", {
      organizationId,
      username: "admin",
      passwordHash: "hashed_password_placeholder",
      fullName: "Admin User",
      email: "admin@testwarehouse.com",
      isActive: true,
      preferences: { theme: "dark", language: "vi" },
      isDeleted: false,
    });

    const managerUserId = await ctx.db.insert("users", {
      organizationId,
      username: "manager",
      passwordHash: "hashed_password_placeholder",
      fullName: "Warehouse Manager",
      email: "manager@testwarehouse.com",
      isActive: true,
      preferences: { theme: "light", language: "vi" },
      isDeleted: false,
    });

    const receiverUserId = await ctx.db.insert("users", {
      organizationId,
      username: "receiver",
      passwordHash: "hashed_password_placeholder",
      fullName: "Goods Receiver",
      email: "receiver@testwarehouse.com",
      isActive: true,
      preferences: { theme: "light", language: "en" },
      isDeleted: false,
    });

    const pickerUserId = await ctx.db.insert("users", {
      organizationId,
      username: "picker",
      passwordHash: "hashed_password_placeholder",
      fullName: "Order Picker",
      email: "picker@testwarehouse.com",
      isActive: true,
      preferences: { theme: "light", language: "en" },
      isDeleted: false,
    });

    const auditorUserId = await ctx.db.insert("users", {
      organizationId,
      username: "auditor",
      passwordHash: "hashed_password_placeholder",
      fullName: "Inventory Auditor",
      email: "auditor@testwarehouse.com",
      isActive: true,
      preferences: { theme: "system", language: "en" },
      isDeleted: false,
    });

    // ================================================================
    // 5. ROLES & PERMISSIONS
    // ================================================================

    const adminRoleId = await ctx.db.insert("roles", {
      organizationId,
      name: "Administrator",
      description: "Full system access with all permissions",
      isSystemDefault: true,
    });

    const managerRoleId = await ctx.db.insert("roles", {
      organizationId,
      name: "Warehouse Manager",
      description: "Manage warehouse operations and staff",
      isSystemDefault: true,
    });

    const receiverRoleId = await ctx.db.insert("roles", {
      organizationId,
      name: "Receiver",
      description: "Handle inbound goods receiving",
      isSystemDefault: true,
    });

    const pickerRoleId = await ctx.db.insert("roles", {
      organizationId,
      name: "Picker",
      description: "Pick and pack orders for shipping",
      isSystemDefault: true,
    });

    const auditorRoleId = await ctx.db.insert("roles", {
      organizationId,
      name: "Auditor",
      description: "Perform inventory audits and cycle counts",
      isSystemDefault: false,
    });

    const viewerRoleId = await ctx.db.insert("roles", {
      organizationId,
      name: "Viewer",
      description: "Read-only access to warehouse data",
      isSystemDefault: false,
    });

    // Role Permissions
    await ctx.db.insert("role_permissions", {
      roleId: adminRoleId,
      permissionCategory: "inventory",
      permissionBits: 0xffffffff, // All permissions
      scopeType: "organization",
    });

    await ctx.db.insert("role_permissions", {
      roleId: adminRoleId,
      permissionCategory: "orders",
      permissionBits: 0xffffffff,
      scopeType: "organization",
    });

    await ctx.db.insert("role_permissions", {
      roleId: adminRoleId,
      permissionCategory: "users",
      permissionBits: 0xffffffff,
      scopeType: "organization",
    });

    await ctx.db.insert("role_permissions", {
      roleId: managerRoleId,
      permissionCategory: "inventory",
      permissionBits: 0x0f, // Read, write, update
      scopeType: "branch",
    });

    await ctx.db.insert("role_permissions", {
      roleId: managerRoleId,
      permissionCategory: "orders",
      permissionBits: 0x0f,
      scopeType: "branch",
    });

    await ctx.db.insert("role_permissions", {
      roleId: receiverRoleId,
      permissionCategory: "receiving",
      permissionBits: 0x07, // Read, write, update
      scopeType: "branch",
    });

    await ctx.db.insert("role_permissions", {
      roleId: pickerRoleId,
      permissionCategory: "picking",
      permissionBits: 0x07,
      scopeType: "branch",
    });

    await ctx.db.insert("role_permissions", {
      roleId: auditorRoleId,
      permissionCategory: "inventory",
      permissionBits: 0x03, // Read, write
      scopeType: "branch",
    });

    await ctx.db.insert("role_permissions", {
      roleId: viewerRoleId,
      permissionCategory: "inventory",
      permissionBits: 0x01, // Read only
      scopeType: "branch",
    });

    // User Role Assignments
    await ctx.db.insert("user_role_assignments", {
      userId: adminUserId,
      roleId: adminRoleId,
      assignedAt: now,
    });

    await ctx.db.insert("user_role_assignments", {
      userId: managerUserId,
      roleId: managerRoleId,
      branchId,
      assignedAt: now,
    });

    await ctx.db.insert("user_role_assignments", {
      userId: receiverUserId,
      roleId: receiverRoleId,
      branchId,
      assignedAt: now,
    });

    await ctx.db.insert("user_role_assignments", {
      userId: pickerUserId,
      roleId: pickerRoleId,
      branchId,
      assignedAt: now,
    });

    await ctx.db.insert("user_role_assignments", {
      userId: auditorUserId,
      roleId: auditorRoleId,
      branchId,
      assignedAt: now,
    });

    await ctx.db.insert("user_role_assignments", {
      userId,
      roleId: viewerRoleId,
      branchId,
      assignedAt: now,
    });

    // User Branch Assignments
    await ctx.db.insert("user_branch_assignments", {
      userId: managerUserId,
      branchId,
      assignmentStatusTypeId: assignmentActiveStatusId,
      assignedAt: now,
    });

    await ctx.db.insert("user_branch_assignments", {
      userId: receiverUserId,
      branchId,
      assignmentStatusTypeId: assignmentActiveStatusId,
      assignedAt: now,
    });

    await ctx.db.insert("user_branch_assignments", {
      userId: pickerUserId,
      branchId,
      assignmentStatusTypeId: assignmentActiveStatusId,
      assignedAt: now,
    });

    await ctx.db.insert("user_branch_assignments", {
      userId: auditorUserId,
      branchId,
      assignmentStatusTypeId: assignmentActiveStatusId,
      assignedAt: now,
    });

    await ctx.db.insert("user_branch_assignments", {
      userId: managerUserId,
      branchId: branch2Id,
      assignmentStatusTypeId: assignmentActiveStatusId,
      assignedAt: now,
    });

    // Workspace Invitations
    const invitationId = await ctx.db.insert("workspace_invitations", {
      organizationId,
      invitationCode: "INV-2026-001",
      createdByUserId: adminUserId,
      expiresAt: now + oneWeek,
      statusTypeId: invitationPendingStatusId,
    });

    await ctx.db.insert("workspace_invitations", {
      organizationId,
      invitationCode: "INV-2026-002",
      createdByUserId: adminUserId,
      expiresAt: now + oneWeek * 2,
      statusTypeId: invitationPendingStatusId,
    });

    // ================================================================
    // 6. BRANDS
    // ================================================================

    const brand1Id = await ctx.db.insert("brands", {
      organizationId: organizationId as unknown as string,
      name: "TechGear Electronics",
      isActive: true,
    });

    const brand2Id = await ctx.db.insert("brands", {
      organizationId: organizationId as unknown as string,
      name: "HomeEssentials",
      isActive: true,
    });

    const brand3Id = await ctx.db.insert("brands", {
      organizationId: organizationId as unknown as string,
      name: "OfficeMax Pro",
      isActive: true,
    });

    const brand4Id = await ctx.db.insert("brands", {
      organizationId: organizationId as unknown as string,
      name: "SportZone",
      isActive: true,
    });

    const brand5Id = await ctx.db.insert("brands", {
      organizationId: organizationId as unknown as string,
      name: "FreshFoods Co",
      isActive: true,
    });

    // ================================================================
    // 7. CATEGORIES
    // ================================================================

    const electronicsCategory = await ctx.db.insert("categories", {
      organizationId,
      name: "Electronics",
      path: "electronics",
      isActive: true,
      isDeleted: false,
    });

    const computerPeripheralsCategory = await ctx.db.insert("categories", {
      organizationId,
      name: "Computer Peripherals",
      path: "electronics.peripherals",
      isActive: true,
      isDeleted: false,
    });

    const audioVideoCategory = await ctx.db.insert("categories", {
      organizationId,
      name: "Audio & Video",
      path: "electronics.audio_video",
      isActive: true,
      isDeleted: false,
    });

    const homeCategory = await ctx.db.insert("categories", {
      organizationId,
      name: "Home & Living",
      path: "home_living",
      isActive: true,
      isDeleted: false,
    });

    const furnitureCategory = await ctx.db.insert("categories", {
      organizationId,
      name: "Furniture",
      path: "home_living.furniture",
      isActive: true,
      isDeleted: false,
    });

    const lightingCategory = await ctx.db.insert("categories", {
      organizationId,
      name: "Lighting",
      path: "home_living.lighting",
      isActive: true,
      isDeleted: false,
    });

    const officeCategory = await ctx.db.insert("categories", {
      organizationId,
      name: "Office Supplies",
      path: "office",
      isActive: true,
      isDeleted: false,
    });

    const sportsCategory = await ctx.db.insert("categories", {
      organizationId,
      name: "Sports & Fitness",
      path: "sports",
      isActive: true,
      isDeleted: false,
    });

    const foodBeverageCategory = await ctx.db.insert("categories", {
      organizationId,
      name: "Food & Beverage",
      path: "food_beverage",
      isActive: true,
      isDeleted: false,
    });

    // Category Settings
    await ctx.db.insert("category_settings", {
      categoryId: electronicsCategory,
      settingKey: "requires_serial_tracking",
      settingValue: { enabled: true, format: "SKU-SERIAL" },
    });

    await ctx.db.insert("category_settings", {
      categoryId: foodBeverageCategory,
      settingKey: "expiry_tracking",
      settingValue: { enabled: true, warningDays: 30 },
    });

    // ================================================================
    // 8. PRODUCTS
    // ================================================================

    const product1Id = await ctx.db.insert("products", {
      organizationId,
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with USB receiver",
      categoryId: computerPeripheralsCategory,
      brandId: brand1Id,
      storageRequirementTypeId: normalStorageId,
      trackingMethodTypeId: fifoTrackingId,
      reorderPoint: 50,
      isActive: true,
      isDeleted: false,
    });

    const product2Id = await ctx.db.insert("products", {
      organizationId,
      name: "Mechanical Keyboard",
      description: "RGB mechanical keyboard with Cherry MX switches",
      categoryId: computerPeripheralsCategory,
      brandId: brand1Id,
      storageRequirementTypeId: normalStorageId,
      trackingMethodTypeId: fifoTrackingId,
      reorderPoint: 30,
      isActive: true,
      isDeleted: false,
    });

    const product3Id = await ctx.db.insert("products", {
      organizationId,
      name: "USB-C Hub",
      description: "7-in-1 USB-C hub with HDMI and SD card reader",
      categoryId: computerPeripheralsCategory,
      brandId: brand1Id,
      storageRequirementTypeId: normalStorageId,
      trackingMethodTypeId: fifoTrackingId,
      reorderPoint: 40,
      isActive: true,
      isDeleted: false,
    });

    const product4Id = await ctx.db.insert("products", {
      organizationId,
      name: "Desk Lamp",
      description: "LED desk lamp with adjustable brightness",
      categoryId: lightingCategory,
      brandId: brand2Id,
      storageRequirementTypeId: normalStorageId,
      trackingMethodTypeId: fifoTrackingId,
      reorderPoint: 25,
      isActive: true,
      isDeleted: false,
    });

    const product5Id = await ctx.db.insert("products", {
      organizationId,
      name: "Bluetooth Speaker",
      description: "Portable Bluetooth speaker with 20-hour battery life",
      categoryId: audioVideoCategory,
      brandId: brand1Id,
      storageRequirementTypeId: normalStorageId,
      trackingMethodTypeId: serialTrackingId,
      reorderPoint: 35,
      isActive: true,
      isDeleted: false,
    });

    const product6Id = await ctx.db.insert("products", {
      organizationId,
      name: "Office Chair",
      description: "Ergonomic office chair with lumbar support",
      categoryId: furnitureCategory,
      brandId: brand3Id,
      storageRequirementTypeId: normalStorageId,
      trackingMethodTypeId: fifoTrackingId,
      reorderPoint: 15,
      isActive: true,
      isDeleted: false,
    });

    const product7Id = await ctx.db.insert("products", {
      organizationId,
      name: "Yoga Mat",
      description: "Premium non-slip yoga mat 6mm thick",
      categoryId: sportsCategory,
      brandId: brand4Id,
      storageRequirementTypeId: normalStorageId,
      trackingMethodTypeId: fifoTrackingId,
      reorderPoint: 20,
      isActive: true,
      isDeleted: false,
    });

    const product8Id = await ctx.db.insert("products", {
      organizationId,
      name: "Protein Powder",
      description: "Whey protein powder 2kg chocolate flavor",
      categoryId: foodBeverageCategory,
      brandId: brand5Id,
      storageRequirementTypeId: normalStorageId,
      trackingMethodTypeId: fefoTrackingId,
      shelfLifeDays: 365,
      reorderPoint: 30,
      isActive: true,
      isDeleted: false,
    });

    const product9Id = await ctx.db.insert("products", {
      organizationId,
      name: "Standing Desk",
      description: "Electric height-adjustable standing desk 160cm",
      categoryId: furnitureCategory,
      brandId: brand3Id,
      storageRequirementTypeId: normalStorageId,
      trackingMethodTypeId: serialTrackingId,
      reorderPoint: 10,
      isActive: true,
      isDeleted: false,
    });

    const product10Id = await ctx.db.insert("products", {
      organizationId,
      name: "Webcam HD",
      description: "1080p HD webcam with built-in microphone",
      categoryId: computerPeripheralsCategory,
      brandId: brand1Id,
      storageRequirementTypeId: normalStorageId,
      trackingMethodTypeId: fifoTrackingId,
      reorderPoint: 45,
      isActive: true,
      isDeleted: false,
    });

    // Product Type Templates
    await ctx.db.insert("product_type_templates", {
      organizationId,
      templateName: "Electronics Template",
      fieldDefinitions: {
        fields: [
          { name: "warranty_months", type: "number", required: true },
          { name: "voltage", type: "string", required: false },
          { name: "power_consumption", type: "string", required: false },
        ],
      },
    });

    await ctx.db.insert("product_type_templates", {
      organizationId,
      templateName: "Food Product Template",
      fieldDefinitions: {
        fields: [
          { name: "allergens", type: "array", required: true },
          { name: "nutritional_info", type: "object", required: true },
          { name: "storage_temperature", type: "string", required: true },
        ],
      },
    });

    // ================================================================
    // 9. PRODUCT VARIANTS (SKUs)
    // ================================================================

    const variant1Id = await ctx.db.insert("product_variants", {
      productId: product1Id,
      skuCode: "WM-BLK-001",
      description: "Wireless Mouse - Black",
      costPrice: 15.0,
      sellingPrice: 29.99,
      unitOfMeasureId: unitPieceId,
      weightKg: 0.1,
      temperatureSensitive: false,
      isActive: true,
      isDeleted: false,
    });

    const variant2Id = await ctx.db.insert("product_variants", {
      productId: product1Id,
      skuCode: "WM-WHT-001",
      description: "Wireless Mouse - White",
      costPrice: 15.0,
      sellingPrice: 29.99,
      unitOfMeasureId: unitPieceId,
      weightKg: 0.1,
      temperatureSensitive: false,
      isActive: true,
      isDeleted: false,
    });

    const variant3Id = await ctx.db.insert("product_variants", {
      productId: product2Id,
      skuCode: "KB-RGB-001",
      description: "Mechanical Keyboard - RGB",
      costPrice: 45.0,
      sellingPrice: 89.99,
      unitOfMeasureId: unitPieceId,
      weightKg: 0.8,
      temperatureSensitive: false,
      isActive: true,
      isDeleted: false,
    });

    const variant4Id = await ctx.db.insert("product_variants", {
      productId: product3Id,
      skuCode: "HUB-7IN1-001",
      description: "USB-C Hub 7-in-1",
      costPrice: 25.0,
      sellingPrice: 49.99,
      unitOfMeasureId: unitPieceId,
      weightKg: 0.15,
      temperatureSensitive: false,
      isActive: true,
      isDeleted: false,
    });

    const variant5Id = await ctx.db.insert("product_variants", {
      productId: product4Id,
      skuCode: "LAMP-LED-001",
      description: "LED Desk Lamp - White",
      costPrice: 18.0,
      sellingPrice: 39.99,
      unitOfMeasureId: unitPieceId,
      weightKg: 0.5,
      temperatureSensitive: false,
      isActive: true,
      isDeleted: false,
    });

    const variant6Id = await ctx.db.insert("product_variants", {
      productId: product5Id,
      skuCode: "SPK-BT-001",
      description: "Bluetooth Speaker - Black",
      costPrice: 35.0,
      sellingPrice: 69.99,
      unitOfMeasureId: unitPieceId,
      weightKg: 0.4,
      temperatureSensitive: false,
      customFields: { color: "black", waterResistant: true },
      isActive: true,
      isDeleted: false,
    });

    const variant7Id = await ctx.db.insert("product_variants", {
      productId: product6Id,
      skuCode: "CHAIR-ERG-001",
      description: "Ergonomic Office Chair - Black",
      costPrice: 120.0,
      sellingPrice: 249.99,
      unitOfMeasureId: unitPieceId,
      weightKg: 15.0,
      volumeM3: 0.5,
      temperatureSensitive: false,
      isActive: true,
      isDeleted: false,
    });

    const variant8Id = await ctx.db.insert("product_variants", {
      productId: product7Id,
      skuCode: "YOGA-MAT-001",
      description: "Yoga Mat - Purple 6mm",
      costPrice: 12.0,
      sellingPrice: 29.99,
      unitOfMeasureId: unitPieceId,
      weightKg: 1.2,
      temperatureSensitive: false,
      isActive: true,
      isDeleted: false,
    });

    const variant9Id = await ctx.db.insert("product_variants", {
      productId: product8Id,
      skuCode: "PROT-CHO-2KG",
      description: "Protein Powder Chocolate 2kg",
      costPrice: 25.0,
      sellingPrice: 49.99,
      unitOfMeasureId: unitKgId,
      weightKg: 2.0,
      temperatureSensitive: false,
      customFields: { flavor: "chocolate", servings: 66 },
      isActive: true,
      isDeleted: false,
    });

    const variant10Id = await ctx.db.insert("product_variants", {
      productId: product9Id,
      skuCode: "DESK-STD-160",
      description: "Standing Desk 160cm - White",
      costPrice: 250.0,
      sellingPrice: 499.99,
      unitOfMeasureId: unitPieceId,
      weightKg: 35.0,
      volumeM3: 0.8,
      temperatureSensitive: false,
      customFields: { heightRange: "70-120cm", motorType: "dual" },
      isActive: true,
      isDeleted: false,
    });

    const variant11Id = await ctx.db.insert("product_variants", {
      productId: product10Id,
      skuCode: "CAM-HD-1080",
      description: "Webcam HD 1080p",
      costPrice: 30.0,
      sellingPrice: 59.99,
      unitOfMeasureId: unitPieceId,
      weightKg: 0.2,
      temperatureSensitive: false,
      isActive: true,
      isDeleted: false,
    });

    // Product Barcodes
    await ctx.db.insert("product_barcodes", {
      skuId: variant1Id,
      barcodeTypeId: ean13BarcodeTypeId,
      barcodeValue: "5901234123457",
    });

    await ctx.db.insert("product_barcodes", {
      skuId: variant2Id,
      barcodeTypeId: ean13BarcodeTypeId,
      barcodeValue: "5901234123464",
    });

    await ctx.db.insert("product_barcodes", {
      skuId: variant3Id,
      barcodeTypeId: ean13BarcodeTypeId,
      barcodeValue: "5901234123471",
    });

    await ctx.db.insert("product_barcodes", {
      skuId: variant4Id,
      barcodeTypeId: qrBarcodeTypeId,
      barcodeValue: "HUB7IN1001QR",
    });

    await ctx.db.insert("product_barcodes", {
      skuId: variant6Id,
      barcodeTypeId: ean13BarcodeTypeId,
      barcodeValue: "5901234123488",
    });

    // ================================================================
    // 10. SUPPLIERS
    // ================================================================

    const supplier1Id = await ctx.db.insert("suppliers", {
      organizationId,
      brandId: brand1Id,
      name: "TechGear Vietnam Supplier",
      contactPerson: "Nguyen Van A",
      email: "supplier@techgear.vn",
      phone: "+84 909 123 456",
      defaultLeadTimeDays: 7,
      isActive: true,
      isDeleted: false,
    });

    const supplier2Id = await ctx.db.insert("suppliers", {
      organizationId,
      brandId: brand2Id,
      name: "HomeEssentials Distribution",
      contactPerson: "Tran Thi B",
      email: "orders@homeessentials.vn",
      phone: "+84 908 654 321",
      defaultLeadTimeDays: 5,
      isActive: true,
      isDeleted: false,
    });

    const supplier3Id = await ctx.db.insert("suppliers", {
      organizationId,
      brandId: brand3Id,
      name: "Office Furniture Direct",
      contactPerson: "Le Van C",
      email: "sales@officedirect.vn",
      phone: "+84 907 111 222",
      defaultLeadTimeDays: 14,
      isActive: true,
      isDeleted: false,
    });

    const supplier4Id = await ctx.db.insert("suppliers", {
      organizationId,
      brandId: brand4Id,
      name: "SportZone Wholesale",
      contactPerson: "Pham Thi D",
      email: "wholesale@sportzone.vn",
      phone: "+84 906 333 444",
      defaultLeadTimeDays: 10,
      isActive: true,
      isDeleted: false,
    });

    const supplier5Id = await ctx.db.insert("suppliers", {
      organizationId,
      brandId: brand5Id,
      name: "FreshFoods Distributor",
      contactPerson: "Hoang Van E",
      email: "orders@freshfoods.vn",
      phone: "+84 905 555 666",
      defaultLeadTimeDays: 3,
      isActive: true,
      isDeleted: false,
    });

    // ================================================================
    // 11. STORAGE ZONES
    // ================================================================

    const receivingZone1Id = await ctx.db.insert("storage_zones", {
      branchId,
      name: "Receiving Dock A",
      path: "receiving.dock_a",
      zoneTypeId: receivingZoneTypeId,
      storageBlockType: "FLOOR",
      zoneAttributes: { capacity: 100, temperatureControlled: false },
      isDeleted: false,
    });

    const receivingZone2Id = await ctx.db.insert("storage_zones", {
      branchId,
      name: "Receiving Dock B",
      path: "receiving.dock_b",
      zoneTypeId: receivingZoneTypeId,
      storageBlockType: "FLOOR",
      zoneAttributes: { capacity: 80, temperatureControlled: false },
      isDeleted: false,
    });

    const storageZone1Id = await ctx.db.insert("storage_zones", {
      branchId,
      name: "General Storage A",
      path: "storage.general_a",
      zoneTypeId: storageZoneTypeId,
      storageBlockType: "RACK",
      zoneAttributes: {
        capacity: 500,
        temperatureControlled: false,
        rackLevels: 5,
        aisles: 10,
      },
      isDeleted: false,
    });

    const storageZone2Id = await ctx.db.insert("storage_zones", {
      branchId,
      name: "General Storage B",
      path: "storage.general_b",
      zoneTypeId: storageZoneTypeId,
      storageBlockType: "RACK",
      zoneAttributes: {
        capacity: 400,
        temperatureControlled: false,
        rackLevels: 4,
        aisles: 8,
      },
      isDeleted: false,
    });

    const storageZone3Id = await ctx.db.insert("storage_zones", {
      branchId,
      name: "High Value Storage",
      path: "storage.high_value",
      zoneTypeId: storageZoneTypeId,
      storageBlockType: "SECURE_RACK",
      zoneAttributes: {
        capacity: 100,
        temperatureControlled: false,
        securityLevel: "high",
      },
      isDeleted: false,
    });

    const pickingZone1Id = await ctx.db.insert("storage_zones", {
      branchId,
      name: "Picking Zone A",
      path: "picking.zone_a",
      zoneTypeId: pickingZoneTypeId,
      storageBlockType: "FLOW_RACK",
      zoneAttributes: { capacity: 200, pickFaces: 100 },
      isDeleted: false,
    });

    const pickingZone2Id = await ctx.db.insert("storage_zones", {
      branchId,
      name: "Picking Zone B",
      path: "picking.zone_b",
      zoneTypeId: pickingZoneTypeId,
      storageBlockType: "FLOW_RACK",
      zoneAttributes: { capacity: 150, pickFaces: 75 },
      isDeleted: false,
    });

    const shippingZone1Id = await ctx.db.insert("storage_zones", {
      branchId,
      name: "Shipping Dock 1",
      path: "shipping.dock_1",
      zoneTypeId: shippingZoneTypeId,
      storageBlockType: "FLOOR",
      zoneAttributes: { capacity: 50, dockDoors: 3 },
      isDeleted: false,
    });

    const shippingZone2Id = await ctx.db.insert("storage_zones", {
      branchId,
      name: "Shipping Dock 2",
      path: "shipping.dock_2",
      zoneTypeId: shippingZoneTypeId,
      storageBlockType: "FLOOR",
      zoneAttributes: { capacity: 40, dockDoors: 2 },
      isDeleted: false,
    });

    // Storage zones for branch 2
    const branch2StorageZoneId = await ctx.db.insert("storage_zones", {
      branchId: branch2Id,
      name: "Branch 2 Main Storage",
      path: "storage.main",
      zoneTypeId: storageZoneTypeId,
      storageBlockType: "RACK",
      zoneAttributes: { capacity: 300, rackLevels: 4 },
      isDeleted: false,
    });

    // ================================================================
    // 12. PURCHASE ORDERS
    // ================================================================

    const purchaseOrder1Id = await ctx.db.insert("purchase_orders", {
      organizationId,
      branchId,
      code: "PO-2026-001",
      supplierId: supplier1Id,
      orderedAt: now - oneWeek,
      expectedDeliveryAt: now + oneDay * 3,
      createdByUserId: managerUserId,
      purchaseOrderStatusTypeId: approvedStatusId,
      isDeleted: false,
    });

    const purchaseOrder2Id = await ctx.db.insert("purchase_orders", {
      organizationId,
      branchId,
      code: "PO-2026-002",
      supplierId: supplier2Id,
      orderedAt: now - oneDay * 3,
      expectedDeliveryAt: now + oneDay * 5,
      createdByUserId: managerUserId,
      purchaseOrderStatusTypeId: pendingStatusId,
      isDeleted: false,
    });

    const purchaseOrder3Id = await ctx.db.insert("purchase_orders", {
      organizationId,
      branchId,
      code: "PO-2026-003",
      supplierId: supplier3Id,
      orderedAt: now - oneWeek * 2,
      expectedDeliveryAt: now - oneDay * 3,
      createdByUserId: adminUserId,
      purchaseOrderStatusTypeId: receivedStatusId,
      isDeleted: false,
    });

    const purchaseOrder4Id = await ctx.db.insert("purchase_orders", {
      organizationId,
      branchId: branch2Id,
      code: "PO-2026-004",
      supplierId: supplier1Id,
      orderedAt: now - oneDay * 5,
      expectedDeliveryAt: now + oneDay * 2,
      createdByUserId: managerUserId,
      purchaseOrderStatusTypeId: approvedStatusId,
      isDeleted: false,
    });

    const purchaseOrder5Id = await ctx.db.insert("purchase_orders", {
      organizationId,
      branchId,
      code: "PO-2026-005",
      supplierId: supplier5Id,
      orderedAt: now - oneWeek * 3,
      createdByUserId: adminUserId,
      purchaseOrderStatusTypeId: cancelledStatusId,
      isDeleted: false,
    });

    // Purchase Order Details
    const poDetail1Id = await ctx.db.insert("purchase_order_details", {
      purchaseOrderId: purchaseOrder1Id,
      skuId: variant1Id,
      quantityOrdered: 100,
      unitCost: 15.0,
      quantityReceived: 0,
    });

    const poDetail2Id = await ctx.db.insert("purchase_order_details", {
      purchaseOrderId: purchaseOrder1Id,
      skuId: variant3Id,
      quantityOrdered: 50,
      unitCost: 45.0,
      quantityReceived: 0,
    });

    await ctx.db.insert("purchase_order_details", {
      purchaseOrderId: purchaseOrder2Id,
      skuId: variant5Id,
      quantityOrdered: 75,
      unitCost: 18.0,
      quantityReceived: 0,
    });

    await ctx.db.insert("purchase_order_details", {
      purchaseOrderId: purchaseOrder3Id,
      skuId: variant7Id,
      quantityOrdered: 20,
      unitCost: 120.0,
      quantityReceived: 20,
    });

    await ctx.db.insert("purchase_order_details", {
      purchaseOrderId: purchaseOrder3Id,
      skuId: variant10Id,
      quantityOrdered: 10,
      unitCost: 250.0,
      quantityReceived: 10,
    });

    await ctx.db.insert("purchase_order_details", {
      purchaseOrderId: purchaseOrder4Id,
      skuId: variant4Id,
      quantityOrdered: 60,
      unitCost: 25.0,
      quantityReceived: 0,
    });

    await ctx.db.insert("purchase_order_details", {
      purchaseOrderId: purchaseOrder5Id,
      skuId: variant9Id,
      quantityOrdered: 50,
      unitCost: 25.0,
      quantityReceived: 0,
    });

    // ================================================================
    // 13. INVENTORY BATCHES
    // ================================================================

    const batch1Id = await ctx.db.insert("inventory_batches", {
      organizationId,
      skuId: variant1Id,
      zoneId: storageZone1Id,
      quantity: 150,
      branchId,
      supplierBatchNumber: "TECH-2025-1201",
      internalBatchNumber: "INT-001",
      receivedAt: now - oneWeek * 2,
      manufacturingDate: now - oneWeek * 4,
      batchStatusTypeId: batchActiveStatusId,
      isDeleted: false,
    });

    const batch2Id = await ctx.db.insert("inventory_batches", {
      organizationId,
      skuId: variant2Id,
      zoneId: storageZone1Id,
      quantity: 80,
      branchId,
      supplierBatchNumber: "TECH-2025-1202",
      internalBatchNumber: "INT-002",
      receivedAt: now - oneWeek * 2,
      manufacturingDate: now - oneWeek * 4,
      batchStatusTypeId: batchActiveStatusId,
      isDeleted: false,
    });

    const batch3Id = await ctx.db.insert("inventory_batches", {
      organizationId,
      skuId: variant3Id,
      zoneId: storageZone2Id,
      quantity: 45,
      branchId,
      supplierBatchNumber: "TECH-2025-1203",
      internalBatchNumber: "INT-003",
      receivedAt: now - oneWeek,
      manufacturingDate: now - oneWeek * 3,
      batchStatusTypeId: batchActiveStatusId,
      isDeleted: false,
    });

    const batch4Id = await ctx.db.insert("inventory_batches", {
      organizationId,
      skuId: variant5Id,
      zoneId: storageZone2Id,
      quantity: 60,
      branchId,
      supplierBatchNumber: "HOME-2025-0501",
      internalBatchNumber: "INT-004",
      receivedAt: now - oneDay * 10,
      manufacturingDate: now - oneWeek * 3,
      batchStatusTypeId: batchActiveStatusId,
      isDeleted: false,
    });

    const batch5Id = await ctx.db.insert("inventory_batches", {
      organizationId,
      skuId: variant7Id,
      zoneId: storageZone3Id,
      quantity: 20,
      branchId,
      supplierBatchNumber: "OFF-2025-0301",
      internalBatchNumber: "INT-005",
      receivedAt: now - oneDay * 3,
      manufacturingDate: now - oneWeek * 2,
      batchStatusTypeId: batchActiveStatusId,
      isDeleted: false,
    });

    const batch6Id = await ctx.db.insert("inventory_batches", {
      organizationId,
      skuId: variant9Id,
      zoneId: storageZone1Id,
      quantity: 40,
      branchId,
      supplierBatchNumber: "FOOD-2025-1001",
      internalBatchNumber: "INT-006",
      receivedAt: now - oneWeek,
      manufacturingDate: now - oneDay * 30,
      expiresAt: now + oneDay * 335, // expires in ~11 months
      batchStatusTypeId: batchActiveStatusId,
      isDeleted: false,
    });

    const batch7Id = await ctx.db.insert("inventory_batches", {
      organizationId,
      skuId: variant8Id,
      zoneId: storageZone2Id,
      quantity: 100,
      branchId,
      supplierBatchNumber: "SPORT-2025-0801",
      internalBatchNumber: "INT-007",
      receivedAt: now - oneWeek * 3,
      batchStatusTypeId: batchActiveStatusId,
      isDeleted: false,
    });

    const reservedBatchId = await ctx.db.insert("inventory_batches", {
      organizationId,
      skuId: variant4Id,
      zoneId: pickingZone1Id,
      quantity: 25,
      branchId,
      supplierBatchNumber: "TECH-2025-1204",
      internalBatchNumber: "INT-008",
      receivedAt: now - oneDay * 5,
      batchStatusTypeId: batchReservedStatusId,
      isDeleted: false,
    });

    // Branch 2 inventory
    const branch2BatchId = await ctx.db.insert("inventory_batches", {
      organizationId,
      skuId: variant1Id,
      zoneId: branch2StorageZoneId,
      quantity: 50,
      branchId: branch2Id,
      supplierBatchNumber: "TECH-2025-1205",
      internalBatchNumber: "INT-B2-001",
      receivedAt: now - oneDay * 10,
      batchStatusTypeId: batchActiveStatusId,
      isDeleted: false,
    });

    // ================================================================
    // 14. SERIAL NUMBERS
    // ================================================================

    const serial1Id = await ctx.db.insert("serial_numbers", {
      organizationId,
      serialNumber: "SPK-BT-001-SN00001",
      skuId: variant6Id,
      zoneId: storageZone3Id,
      serialStatusTypeId: serialAvailableStatusId,
      warrantyExpiresAt: now + oneDay * 365,
    });

    const serial2Id = await ctx.db.insert("serial_numbers", {
      organizationId,
      serialNumber: "SPK-BT-001-SN00002",
      skuId: variant6Id,
      zoneId: storageZone3Id,
      serialStatusTypeId: serialAvailableStatusId,
      warrantyExpiresAt: now + oneDay * 365,
    });

    const serial3Id = await ctx.db.insert("serial_numbers", {
      organizationId,
      serialNumber: "DESK-STD-160-SN00001",
      skuId: variant10Id,
      batchId: batch5Id,
      zoneId: storageZone3Id,
      serialStatusTypeId: serialAvailableStatusId,
      warrantyExpiresAt: now + oneDay * 730, // 2 years warranty
      purchaseOrderId: purchaseOrder3Id,
    });

    const serial4Id = await ctx.db.insert("serial_numbers", {
      organizationId,
      serialNumber: "DESK-STD-160-SN00002",
      skuId: variant10Id,
      batchId: batch5Id,
      zoneId: storageZone3Id,
      serialStatusTypeId: serialSoldStatusId,
      warrantyExpiresAt: now + oneDay * 730,
      purchaseOrderId: purchaseOrder3Id,
    });

    // ================================================================
    // 15. OUTBOUND ORDERS
    // ================================================================

    const outboundOrder1Id = await ctx.db.insert("outbound_orders", {
      organizationId,
      branchId,
      orderCode: "OUT-2026-001",
      orderDate: now - oneDay * 2,
      requestedShipDate: now + oneDay,
      createdByUserId: managerUserId,
      outboundStatusTypeId: outboundProcessingStatusId,
      isDeleted: false,
    });

    const outboundOrder2Id = await ctx.db.insert("outbound_orders", {
      organizationId,
      branchId,
      orderCode: "OUT-2026-002",
      orderDate: now - oneDay * 5,
      requestedShipDate: now - oneDay * 2,
      trackingNumber: "VN1234567890",
      createdByUserId: managerUserId,
      outboundStatusTypeId: outboundShippedStatusId,
      isDeleted: false,
    });

    const outboundOrder3Id = await ctx.db.insert("outbound_orders", {
      organizationId,
      branchId,
      orderCode: "OUT-2026-003",
      orderDate: now,
      requestedShipDate: now + oneDay * 3,
      createdByUserId: adminUserId,
      outboundStatusTypeId: outboundPendingStatusId,
      isDeleted: false,
    });

    const outboundOrder4Id = await ctx.db.insert("outbound_orders", {
      organizationId,
      branchId,
      orderCode: "OUT-2026-004",
      orderDate: now - oneWeek,
      trackingNumber: "VN0987654321",
      createdByUserId: managerUserId,
      outboundStatusTypeId: outboundDeliveredStatusId,
      isDeleted: false,
    });

    // Outbound Order Details
    const outboundDetail1Id = await ctx.db.insert("outbound_order_details", {
      outboundOrderId: outboundOrder1Id,
      skuId: variant1Id,
      quantityRequested: 20,
      quantityPicked: 15,
      quantityPacked: 10,
    });

    await ctx.db.insert("outbound_order_details", {
      outboundOrderId: outboundOrder1Id,
      skuId: variant3Id,
      quantityRequested: 10,
      quantityPicked: 10,
      quantityPacked: 5,
    });

    await ctx.db.insert("outbound_order_details", {
      outboundOrderId: outboundOrder2Id,
      skuId: variant5Id,
      quantityRequested: 15,
      quantityPicked: 15,
      quantityPacked: 15,
    });

    await ctx.db.insert("outbound_order_details", {
      outboundOrderId: outboundOrder3Id,
      skuId: variant8Id,
      quantityRequested: 25,
      quantityPicked: 0,
      quantityPacked: 0,
    });

    await ctx.db.insert("outbound_order_details", {
      outboundOrderId: outboundOrder4Id,
      skuId: variant7Id,
      quantityRequested: 5,
      quantityPicked: 5,
      quantityPacked: 5,
    });

    // ================================================================
    // 16. TRANSFER ORDERS
    // ================================================================

    const transferOrder1Id = await ctx.db.insert("transfer_orders", {
      organizationId,
      transferCode: "TR-2026-001",
      sourceBranchId: branchId,
      destinationBranchId: branch2Id,
      createdByUserId: managerUserId,
      expectedDeliveryAt: now + oneDay * 2,
      transferStatusTypeId: transferInTransitStatusId,
      isDeleted: false,
    });

    const transferOrder2Id = await ctx.db.insert("transfer_orders", {
      organizationId,
      transferCode: "TR-2026-002",
      sourceBranchId: branch2Id,
      destinationBranchId: branchId,
      createdByUserId: adminUserId,
      expectedDeliveryAt: now + oneDay * 5,
      transferStatusTypeId: transferPendingStatusId,
      isDeleted: false,
    });

    const transferOrder3Id = await ctx.db.insert("transfer_orders", {
      organizationId,
      transferCode: "TR-2026-003",
      sourceBranchId: branchId,
      destinationBranchId: branch3Id,
      createdByUserId: managerUserId,
      expectedDeliveryAt: now - oneDay * 2,
      actualDeliveryAt: now - oneDay,
      trackingNumber: "TR-VN-001",
      transferStatusTypeId: transferCompletedStatusId,
      isDeleted: false,
    });

    // Transfer Order Details
    const transferDetail1Id = await ctx.db.insert("transfer_order_details", {
      transferOrderId: transferOrder1Id,
      skuId: variant1Id,
      quantityRequested: 30,
      quantityShipped: 30,
      quantityReceived: 0,
    });

    await ctx.db.insert("transfer_order_details", {
      transferOrderId: transferOrder1Id,
      skuId: variant2Id,
      quantityRequested: 20,
      quantityShipped: 20,
      quantityReceived: 0,
    });

    await ctx.db.insert("transfer_order_details", {
      transferOrderId: transferOrder2Id,
      skuId: variant4Id,
      quantityRequested: 15,
      quantityShipped: 0,
      quantityReceived: 0,
    });

    await ctx.db.insert("transfer_order_details", {
      transferOrderId: transferOrder3Id,
      skuId: variant3Id,
      quantityRequested: 10,
      quantityShipped: 10,
      quantityReceived: 10,
    });

    // ================================================================
    // 17. WORK SESSIONS
    // ================================================================

    const receiveSession1Id = await ctx.db.insert("work_sessions", {
      organizationId,
      branchId,
      sessionTypeId: receiveSessionTypeId,
      sessionCode: "RCV-2026-001",
      name: "PO-2026-003 Receiving",
      description: "Receiving session for purchase order PO-2026-003",
      assignedUserId: receiverUserId,
      sessionStatusTypeId: sessionCompletedStatusId,
      startedAt: now - oneDay * 3 - 3600000,
      completedAt: now - oneDay * 3,
      verifiedAt: now - oneDay * 3 + 1800000,
      verifiedByUserId: managerUserId,
      purchaseOrderId: purchaseOrder3Id,
    });

    const receiveSession2Id = await ctx.db.insert("work_sessions", {
      organizationId,
      branchId,
      sessionTypeId: receiveSessionTypeId,
      sessionCode: "RCV-2026-002",
      name: "PO-2026-001 Receiving",
      description: "Receiving session for purchase order PO-2026-001",
      assignedUserId: receiverUserId,
      sessionStatusTypeId: sessionPendingStatusId,
      purchaseOrderId: purchaseOrder1Id,
    });

    const pickSession1Id = await ctx.db.insert("work_sessions", {
      organizationId,
      branchId,
      sessionTypeId: pickSessionTypeId,
      sessionCode: "PICK-2026-001",
      name: "Order OUT-2026-001 Picking",
      description: "Picking session for outbound order OUT-2026-001",
      assignedUserId: pickerUserId,
      sessionStatusTypeId: sessionInProgressStatusId,
      startedAt: now - 3600000,
      outboundOrderId: outboundOrder1Id,
    });

    const pickSession2Id = await ctx.db.insert("work_sessions", {
      organizationId,
      branchId,
      sessionTypeId: pickSessionTypeId,
      sessionCode: "PICK-2026-002",
      name: "Order OUT-2026-002 Picking",
      description: "Picking session for outbound order OUT-2026-002",
      assignedUserId: pickerUserId,
      sessionStatusTypeId: sessionCompletedStatusId,
      startedAt: now - oneDay * 5,
      completedAt: now - oneDay * 5 + 7200000,
      verifiedAt: now - oneDay * 5 + 9000000,
      verifiedByUserId: managerUserId,
      outboundOrderId: outboundOrder2Id,
    });

    const cycleCountSession1Id = await ctx.db.insert("work_sessions", {
      organizationId,
      branchId,
      sessionTypeId: cycleCountSessionTypeId,
      sessionCode: "CC-2026-001",
      name: "Daily Cycle Count - Zone A",
      description: "Daily cycle count for General Storage A",
      cycleCountTypeId: dailyCycleCountTypeId,
      assignedUserId: auditorUserId,
      sessionStatusTypeId: sessionVerifiedStatusId,
      startedAt: now - oneDay,
      completedAt: now - oneDay + 5400000,
      verifiedAt: now - oneDay + 7200000,
      verifiedByUserId: managerUserId,
    });

    const cycleCountSession2Id = await ctx.db.insert("work_sessions", {
      organizationId,
      branchId,
      sessionTypeId: cycleCountSessionTypeId,
      sessionCode: "CC-2026-002",
      name: "Weekly Cycle Count - High Value",
      description: "Weekly cycle count for high value storage zone",
      cycleCountTypeId: weeklyCycleCountTypeId,
      assignedUserId: auditorUserId,
      sessionStatusTypeId: sessionPendingStatusId,
    });

    // Session Line Items
    await ctx.db.insert("session_line_items", {
      sessionId: pickSession1Id,
      skuId: variant1Id,
      expectedQuantity: 20,
      actualQuantity: 15,
      zoneId: pickingZone1Id,
      batchId: batch1Id,
      scannedAt: now - 1800000,
      notes: "5 units out of stock",
    });

    await ctx.db.insert("session_line_items", {
      sessionId: pickSession1Id,
      skuId: variant3Id,
      expectedQuantity: 10,
      actualQuantity: 10,
      zoneId: pickingZone1Id,
      batchId: batch3Id,
      scannedAt: now - 900000,
    });

    await ctx.db.insert("session_line_items", {
      sessionId: cycleCountSession1Id,
      skuId: variant1Id,
      expectedQuantity: 150,
      actualQuantity: 148,
      zoneId: storageZone1Id,
      batchId: batch1Id,
      scannedAt: now - oneDay + 3600000,
      notes: "Minor variance found",
    });

    await ctx.db.insert("session_line_items", {
      sessionId: cycleCountSession1Id,
      skuId: variant2Id,
      expectedQuantity: 80,
      actualQuantity: 80,
      zoneId: storageZone1Id,
      batchId: batch2Id,
      scannedAt: now - oneDay + 4500000,
    });

    await ctx.db.insert("session_line_items", {
      sessionId: receiveSession1Id,
      skuId: variant7Id,
      expectedQuantity: 20,
      actualQuantity: 20,
      zoneId: receivingZone1Id,
      scannedAt: now - oneDay * 3 - 1800000,
    });

    // Session Zone Assignments
    await ctx.db.insert("session_zone_assignments", {
      sessionId: cycleCountSession1Id,
      zoneId: storageZone1Id,
      assignedUserId: auditorUserId,
    });

    await ctx.db.insert("session_zone_assignments", {
      sessionId: cycleCountSession2Id,
      zoneId: storageZone3Id,
      assignedUserId: auditorUserId,
    });

    // Session Metrics
    await ctx.db.insert("session_metrics", {
      sessionId: receiveSession1Id,
      totalTimeSeconds: 3600,
      totalItemsProcessed: 30,
      accuracyRate: 100,
      calculatedAt: now - oneDay * 3,
    });

    await ctx.db.insert("session_metrics", {
      sessionId: pickSession2Id,
      totalTimeSeconds: 7200,
      totalItemsProcessed: 15,
      accuracyRate: 100,
      calculatedAt: now - oneDay * 5 + 7200000,
    });

    await ctx.db.insert("session_metrics", {
      sessionId: cycleCountSession1Id,
      totalTimeSeconds: 5400,
      totalItemsProcessed: 230,
      accuracyRate: 98.7,
      calculatedAt: now - oneDay + 5400000,
    });

    // ================================================================
    // 17.5 RECEIVE SESSIONS (linked to work_sessions and purchase_orders)
    // ================================================================

    // Receive session for PO-2026-003 (completed - received status)
    const receiveSessionRS1Id = await ctx.db.insert("receive_sessions", {
      receiveSessionCode: "RS-20260101-0001",
      purchaseOrderId: purchaseOrder3Id,
      branchId,
      receivedAt: now - oneDay * 3,
      receiveSessionStatusTypeId: receiveSessionCompleteStatusId,
    });

    // Link the work session to the receive session
    await ctx.db.patch(receiveSession1Id, {
      receiveSessionId: receiveSessionRS1Id,
    });

    // Receive session for PO-2026-001 (pending - just created)
    const receiveSessionRS2Id = await ctx.db.insert("receive_sessions", {
      receiveSessionCode: "RS-20260104-0001",
      purchaseOrderId: purchaseOrder1Id,
      branchId,
      receivedAt: now,
      receiveSessionStatusTypeId: receiveSessionPendingStatusId,
    });

    // Link the pending work session to this receive session
    await ctx.db.patch(receiveSession2Id, {
      receiveSessionId: receiveSessionRS2Id,
    });

    // Receive session for PO-2026-002 (in progress)
    const receiveSessionRS3Id = await ctx.db.insert("receive_sessions", {
      receiveSessionCode: "RS-20260103-0001",
      purchaseOrderId: purchaseOrder2Id,
      branchId,
      receivedAt: now - oneDay,
      receiveSessionStatusTypeId: receiveSessionInProgressStatusId,
    });

    // ================================================================
    // 17.6 RECEIVE SESSION DETAILS
    // ================================================================

    // Details for RS-20260101-0001 (completed receive session for PO-2026-003)
    await ctx.db.insert("receive_sessions_details", {
      receiveSessionId: receiveSessionRS1Id,
      skuId: variant7Id,
      quantityExpected: 20,
      quantityReceived: 20,
      notes: "All items received in good condition",
      recommendedZoneId: storageZone3Id,
      receiveSessionItemStatusTypeId: receiveItemCompleteStatusId,
    });

    await ctx.db.insert("receive_sessions_details", {
      receiveSessionId: receiveSessionRS1Id,
      skuId: variant10Id,
      quantityExpected: 10,
      quantityReceived: 10,
      recommendedZoneId: storageZone2Id,
      receiveSessionItemStatusTypeId: receiveItemCompleteStatusId,
    });

    // Details for RS-20260104-0001 (pending receive session for PO-2026-001)
    await ctx.db.insert("receive_sessions_details", {
      receiveSessionId: receiveSessionRS2Id,
      skuId: variant1Id,
      quantityExpected: 100,
      quantityReceived: 0,
      receiveSessionItemStatusTypeId: receiveItemPendingStatusId,
    });

    await ctx.db.insert("receive_sessions_details", {
      receiveSessionId: receiveSessionRS2Id,
      skuId: variant3Id,
      quantityExpected: 50,
      quantityReceived: 0,
      receiveSessionItemStatusTypeId: receiveItemPendingStatusId,
    });

    // Details for RS-20260103-0001 (in progress receive session for PO-2026-002)
    await ctx.db.insert("receive_sessions_details", {
      receiveSessionId: receiveSessionRS3Id,
      skuId: variant5Id,
      quantityExpected: 75,
      quantityReceived: 45,
      notes: "Partial receipt - remaining items expected tomorrow",
      recommendedZoneId: storageZone2Id,
      receiveSessionItemStatusTypeId: receiveItemPartialStatusId,
    });

    // ================================================================
    // 18. INVENTORY TRANSACTIONS
    // ================================================================

    await ctx.db.insert("inventory_transactions", {
      organizationId,
      batchId: batch1Id,
      quantityBefore: 0,
      quantityChange: 150,
      quantityAfter: 150,
      inventoryTransactionTypeId: receiveTransactionTypeId,
      createdByUserId: receiverUserId,
      notes: "Initial stock received",
      workSessionId: receiveSession1Id,
    });

    await ctx.db.insert("inventory_transactions", {
      organizationId,
      batchId: batch1Id,
      quantityBefore: 150,
      quantityChange: -15,
      quantityAfter: 135,
      inventoryTransactionTypeId: pickTransactionTypeId,
      createdByUserId: pickerUserId,
      notes: "Picked for order OUT-2026-001",
      outboundOrderDetailId: outboundDetail1Id,
      workSessionId: pickSession1Id,
    });

    await ctx.db.insert("inventory_transactions", {
      organizationId,
      batchId: batch1Id,
      quantityBefore: 135,
      quantityChange: -2,
      quantityAfter: 133,
      inventoryTransactionTypeId: adjustTransactionTypeId,
      createdByUserId: auditorUserId,
      notes: "Cycle count adjustment",
      workSessionId: cycleCountSession1Id,
    });

    await ctx.db.insert("inventory_transactions", {
      organizationId,
      batchId: batch1Id,
      quantityBefore: 133,
      quantityChange: -30,
      quantityAfter: 103,
      inventoryTransactionTypeId: transferTransactionTypeId,
      createdByUserId: managerUserId,
      notes: "Transfer to Branch 2",
      transferOrderDetailId: transferDetail1Id,
    });

    await ctx.db.insert("inventory_transactions", {
      organizationId,
      serialNumberId: serial4Id,
      quantityBefore: 1,
      quantityChange: -1,
      quantityAfter: 0,
      inventoryTransactionTypeId: pickTransactionTypeId,
      createdByUserId: pickerUserId,
      notes: "Serial number sold",
    });

    // ================================================================
    // 19. ADJUSTMENT REQUESTS
    // ================================================================

    const adjustmentRequest1Id = await ctx.db.insert("adjustment_requests", {
      organizationId: organizationId as unknown as string,
      branchId: branchId as unknown as string,
      requestCode: "ADJ-2026-001",
      adjustmentTypeId: quantityAdjustmentTypeId as unknown as string,
      requestedByUserId: auditorUserId as unknown as string,
      requestedAt: now - oneDay,
      approvedByUserId: managerUserId as unknown as string,
      approvedAt: now - oneDay + 3600000,
      adjustmentStatusTypeId: adjustmentApprovedStatusId as unknown as string,
      resolutionNotes: "Approved after physical count verification",
    });

    const adjustmentRequest2Id = await ctx.db.insert("adjustment_requests", {
      organizationId: organizationId as unknown as string,
      branchId: branchId as unknown as string,
      requestCode: "ADJ-2026-002",
      adjustmentTypeId: locationAdjustmentTypeId as unknown as string,
      requestedByUserId: pickerUserId as unknown as string,
      requestedAt: now - oneDay * 2,
      adjustmentStatusTypeId: adjustmentPendingStatusId as unknown as string,
    });

    const adjustmentRequest3Id = await ctx.db.insert("adjustment_requests", {
      organizationId: organizationId as unknown as string,
      branchId: branchId as unknown as string,
      requestCode: "ADJ-2026-003",
      adjustmentTypeId: quantityAdjustmentTypeId as unknown as string,
      requestedByUserId: auditorUserId as unknown as string,
      requestedAt: now - oneWeek,
      approvedByUserId: managerUserId as unknown as string,
      approvedAt: now - oneWeek + 7200000,
      adjustmentStatusTypeId: adjustmentRejectedStatusId as unknown as string,
      resolutionNotes: "Rejected - insufficient documentation",
    });

    // Adjustment Request Details
    await ctx.db.insert("adjustment_request_details", {
      adjustmentRequestId: adjustmentRequest1Id,
      batchId: batch1Id as unknown as string,
      skuId: variant1Id as unknown as string,
      expectedQuantity: 150,
      actualQuantity: 148,
      varianceQuantity: -2,
      costImpact: -30.0,
      reasonTypeId: countDiscrepancyReasonTypeId as unknown as string,
      customReasonNotes: "Found 2 units damaged during count",
    });

    await ctx.db.insert("adjustment_request_details", {
      adjustmentRequestId: adjustmentRequest2Id,
      batchId: batch3Id as unknown as string,
      skuId: variant3Id as unknown as string,
      expectedQuantity: 45,
      actualQuantity: 45,
      varianceQuantity: 0,
      costImpact: 0,
      reasonTypeId: countDiscrepancyReasonTypeId as unknown as string,
      fromZoneId: storageZone2Id as unknown as string,
      toZoneId: pickingZone1Id as unknown as string,
      quantity: 15,
    });

    // ================================================================
    // 20. RETURN REQUESTS
    // ================================================================

    const returnRequest1Id = await ctx.db.insert("return_requests", {
      organizationId: organizationId as unknown as string,
      branchId: branchId as unknown as string,
      requestCode: "RET-2026-001",
      supplierId: supplier1Id as unknown as string,
      requestedByUserId: managerUserId as unknown as string,
      requestedAt: now - oneDay * 3,
      returnStatusTypeId: returnApprovedStatusId as unknown as string,
      isDeleted: false,
    });

    const returnRequest2Id = await ctx.db.insert("return_requests", {
      organizationId: organizationId as unknown as string,
      branchId: branchId as unknown as string,
      requestCode: "RET-2026-002",
      supplierId: supplier3Id as unknown as string,
      requestedByUserId: receiverUserId as unknown as string,
      requestedAt: now - oneDay,
      returnStatusTypeId: returnPendingStatusId as unknown as string,
      isDeleted: false,
    });

    // Return Request Details
    await ctx.db.insert("return_request_details", {
      returnRequestId: returnRequest1Id,
      batchId: batch1Id as unknown as string,
      skuId: variant1Id as unknown as string,
      quantityToReturn: 5,
      reasonTypeId: defectiveReturnReasonId as unknown as string,
      customReasonNotes: "5 units have defective scroll wheels",
      expectedCreditAmount: 75.0,
    });

    await ctx.db.insert("return_request_details", {
      returnRequestId: returnRequest2Id,
      batchId: batch5Id as unknown as string,
      skuId: variant7Id as unknown as string,
      quantityToReturn: 2,
      reasonTypeId: wrongItemReturnReasonId as unknown as string,
      customReasonNotes: "Received wrong color variant",
      expectedCreditAmount: 240.0,
    });

    // ================================================================
    // 21. NOTIFICATIONS
    // ================================================================

    await ctx.db.insert("notifications", {
      organizationId,
      notificationCategoryTypeId: alertNotificationCategoryId,
      notificationType: "LOW_STOCK",
      recipientUserId: managerUserId,
      title: "Low Stock Alert",
      message:
        "Wireless Mouse (WM-BLK-001) is below reorder point. Current: 45, Reorder Point: 50",
      priorityTypeId: highPriorityTypeId,
      actionUrl: "/inventory/products/WM-BLK-001",
      relatedEntityType: "product_variants",
      relatedEntityId: variant1Id as unknown as string,
    });

    await ctx.db.insert("notifications", {
      organizationId,
      notificationCategoryTypeId: infoNotificationCategoryId,
      notificationType: "PO_APPROVED",
      recipientUserId: receiverUserId,
      title: "Purchase Order Approved",
      message:
        "Purchase order PO-2026-001 has been approved and is ready for receiving",
      priorityTypeId: mediumPriorityTypeId,
      actionUrl: "/purchase-orders/PO-2026-001",
      relatedEntityType: "purchase_orders",
      relatedEntityId: purchaseOrder1Id as unknown as string,
      readAt: now - oneDay,
    });

    await ctx.db.insert("notifications", {
      organizationId,
      notificationCategoryTypeId: reminderNotificationCategoryId,
      notificationType: "SESSION_ASSIGNED",
      recipientUserId: auditorUserId,
      title: "Cycle Count Assigned",
      message:
        "You have been assigned a weekly cycle count session for the high value storage zone",
      priorityTypeId: mediumPriorityTypeId,
      actionUrl: "/sessions/CC-2026-002",
      relatedEntityType: "work_sessions",
      relatedEntityId: cycleCountSession2Id as unknown as string,
    });

    await ctx.db.insert("notifications", {
      organizationId,
      notificationCategoryTypeId: alertNotificationCategoryId,
      notificationType: "EXPIRY_WARNING",
      recipientUserId: managerUserId,
      title: "Product Expiry Warning",
      message: "Protein Powder batch INT-006 will expire in 30 days",
      priorityTypeId: highPriorityTypeId,
      relatedEntityType: "inventory_batches",
      relatedEntityId: batch6Id as unknown as string,
    });

    await ctx.db.insert("notifications", {
      organizationId,
      notificationCategoryTypeId: infoNotificationCategoryId,
      notificationType: "TRANSFER_SHIPPED",
      recipientUserId: managerUserId,
      title: "Transfer Order Shipped",
      message:
        "Transfer order TR-2026-001 has been shipped to Secondary Branch",
      priorityTypeId: lowPriorityTypeId,
      relatedEntityType: "transfer_orders",
      relatedEntityId: transferOrder1Id as unknown as string,
      readAt: now - 3600000,
      dismissedAt: now - 1800000,
    });

    // ================================================================
    // 22. DEMAND FORECASTS
    // ================================================================

    await ctx.db.insert("demand_forecasts", {
      organizationId,
      skuId: variant1Id,
      forecastDate: now + oneDay * 30,
      forecastTypeId: demandForecastTypeId,
      predictedDemand: 200,
      confidenceInterval: 0.85,
      calculationMethod: "Moving Average",
    });

    await ctx.db.insert("demand_forecasts", {
      organizationId,
      skuId: variant3Id,
      forecastDate: now + oneDay * 30,
      forecastTypeId: demandForecastTypeId,
      predictedDemand: 75,
      confidenceInterval: 0.78,
      calculationMethod: "Exponential Smoothing",
    });

    await ctx.db.insert("demand_forecasts", {
      organizationId,
      skuId: variant8Id,
      forecastDate: now + oneDay * 60,
      forecastTypeId: seasonalForecastTypeId,
      predictedDemand: 150,
      confidenceInterval: 0.72,
      calculationMethod: "Seasonal Decomposition",
    });

    // ================================================================
    // 23. REPORT TEMPLATES
    // ================================================================

    await ctx.db.insert("report_templates", {
      organizationId,
      templateName: "Daily Inventory Summary",
      description:
        "Summary of inventory levels, movements, and alerts for the day",
      ownerUserId: adminUserId,
      templateConfig: {
        sections: ["inventory_levels", "movements", "alerts"],
        groupBy: "category",
        includeCharts: true,
      },
      sharingScopeTypeId: organizationShareScopeId,
    });

    await ctx.db.insert("report_templates", {
      organizationId,
      templateName: "Purchase Order Analysis",
      description: "Analysis of purchase orders by supplier and status",
      ownerUserId: managerUserId,
      templateConfig: {
        sections: ["po_summary", "supplier_breakdown", "lead_time_analysis"],
        dateRange: "last_30_days",
        includeCharts: true,
      },
      sharingScopeTypeId: organizationShareScopeId,
    });

    await ctx.db.insert("report_templates", {
      organizationId,
      templateName: "Personal Performance Report",
      description: "My personal picking and receiving performance metrics",
      ownerUserId: pickerUserId,
      templateConfig: {
        sections: ["sessions_completed", "accuracy_rate", "items_processed"],
        dateRange: "last_7_days",
      },
      sharingScopeTypeId: privateShareScopeId,
    });

    // ================================================================
    // 24. ATTACHMENTS
    // ================================================================

    await ctx.db.insert("attachments", {
      organizationId,
      fileName: "PO-2026-001-invoice.pdf",
      filePath: "/attachments/invoices/PO-2026-001-invoice.pdf",
      fileSizeBytes: 256000,
      mimeType: "application/pdf",
      uploadedByUserId: managerUserId,
      uploadedAt: now - oneWeek,
      entityType: "purchase_orders",
      entityId: 1,
      notes: "Supplier invoice for PO-2026-001",
    });

    await ctx.db.insert("attachments", {
      organizationId,
      fileName: "damage-report-001.jpg",
      filePath: "/attachments/reports/damage-report-001.jpg",
      fileSizeBytes: 1024000,
      mimeType: "image/jpeg",
      uploadedByUserId: receiverUserId,
      uploadedAt: now - oneDay * 3,
      entityType: "adjustment_requests",
      entityId: 1,
      notes: "Photo evidence of damaged wireless mouse units",
    });

    await ctx.db.insert("attachments", {
      organizationId,
      fileName: "product-manual-chair.pdf",
      filePath: "/attachments/manuals/product-manual-chair.pdf",
      fileSizeBytes: 512000,
      mimeType: "application/pdf",
      uploadedByUserId: adminUserId,
      uploadedAt: now - oneWeek * 2,
      entityType: "products",
      entityId: 6,
      notes: "Assembly and user manual for ergonomic office chair",
    });

    // ================================================================
    // 25. AUDIT LOGS
    // ================================================================

    await ctx.db.insert("audit_logs", {
      organizationId,
      userId: adminUserId,
      actionTypeId: createActionTypeId,
      entityType: "purchase_orders",
      entityId: purchaseOrder1Id as unknown as string,
      notes: "Created purchase order PO-2026-001",
      ipAddress: "192.168.1.100",
    });

    await ctx.db.insert("audit_logs", {
      organizationId,
      userId: managerUserId,
      actionTypeId: updateActionTypeId,
      entityType: "purchase_orders",
      entityId: purchaseOrder1Id as unknown as string,
      fieldName: "purchaseOrderStatusTypeId",
      oldValue: { status: "PENDING" },
      newValue: { status: "APPROVED" },
      notes: "Approved purchase order",
      ipAddress: "192.168.1.101",
    });

    await ctx.db.insert("audit_logs", {
      organizationId,
      userId: auditorUserId,
      actionTypeId: createActionTypeId,
      entityType: "adjustment_requests",
      entityId: adjustmentRequest1Id as unknown as string,
      notes: "Created adjustment request ADJ-2026-001",
      ipAddress: "192.168.1.102",
    });

    await ctx.db.insert("audit_logs", {
      organizationId,
      userId: managerUserId,
      actionTypeId: updateActionTypeId,
      entityType: "inventory_batches",
      entityId: batch1Id as unknown as string,
      fieldName: "quantity",
      oldValue: { quantity: 150 },
      newValue: { quantity: 148 },
      notes: "Quantity adjusted after cycle count",
      ipAddress: "192.168.1.101",
    });

    await ctx.db.insert("audit_logs", {
      organizationId,
      userId: adminUserId,
      actionTypeId: deleteActionTypeId,
      entityType: "purchase_orders",
      entityId: purchaseOrder5Id as unknown as string,
      notes: "Cancelled purchase order PO-2026-005",
      ipAddress: "192.168.1.100",
    });

    // ================================================================
    // RETURN CREATED IDS FOR TESTING
    // ================================================================

    return {
      success: true,
      message:
        "All mock data seeded successfully! Database populated with comprehensive test data.",
      summary: {
        organizations: 2,
        branches: 3,
        users: 6,
        roles: 6,
        brands: 5,
        categories: 9,
        products: 10,
        productVariants: 11,
        suppliers: 5,
        storageZones: 10,
        purchaseOrders: 5,
        outboundOrders: 4,
        transferOrders: 3,
        inventoryBatches: 9,
        serialNumbers: 4,
        workSessions: 6,
        notifications: 5,
        systemLookups: "50+",
      },
      ids: {
        // Organizations
        organizationId,
        organization2Id,

        // Branches
        branchId,
        branch2Id,
        branch3Id,

        // Users
        userId,
        adminUserId,
        managerUserId,
        receiverUserId,
        pickerUserId,
        auditorUserId,

        // Roles
        adminRoleId,
        managerRoleId,
        receiverRoleId,
        pickerRoleId,
        auditorRoleId,
        viewerRoleId,

        // Brands
        brand1Id,
        brand2Id,
        brand3Id,
        brand4Id,
        brand5Id,

        // Categories
        electronicsCategory,
        computerPeripheralsCategory,
        audioVideoCategory,
        homeCategory,
        furnitureCategory,
        lightingCategory,
        officeCategory,
        sportsCategory,
        foodBeverageCategory,

        // Products
        product1Id,
        product2Id,
        product3Id,
        product4Id,
        product5Id,
        product6Id,
        product7Id,
        product8Id,
        product9Id,
        product10Id,

        // Variants
        variant1Id,
        variant2Id,
        variant3Id,
        variant4Id,
        variant5Id,
        variant6Id,
        variant7Id,
        variant8Id,
        variant9Id,
        variant10Id,
        variant11Id,

        // Suppliers
        supplier1Id,
        supplier2Id,
        supplier3Id,
        supplier4Id,
        supplier5Id,

        // Storage Zones
        storageZones: {
          receivingZone1Id,
          receivingZone2Id,
          storageZone1Id,
          storageZone2Id,
          storageZone3Id,
          pickingZone1Id,
          pickingZone2Id,
          shippingZone1Id,
          shippingZone2Id,
          branch2StorageZoneId,
        },

        // Purchase Orders
        purchaseOrders: {
          purchaseOrder1Id,
          purchaseOrder2Id,
          purchaseOrder3Id,
          purchaseOrder4Id,
          purchaseOrder5Id,
        },

        // Outbound Orders
        outboundOrders: {
          outboundOrder1Id,
          outboundOrder2Id,
          outboundOrder3Id,
          outboundOrder4Id,
        },

        // Transfer Orders
        transferOrders: {
          transferOrder1Id,
          transferOrder2Id,
          transferOrder3Id,
        },

        // Inventory Batches
        batches: {
          batch1Id,
          batch2Id,
          batch3Id,
          batch4Id,
          batch5Id,
          batch6Id,
          batch7Id,
          reservedBatchId,
          branch2BatchId,
        },

        // Work Sessions
        sessions: {
          receiveSession1Id,
          receiveSession2Id,
          pickSession1Id,
          pickSession2Id,
          cycleCountSession1Id,
          cycleCountSession2Id,
        },

        // System Lookups - Status Types
        purchaseOrderStatuses: {
          pendingStatusId,
          approvedStatusId,
          receivedStatusId,
          cancelledStatusId,
        },
        outboundStatuses: {
          outboundPendingStatusId,
          outboundProcessingStatusId,
          outboundShippedStatusId,
          outboundDeliveredStatusId,
        },
        transferStatuses: {
          transferPendingStatusId,
          transferInTransitStatusId,
          transferCompletedStatusId,
        },
        sessionStatuses: {
          sessionPendingStatusId,
          sessionInProgressStatusId,
          sessionCompletedStatusId,
          sessionVerifiedStatusId,
        },
        batchStatuses: {
          batchActiveStatusId,
          batchReservedStatusId,
          batchExpiredStatusId,
        },

        // System Lookups - Other Types
        unitOfMeasures: {
          unitPieceId,
          unitBoxId,
          unitKgId,
        },
        storageRequirements: {
          normalStorageId,
          coldStorageId,
          freezerStorageId,
        },
        trackingMethods: {
          fifoTrackingId,
          fefoTrackingId,
          serialTrackingId,
        },
        zoneTypes: {
          receivingZoneTypeId,
          storageZoneTypeId,
          pickingZoneTypeId,
          shippingZoneTypeId,
        },
        sessionTypes: {
          receiveSessionTypeId,
          pickSessionTypeId,
          cycleCountSessionTypeId,
        },
      },
    };
  },
});

/**
 * Clear all test data (use with caution!)
 * This clears all seeded tables in dependency order.
 */
export const clearAllTestData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete in reverse order of dependencies (child tables first, parent tables last)
    const tables = [
      // Audit & Logs
      "audit_logs",

      // Attachments
      "attachments",

      // Reports & Analytics
      "report_templates",
      "demand_forecasts",

      // Notifications
      "notifications",

      // Transfer Orders
      "transfer_order_details",
      "transfer_orders",

      // Return Requests
      "return_request_details",
      "return_requests",

      // Adjustment Requests
      "adjustment_request_details",
      "adjustment_requests",

      // Outbound Orders
      "outbound_order_details",
      "outbound_orders",

      // Inventory Transactions & Tracking
      "inventory_transactions",
      "serial_numbers",
      "inventory_batches",

      // Receive Sessions (delete before work_sessions)
      "receive_sessions_details",
      "receive_sessions",

      // Work Sessions
      "session_metrics",
      "session_zone_assignments",
      "session_line_items",
      "work_sessions",

      // Purchase Orders
      "purchase_order_details",
      "purchase_orders",

      // Storage & Zones
      "storage_zones",

      // Products & Variants
      "product_barcodes",
      "product_variants",
      "products",
      "product_type_templates",

      // Suppliers
      "suppliers",

      // Categories & Brands
      "category_settings",
      "categories",
      "brands",

      // User Management
      "user_role_assignments",
      "role_permissions",
      "roles",
      "user_branch_assignments",
      "users",

      // Workspace Invitations
      "workspace_invitations",

      // Branch Settings
      "branch_settings",
      "branches",

      // Organization Settings
      "organization_settings",
      "organizations",

      // System Lookups (delete last as many tables reference it)
      "system_lookups",
    ] as const;

    let deletedCounts: Record<string, number> = {};
    let totalDeleted = 0;

    for (const table of tables) {
      const records = await ctx.db.query(table).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
      deletedCounts[table] = records.length;
      totalDeleted += records.length;
    }

    return {
      success: true,
      message: `All test data cleared! Total records deleted: ${totalDeleted}`,
      deletedCounts,
      totalDeleted,
    };
  },
});

/**
 * Clear ALL database data (use with extreme caution!)
 * This removes ALL records from ALL tables in the database.
 * Useful for completely resetting the database before seeding.
 */
export const clearAllDatabaseData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete in reverse order of dependencies (child tables first, parent tables last)
    // Order matters to avoid foreign key constraint issues
    const tables = [
      // Audit & Logs (no dependencies on other tables)
      "audit_logs",

      // Attachments
      "attachments",

      // Reports & Analytics
      "report_templates",
      "demand_forecasts",

      // Notifications
      "notifications",

      // Transfer Orders
      "transfer_order_details",
      "transfer_orders",

      // Return Requests
      "return_request_details",
      "return_requests",

      // Adjustment Requests
      "adjustment_request_details",
      "adjustment_requests",

      // Outbound Orders
      "outbound_order_details",
      "outbound_orders",

      // Inventory Transactions & Tracking
      "inventory_transactions",
      "serial_numbers",
      "inventory_batches",

      // Receive Sessions (delete before work_sessions)
      "receive_sessions_details",
      "receive_sessions",

      // Work Sessions
      "session_metrics",
      "session_zone_assignments",
      "session_line_items",
      "work_sessions",

      // Purchase Orders
      "purchase_order_details",
      "purchase_orders",

      // Storage & Zones
      "storage_zones",

      // Products & Variants
      "product_barcodes",
      "product_variants",
      "products",
      "product_type_templates",

      // Suppliers
      "suppliers",

      // Categories & Brands
      "category_settings",
      "categories",
      "brands",

      // User Management
      "user_role_assignments",
      "role_permissions",
      "roles",
      "user_branch_assignments",
      "users",

      // Workspace Invitations
      "workspace_invitations",

      // Branch Settings
      "branch_settings",
      "branches",

      // Organization Settings
      "organization_settings",
      "organizations",

      // System Lookups (delete last as many tables reference it)
      "system_lookups",
    ] as const;

    let deletedCounts: Record<string, number> = {};
    let totalDeleted = 0;

    for (const table of tables) {
      const records = await ctx.db.query(table).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
      deletedCounts[table] = records.length;
      totalDeleted += records.length;
    }

    return {
      success: true,
      message: `All database data cleared! Total records deleted: ${totalDeleted}`,
      deletedCounts,
      totalDeleted,
    };
  },
});

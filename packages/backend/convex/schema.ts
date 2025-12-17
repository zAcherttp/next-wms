import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ================================================================
  // ORGANIZATION & WORKSPACE MANAGEMENT
  // ================================================================

  organizations: defineTable({
    name: v.string(),
    address: v.string(),
    contactInfo: v.optional(v.any()), // jsonb
    isActive: v.boolean(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("name", ["name"])
    .index("isActive", ["isActive"])
    .index("isDeleted", ["isDeleted"]),

  organization_settings: defineTable({
    organizationId: v.id("organizations"),
    settingKey: v.string(),
    settingValue: v.any(), // jsonb
  }).index("organizationId_settingKey", ["organizationId", "settingKey"]),

  branches: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    address: v.string(),
    phoneNumber: v.string(),
    isActive: v.boolean(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("organizationId", ["organizationId"])
    .index("isActive", ["isActive"])
    .index("isDeleted", ["isDeleted"]),

  branch_settings: defineTable({
    branchId: v.id("branches"),
    settingKey: v.string(),
    settingValue: v.any(), // jsonb
  }).index("branchId_settingKey", ["branchId", "settingKey"]),

  workspace_invitations: defineTable({
    organizationId: v.id("organizations"),
    invitationCode: v.string(),
    createdByUserId: v.id("users"),
    expiresAt: v.number(),
    statusTypeId: v.id("system_lookups"),
  })
    .index("organizationId", ["organizationId"])
    .index("invitationCode", ["invitationCode"])
    .index("statusTypeId", ["statusTypeId"]),

  // ================================================================
  // USER MANAGEMENT & AUTHENTICATION
  // ================================================================

  users: defineTable({
    organizationId: v.id("organizations"),
    username: v.string(),
    passwordHash: v.string(),
    fullName: v.string(),
    email: v.string(),
    isActive: v.boolean(),
    preferences: v.optional(v.any()), // jsonb
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("organizationId", ["organizationId"])
    .index("username", ["username"])
    .index("email", ["email"])
    .index("isActive", ["isActive"])
    .index("isDeleted", ["isDeleted"]),

  user_branch_assignments: defineTable({
    userId: v.id("users"),
    branchId: v.id("branches"),
    assignmentStatusTypeId: v.id("system_lookups"),
    assignedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("branchId", ["branchId"])
    .index("userId_branchId", ["userId", "branchId"]),

  roles: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.string(),
    isSystemDefault: v.boolean(),
  })
    .index("organizationId", ["organizationId"])
    .index("isSystemDefault", ["isSystemDefault"]),

  role_permissions: defineTable({
    roleId: v.id("roles"),
    permissionCategory: v.string(),
    permissionBits: v.number(), // bigint as number
    scopeType: v.string(),
  })
    .index("roleId", ["roleId"])
    .index("permissionCategory", ["permissionCategory"]),

  user_role_assignments: defineTable({
    userId: v.id("users"),
    roleId: v.id("roles"),
    branchId: v.optional(v.id("branches")),
    assignedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("roleId", ["roleId"])
    .index("branchId", ["branchId"]),

  // ================================================================
  // MASTER DATA MANAGEMENT
  // ================================================================

  categories: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    path: v.string(), // ltree as string
    isActive: v.boolean(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("organizationId", ["organizationId"])
    .index("isActive", ["isActive"])
    .index("isDeleted", ["isDeleted"]),

  category_settings: defineTable({
    categoryId: v.id("categories"),
    settingKey: v.string(),
    settingValue: v.any(), // jsonb
  }).index("categoryId_settingKey", ["categoryId", "settingKey"]),

  brands: defineTable({
    organizationId: v.string(),
    name: v.string(),
    isActive: v.boolean(),
  })
    .index("organizationId", ["organizationId"])
    .index("isActive", ["isActive"]),

  products: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.string(),
    categoryId: v.id("categories"),
    brandId: v.id("brands"),
    storageRequirementTypeId: v.id("system_lookups"),
    trackingMethodTypeId: v.id("system_lookups"),
    shelfLifeDays: v.optional(v.number()),
    reorderPoint: v.optional(v.number()),
    reorderPointOverride: v.optional(v.number()),
    isActive: v.boolean(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("organizationId", ["organizationId"])
    .index("categoryId", ["categoryId"])
    .index("brandId", ["brandId"])
    .index("isActive", ["isActive"])
    .index("isDeleted", ["isDeleted"]),

  product_type_templates: defineTable({
    organizationId: v.id("organizations"),
    templateName: v.string(),
    fieldDefinitions: v.any(), // jsonb
  }).index("organizationId", ["organizationId"]),

  product_variants: defineTable({
    productId: v.id("products"),
    skuCode: v.string(),
    description: v.string(),
    costPrice: v.number(),
    sellingPrice: v.number(),
    unitOfMeasureId: v.id("system_lookups"),
    weightKg: v.optional(v.number()),
    volumeM3: v.optional(v.number()),
    temperatureSensitive: v.boolean(),
    stackingLimit: v.optional(v.number()),
    customFields: v.optional(v.any()), // jsonb
    isActive: v.boolean(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("productId", ["productId"])
    .index("skuCode", ["skuCode"])
    .index("isActive", ["isActive"])
    .index("isDeleted", ["isDeleted"]),

  product_barcodes: defineTable({
    skuId: v.id("product_variants"),
    barcodeTypeId: v.id("system_lookups"),
    barcodeValue: v.string(),
  })
    .index("skuId", ["skuId"])
    .index("barcodeValue", ["barcodeValue"]),

  suppliers: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    contactPerson: v.string(),
    email: v.string(),
    phone: v.string(),
    defaultLeadTimeDays: v.number(),
    isActive: v.boolean(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("organizationId", ["organizationId"])
    .index("isActive", ["isActive"])
    .index("isDeleted", ["isDeleted"]),

  // ================================================================
  // WAREHOUSE LAYOUT & STORAGE
  // ================================================================

  storage_zones: defineTable({
    branchId: v.id("branches"),
    name: v.string(),
    path: v.string(), // ltree as string
    zoneTypeId: v.id("system_lookups"),
    storageBlockType: v.string(),
    zoneAttributes: v.optional(v.any()), // jsonb
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("branchId", ["branchId"])
    .index("zoneTypeId", ["zoneTypeId"])
    .index("isDeleted", ["isDeleted"]),

  // ================================================================
  // PURCHASE ORDER MANAGEMENT
  // ================================================================

  purchase_orders: defineTable({
    organizationId: v.id("organizations"),
    branchId: v.id("branches"),
    code: v.string(),
    supplierId: v.id("suppliers"),
    orderedAt: v.number(),
    expectedDeliveryAt: v.optional(v.number()),
    createdByUserId: v.id("users"),
    purchaseOrderStatusTypeId: v.id("system_lookups"),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("organizationId", ["organizationId"])
    .index("branchId", ["branchId"])
    .index("code", ["code"])
    .index("supplierId", ["supplierId"])
    .index("purchaseOrderStatusTypeId", ["purchaseOrderStatusTypeId"])
    .index("isDeleted", ["isDeleted"]),

  purchase_order_details: defineTable({
    purchaseOrderId: v.id("purchase_orders"),
    skuId: v.id("product_variants"),
    quantityOrdered: v.number(),
    unitCost: v.number(),
    quantityReceived: v.number(),
  })
    .index("purchaseOrderId", ["purchaseOrderId"])
    .index("skuId", ["skuId"]),

  // ================================================================
  // WORK SESSIONS
  // ================================================================

  work_sessions: defineTable({
    organizationId: v.id("organizations"),
    branchId: v.id("branches"),
    sessionTypeId: v.id("system_lookups"),
    sessionCode: v.string(),
    assignedUserId: v.id("users"),
    sessionStatusTypeId: v.id("system_lookups"),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    verifiedAt: v.optional(v.number()),
    verifiedByUserId: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
    purchaseOrderId: v.optional(v.id("purchase_orders")),
    outboundOrderId: v.optional(v.id("outbound_orders")),
    transferOrderId: v.optional(v.id("transfer_orders")),
  })
    .index("organizationId", ["organizationId"])
    .index("branchId", ["branchId"])
    .index("sessionCode", ["sessionCode"])
    .index("assignedUserId", ["assignedUserId"])
    .index("sessionStatusTypeId", ["sessionStatusTypeId"])
    .index("purchaseOrderId", ["purchaseOrderId"])
    .index("outboundOrderId", ["outboundOrderId"])
    .index("transferOrderId", ["transferOrderId"]),

  session_line_items: defineTable({
    sessionId: v.id("work_sessions"),
    skuId: v.id("product_variants"),
    expectedQuantity: v.number(),
    actualQuantity: v.number(),
    zoneId: v.optional(v.id("storage_zones")),
    batchId: v.optional(v.id("inventory_batches")),
    scannedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("sessionId", ["sessionId"])
    .index("skuId", ["skuId"])
    .index("batchId", ["batchId"]),

  session_metrics: defineTable({
    sessionId: v.id("work_sessions"),
    totalTimeSeconds: v.number(),
    totalItemsProcessed: v.number(),
    accuracyRate: v.number(),
    calculatedAt: v.number(),
  }).index("sessionId", ["sessionId"]),

  // ================================================================
  // INVENTORY TRACKING
  // ================================================================

  inventory_batches: defineTable({
    organizationId: v.id("organizations"),
    skuId: v.id("product_variants"),
    zoneId: v.id("storage_zones"),
    quantity: v.number(),
    supplierBatchNumber: v.optional(v.string()),
    internalBatchNumber: v.optional(v.string()),
    receivedAt: v.optional(v.number()),
    manufacturingDate: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    batchStatusTypeId: v.id("system_lookups"),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("organizationId", ["organizationId"])
    .index("skuId", ["skuId"])
    .index("zoneId", ["zoneId"])
    .index("batchStatusTypeId", ["batchStatusTypeId"])
    .index("isDeleted", ["isDeleted"]),

  serial_numbers: defineTable({
    organizationId: v.id("organizations"),
    serialNumber: v.string(),
    skuId: v.id("product_variants"),
    batchId: v.optional(v.id("inventory_batches")),
    zoneId: v.optional(v.id("storage_zones")),
    serialStatusTypeId: v.id("system_lookups"),
    warrantyExpiresAt: v.optional(v.number()),
    purchaseOrderId: v.optional(v.id("purchase_orders")),
  })
    .index("organizationId", ["organizationId"])
    .index("serialNumber", ["serialNumber"])
    .index("skuId", ["skuId"])
    .index("batchId", ["batchId"])
    .index("serialStatusTypeId", ["serialStatusTypeId"]),

  inventory_transactions: defineTable({
    organizationId: v.id("organizations"),
    batchId: v.optional(v.id("inventory_batches")),
    serialNumberId: v.optional(v.id("serial_numbers")),
    quantityBefore: v.number(),
    quantityChange: v.number(),
    quantityAfter: v.number(),
    inventoryTransactionTypeId: v.id("system_lookups"),
    createdByUserId: v.id("users"),
    notes: v.optional(v.string()),
    purchaseOrderDetailId: v.optional(v.id("purchase_order_details")),
    transferOrderDetailId: v.optional(v.id("transfer_order_details")),
    workSessionId: v.optional(v.id("work_sessions")),
    adjustmentRequestDetailId: v.optional(v.id("adjustment_request_details")),
    outboundOrderDetailId: v.optional(v.id("outbound_order_details")),
  })
    .index("organizationId", ["organizationId"])
    .index("batchId", ["batchId"])
    .index("serialNumberId", ["serialNumberId"])
    .index("inventoryTransactionTypeId", ["inventoryTransactionTypeId"])
    .index("createdByUserId", ["createdByUserId"]),

  // ================================================================
  // OUTBOUND OPERATIONS
  // ================================================================

  outbound_orders: defineTable({
    organizationId: v.id("organizations"),
    branchId: v.id("branches"),
    orderCode: v.string(),
    orderDate: v.number(),
    requestedShipDate: v.optional(v.number()),
    trackingNumber: v.optional(v.string()),
    createdByUserId: v.id("users"),
    outboundStatusTypeId: v.id("system_lookups"),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("organizationId", ["organizationId"])
    .index("branchId", ["branchId"])
    .index("orderCode", ["orderCode"])
    .index("outboundStatusTypeId", ["outboundStatusTypeId"])
    .index("isDeleted", ["isDeleted"]),

  outbound_order_details: defineTable({
    outboundOrderId: v.id("outbound_orders"),
    skuId: v.id("product_variants"),
    quantityRequested: v.number(),
    quantityPicked: v.number(),
    quantityPacked: v.number(),
  })
    .index("outboundOrderId", ["outboundOrderId"])
    .index("skuId", ["skuId"]),

  // ================================================================
  // INVENTORY ADJUSTMENTS
  // ================================================================

  adjustment_requests: defineTable({
    organizationId: v.string(),
    branchId: v.string(),
    requestCode: v.string(),
    requestedByUserId: v.string(),
    requestedAt: v.number(),
    approvedByUserId: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    adjustmentStatusTypeId: v.string(),
    resolutionNotes: v.optional(v.string()),
  })
    .index("organizationId", ["organizationId"])
    .index("branchId", ["branchId"])
    .index("requestCode", ["requestCode"])
    .index("requestedByUserId", ["requestedByUserId"])
    .index("adjustmentStatusTypeId", ["adjustmentStatusTypeId"]),

  adjustment_request_details: defineTable({
    adjustmentRequestId: v.id("adjustment_requests"),
    batchId: v.string(),
    skuId: v.string(),
    expectedQuantity: v.number(),
    actualQuantity: v.number(),
    varianceQuantity: v.number(),
    costImpact: v.number(),
    reasonTypeId: v.string(),
    customReasonNotes: v.optional(v.string()),
  })
    .index("adjustmentRequestId", ["adjustmentRequestId"])
    .index("batchId", ["batchId"])
    .index("skuId", ["skuId"])
    .index("reasonTypeId", ["reasonTypeId"]),

  // ================================================================
  // SUPPLIER RETURNS
  // ================================================================

  return_requests: defineTable({
    organizationId: v.string(),
    branchId: v.string(),
    requestCode: v.string(),
    supplierId: v.string(),
    requestedByUserId: v.string(),
    requestedAt: v.number(),
    returnStatusTypeId: v.string(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("organizationId", ["organizationId"])
    .index("branchId", ["branchId"])
    .index("requestCode", ["requestCode"])
    .index("supplierId", ["supplierId"])
    .index("requestedByUserId", ["requestedByUserId"])
    .index("returnStatusTypeId", ["returnStatusTypeId"])
    .index("isDeleted", ["isDeleted"]),

  return_request_details: defineTable({
    returnRequestId: v.id("return_requests"),
    batchId: v.string(),
    skuId: v.string(),
    quantityToReturn: v.number(),
    reasonTypeId: v.string(),
    customReasonNotes: v.optional(v.string()),
    expectedCreditAmount: v.number(),
  })
    .index("returnRequestId", ["returnRequestId"])
    .index("batchId", ["batchId"])
    .index("skuId", ["skuId"])
    .index("reasonTypeId", ["reasonTypeId"]),

  // ================================================================
  // INTERNAL TRANSFERS
  // ================================================================

  transfer_orders: defineTable({
    organizationId: v.id("organizations"),
    transferCode: v.string(),
    sourceBranchId: v.id("branches"),
    destinationBranchId: v.id("branches"),
    createdByUserId: v.id("users"),
    expectedDeliveryAt: v.optional(v.number()),
    actualDeliveryAt: v.optional(v.number()),
    trackingNumber: v.optional(v.string()),
    transferStatusTypeId: v.id("system_lookups"),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("organizationId", ["organizationId"])
    .index("transferCode", ["transferCode"])
    .index("sourceBranchId", ["sourceBranchId"])
    .index("destinationBranchId", ["destinationBranchId"])
    .index("transferStatusTypeId", ["transferStatusTypeId"])
    .index("isDeleted", ["isDeleted"]),

  transfer_order_details: defineTable({
    transferOrderId: v.id("transfer_orders"),
    skuId: v.id("product_variants"),
    quantityRequested: v.number(),
    quantityShipped: v.number(),
    quantityReceived: v.number(),
  })
    .index("transferOrderId", ["transferOrderId"])
    .index("skuId", ["skuId"]),

  // ================================================================
  // NOTIFICATIONS & ALERTS
  // ================================================================

  notifications: defineTable({
    organizationId: v.id("organizations"),
    notificationCategoryTypeId: v.id("system_lookups"),
    notificationType: v.string(),
    recipientUserId: v.id("users"),
    title: v.string(),
    message: v.string(),
    priorityTypeId: v.id("system_lookups"),
    actionUrl: v.optional(v.string()),
    relatedEntityType: v.optional(v.string()),
    relatedEntityId: v.optional(v.number()),
    readAt: v.optional(v.number()),
    dismissedAt: v.optional(v.number()),
  })
    .index("organizationId", ["organizationId"])
    .index("recipientUserId", ["recipientUserId"])
    .index("notificationCategoryTypeId", ["notificationCategoryTypeId"])
    .index("readAt", ["readAt"]),

  // ================================================================
  // REPORTING & ANALYTICS
  // ================================================================

  demand_forecasts: defineTable({
    organizationId: v.id("organizations"),
    skuId: v.id("product_variants"),
    forecastDate: v.number(),
    forecastTypeId: v.id("system_lookups"),
    predictedDemand: v.number(),
    confidenceInterval: v.number(),
    calculationMethod: v.string(),
  })
    .index("organizationId", ["organizationId"])
    .index("skuId", ["skuId"])
    .index("forecastDate", ["forecastDate"]),

  report_templates: defineTable({
    organizationId: v.id("organizations"),
    templateName: v.string(),
    description: v.string(),
    ownerUserId: v.id("users"),
    templateConfig: v.any(), // jsonb
    sharingScopeTypeId: v.id("system_lookups"),
  })
    .index("organizationId", ["organizationId"])
    .index("ownerUserId", ["ownerUserId"]),

  // ================================================================
  // ATTACHMENTS & DOCUMENTS
  // ================================================================

  attachments: defineTable({
    organizationId: v.id("organizations"),
    fileName: v.string(),
    filePath: v.string(),
    fileSizeBytes: v.number(),
    mimeType: v.string(),
    uploadedByUserId: v.id("users"),
    uploadedAt: v.number(),
    entityType: v.string(),
    entityId: v.number(),
    notes: v.optional(v.string()),
  })
    .index("organizationId", ["organizationId"])
    .index("uploadedByUserId", ["uploadedByUserId"])
    .index("entityType_entityId", ["entityType", "entityId"]),

  // ================================================================
  // AUDIT & COMPLIANCE
  // ================================================================

  audit_logs: defineTable({
    organizationId: v.id("organizations"),
    userId: v.optional(v.id("users")),
    actionTypeId: v.id("system_lookups"),
    entityType: v.string(),
    entityId: v.optional(v.number()),
    fieldName: v.optional(v.string()),
    oldValue: v.optional(v.any()), // jsonb
    newValue: v.optional(v.any()), // jsonb
    ipAddress: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("organizationId", ["organizationId"])
    .index("userId", ["userId"])
    .index("actionTypeId", ["actionTypeId"])
    .index("entityType_entityId", ["entityType", "entityId"]),

  // ================================================================
  // SYSTEM LOOKUPS
  // ================================================================

  system_lookups: defineTable({
    lookupType: v.string(),
    lookupCode: v.string(),
    lookupValue: v.string(),
    description: v.string(),
    sortOrder: v.number(),
  })
    .index("lookupType", ["lookupType"])
    .index("lookupType_lookupCode", ["lookupType", "lookupCode"]),
});

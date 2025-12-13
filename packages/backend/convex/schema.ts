import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  brands: defineTable({
    organizationId: v.string(),
    name: v.string(),
    isActive: v.boolean(),
  })
    .index("organizationId", ["organizationId"])
    .index("isActive", ["isActive"]),

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
});

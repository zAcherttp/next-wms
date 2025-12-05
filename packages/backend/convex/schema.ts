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
  numbers: defineTable({
    value: v.number(),
  }),
});

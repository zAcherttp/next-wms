import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByBranch = query({
  args: { branchId: v.id("branches"), includeDeleted: v.boolean() },
  handler: async (ctx, { branchId, includeDeleted }) => {
    const zones = await ctx.db
      .query("storage_zones")
      .withIndex("branchId", (q) => q.eq("branchId", branchId))
      .collect();
    
    if (includeDeleted) {
      return zones;
    }
    
    return zones.filter((zone) => !zone.isDeleted);
  },
});

export const create = mutation({
  args: {
    branchId: v.id("branches"),
    parentId: v.optional(v.id("storage_zones")),
    name: v.string(),
    path: v.string(),
    storageBlockType: v.string(),
    zoneAttributes: v.record(v.string(), v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("storage_zones", {
      ...args,
      isDeleted: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("storage_zones"),
    name: v.optional(v.string()),
    zoneTypeId: v.optional(v.id("system_lookups")),
    zoneAttributes: v.record(v.string(), v.any()),
  },
  handler: async (ctx, { id, zoneAttributes, name, zoneTypeId }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Entity not found");
    
    await ctx.db.patch(id, {
      zoneAttributes,
      zoneTypeId,
      name,
    });
  },
});

export const softDelete = mutation({
  args: { id: v.id("storage_zones") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { isDeleted: true, deletedAt: Date.now() });
  },
});

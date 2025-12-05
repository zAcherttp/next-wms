import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const getPaginatedBrands = query({
  args: {
    paginationOtps: paginationOptsValidator,
  },
  handler: async ({ db }, args) => {
    const brands = await db
      .query("brands")
      .order("desc")
      .paginate(args.paginationOtps);
    return brands;
  },
});

export const createBrand = mutation({
  args: {
    organizationId: v.string(),
    name: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { organizationId, name, isActive } = args;
    return await ctx.db.insert("brands", {
      organizationId,
      name,
      isActive,
    });
  },
});

export const deleteBrand = mutation({
  args: {
    brandId: v.string(),
  },
  handler: async (ctx, args) => {
    const { brandId } = args;
    await ctx.db.delete(brandId as Id<"brands">);
    return { success: true };
  },
});

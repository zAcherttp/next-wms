import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllBrands = query({
  handler: async ({ db }) => {
    return await db.query("brands").collect();
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
    await ctx.db.delete(brandId);
    return { success: true };
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get product variants by supplier (brand)
 * Returns productId, variant details, and product name for display
 */
export const getProductVariantsBySupplier = query({
  args: {
    supplierId: v.id("suppliers"),
  },
  handler: async (ctx, args) => {
    // Get all products for this brand/supplier
    const supplier = await ctx.db
      .query("suppliers")
      .filter((q) => q.eq(q.field("_id"), args.supplierId))
      .first();

    if (!supplier) {
      return [];
    }
    const brandId = supplier.brandId;

    const products = await ctx.db
      .query("products")
      .withIndex("brandId", (q) => q.eq("brandId", brandId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    // Get variants for each product
    const variantsWithDetails = [];
    for (const product of products) {
      const variants = await ctx.db
        .query("product_variants")
        .withIndex("productId", (q) => q.eq("productId", product._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .collect();

      for (const variant of variants) {
        variantsWithDetails.push({
          variantId: variant._id,
          productId: product._id,
          productName: product.name,
          skuCode: variant.skuCode,
          description: variant.description,
          costPrice: variant.costPrice,
          sellingPrice: variant.sellingPrice,
          unitOfMeasureId: variant.unitOfMeasureId,
        });
      }
    }

    return variantsWithDetails;
  },
});

/**
 * Create a new purchase order
 */
export const createPurchaseOrder = mutation({
  args: {
    receivingBranchId: v.id("branches"),
    userId: v.id("users"),
    supplierId: v.id("suppliers"),
    note: v.optional(v.string()),
    items: v.array(
      v.object({
        variantId: v.id("product_variants"),
        quantity: v.number(),
        unitPrice: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Authenticate user

    // Validate items array is not empty
    if (!args.items || args.items.length === 0) {
      throw new Error("Purchase order must contain at least one item");
    }

    // Validate quantities are positive
    for (const item of args.items) {
      if (item.quantity <= 0) {
        throw new Error("Item quantity must be greater than 0");
      }
      if (item.unitPrice < 0) {
        throw new Error("Unit price cannot be negative");
      }
    }

    // Get branch to verify it exists and get organizationId
    const branch = await ctx.db.get(args.receivingBranchId);
    if (!branch) {
      throw new Error("Branch not found");
    }

    // Verify supplier exists
    const supplier = await ctx.db.get(args.supplierId);
    if (!supplier) {
      throw new Error("Supplier not found");
    }

    // Get the "Pending" status from system_lookups
    const pendingStatus = await ctx.db
      .query("system_lookups")
      .filter((q) =>
        q.and(
          q.eq(q.field("lookupType"), "PurchaseOrderStatus"),
          q.eq(q.field("lookupValue"), "Pending")
        )
      )
      .first();

    if (!pendingStatus) {
      throw new Error("Pending status not found in system lookups");
    }

    // Generate purchase order code (format: PO-YYYYMMDD-XXXX)
    const now = Date.now();
    const date = new Date(now);
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");

    // Get count of orders today to generate sequence number
    const startOfDay = new Date(date.setHours(0, 0, 0, 0)).getTime();
    const endOfDay = new Date(date.setHours(23, 59, 59, 999)).getTime();

    const todayOrders = await ctx.db
      .query("purchase_orders")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", branch.organizationId)
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("orderedAt"), startOfDay),
          q.lte(q.field("orderedAt"), endOfDay)
        )
      )
      .collect();

    const sequence = (todayOrders.length + 1).toString().padStart(4, "0");
    const code = `PO-${dateStr}-${sequence}`;

    // Calculate expected delivery date (use supplier's default lead time)
    const expectedDeliveryAt =
      now + supplier.defaultLeadTimeDays * 24 * 60 * 60 * 1000;

    // Insert purchase order
    const orderId = await ctx.db.insert("purchase_orders", {
      organizationId: branch.organizationId,
      branchId: args.receivingBranchId,
      code,
      supplierId: args.supplierId,
      orderedAt: now,
      expectedDeliveryAt,
      createdByUserId: args.userId,
      purchaseOrderStatusTypeId: pendingStatus._id,
      isDeleted: false,
    });

    // Insert purchase order details for each item
    for (const item of args.items) {
      await ctx.db.insert("purchase_order_details", {
        purchaseOrderId: orderId,
        skuId: item.variantId,
        quantityOrdered: item.quantity,
        unitCost: item.unitPrice,
        quantityReceived: 0,
      });
    }

    return {
      success: true,
      orderId,
      code,
    };
  },
});

/**
 * Get all purchase orders for an organization
 */
export const listPurchaseOrders = query({
  args: {
    branchId: v.id("branches"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("purchase_orders")
      .withIndex("branchId", (q) => q.eq("branchId", args.branchId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .collect();

    // Enrich with supplier and branch names
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const supplier = await ctx.db.get(order.supplierId);
        const branch = await ctx.db.get(order.branchId);
        const status = await ctx.db.get(order.purchaseOrderStatusTypeId);

        return {
          ...order,
          supplierName: supplier?.name ?? "Unknown",
          branchName: branch?.name ?? "Unknown",
          statusName: status?.lookupValue ?? "Unknown",
        };
      })
    );

    return enrichedOrders;
  },
});

/**
 * Get purchase order details by ID
 */
export const getPurchaseOrderById = query({
  args: {
    orderId: v.id("purchase_orders"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Purchase order not found");
    }

    // Get order details
    const details = await ctx.db
      .query("purchase_order_details")
      .withIndex("purchaseOrderId", (q) =>
        q.eq("purchaseOrderId", args.orderId)
      )
      .collect();

    // Enrich details with product information
    const enrichedDetails = await Promise.all(
      details.map(async (detail) => {
        const variant = await ctx.db.get(detail.skuId);
        if (!variant) {
          return {
            ...detail,
            productName: "Unknown",
            skuCode: "Unknown",
          };
        }

        const product = await ctx.db.get(variant.productId);

        return {
          ...detail,
          productName: product?.name ?? "Unknown",
          skuCode: variant.skuCode,
          description: variant.description,
        };
      })
    );

    // Get related entities
    const supplier = await ctx.db.get(order.supplierId);
    const branch = await ctx.db.get(order.branchId);
    const status = await ctx.db.get(order.purchaseOrderStatusTypeId);

    return {
      ...order,
      supplierName: supplier?.name ?? "Unknown",
      branchName: branch?.name ?? "Unknown",
      statusName: status?.lookupValue ?? "Unknown",
      items: enrichedDetails,
    };
  },
});

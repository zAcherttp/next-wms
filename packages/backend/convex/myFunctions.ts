import { makeFunctionReference } from "convex/server";
import { internalAction, query } from "./_generated/server";

const LOW_STOCK_THRESHOLD = 10;
const clearAllTestData = makeFunctionReference<
  "mutation",
  Record<string, never>,
  { totalDeleted: number }
>("seedMockData:clearAllTestData");
const seedAllTestData = makeFunctionReference<
  "mutation",
  Record<string, never>,
  { summary: Record<string, number | string> }
>("seedMockData:seedAllTestData");

/** Public, read-only snapshot used by the evaluator demo. */
export const getDemoSnapshot = query({
  args: {},
  handler: async (ctx) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("isDeleted", (q) => q.eq("isDeleted", false))
      .first();

    if (!organization) {
      return {
        ready: false as const,
        lastResetAt: null,
        organization: null,
        branch: null,
        metrics: {
          onHand: 0,
          activeSkus: 0,
          lowStock: 0,
          openInbound: 0,
          openOutbound: 0,
          inventoryValue: 0,
        },
        topInventory: [],
        recentActivity: [],
      };
    }

    const branch = await ctx.db
      .query("branches")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", organization._id),
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .first();

    if (!branch) {
      return {
        ready: false as const,
        lastResetAt: organization._creationTime,
        organization: {
          name: organization.name,
          slug: organization.slug,
        },
        branch: null,
        metrics: {
          onHand: 0,
          activeSkus: 0,
          lowStock: 0,
          openInbound: 0,
          openOutbound: 0,
          inventoryValue: 0,
        },
        topInventory: [],
        recentActivity: [],
      };
    }

    const [batches, purchaseOrders, outboundOrders, receiveSessions] =
      await Promise.all([
        ctx.db
          .query("inventory_batches")
          .withIndex("branchId", (q) => q.eq("branchId", branch._id))
          .filter((q) => q.eq(q.field("isDeleted"), false))
          .collect(),
        ctx.db
          .query("purchase_orders")
          .withIndex("branchId", (q) => q.eq("branchId", branch._id))
          .filter((q) => q.eq(q.field("isDeleted"), false))
          .collect(),
        ctx.db
          .query("outbound_orders")
          .withIndex("branchId", (q) => q.eq("branchId", branch._id))
          .filter((q) => q.eq(q.field("isDeleted"), false))
          .collect(),
        ctx.db
          .query("receive_sessions")
          .withIndex("branchId", (q) => q.eq("branchId", branch._id))
          .collect(),
      ]);

    const variants = await Promise.all(
      batches.map((batch) => ctx.db.get(batch.skuId)),
    );
    const products = await Promise.all(
      variants.map((variant) =>
        variant ? ctx.db.get(variant.productId) : Promise.resolve(null),
      ),
    );

    const onHand = batches.reduce((sum, batch) => sum + batch.quantity, 0);
    const inventoryValue = batches.reduce(
      (sum, batch, index) =>
        sum + batch.quantity * (variants[index]?.costPrice ?? 0),
      0,
    );
    const activeSkus = new Set(batches.map((batch) => batch.skuId)).size;
    const lowStock = batches.filter(
      (batch) => batch.quantity <= LOW_STOCK_THRESHOLD,
    ).length;

    const topInventory = batches
      .map((batch, index) => ({
        id: batch._id,
        sku: variants[index]?.skuCode ?? "Unknown SKU",
        product: products[index]?.name ?? "Unknown product",
        quantity: batch.quantity,
        value: batch.quantity * (variants[index]?.costPrice ?? 0),
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);

    const recentActivity = [
      ...purchaseOrders.map((order) => ({
        id: order._id,
        type: "Inbound" as const,
        code: order.code,
        at: order.orderedAt,
        detail: "Purchase order created",
      })),
      ...outboundOrders.map((order) => ({
        id: order._id,
        type: "Outbound" as const,
        code: order.orderCode,
        at: order.orderDate,
        detail: "Outbound order queued",
      })),
      ...receiveSessions.map((session) => ({
        id: session._id,
        type: "Receiving" as const,
        code: session.receiveSessionCode,
        at: session.receivedAt,
        detail: "Receiving session updated",
      })),
    ]
      .sort((a, b) => b.at - a.at)
      .slice(0, 7);

    return {
      ready: true as const,
      lastResetAt: organization._creationTime,
      organization: {
        name: organization.name,
        slug: organization.slug,
      },
      branch: {
        name: branch.name,
        address: branch.address,
      },
      metrics: {
        onHand,
        activeSkus,
        lowStock,
        openInbound: purchaseOrders.length,
        openOutbound: outboundOrders.length,
        inventoryValue,
      },
      topInventory,
      recentActivity,
    };
  },
});

/** Clears and reseeds only application tables. Better Auth data is preserved. */
export const resetDemoData = internalAction({
  args: {},
  handler: async (ctx) => {
    const cleared = await ctx.runMutation(clearAllTestData, {});
    const seeded = await ctx.runMutation(seedAllTestData, {});

    return {
      cleared: cleared.totalDeleted,
      seeded: seeded.summary,
      completedAt: Date.now(),
    };
  },
});

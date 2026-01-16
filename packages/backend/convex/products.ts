/**
 * PRODUCTS API - UC2
 *
 * WHO CAN USE:
 * ✅ Warehouse Manager - full CRUD
 * ✅ Inventory Manager - full CRUD
 * ✅ Admin - full CRUD
 * ⚠️ Staff - read only
 *
 * NOTES:
 * - Products have variants (SKU level)
 * - Each variant can have multiple barcodes
 * - Product belongs to a category and brand
 * - Soft delete supported
 *
 * BEST PRACTICES:
 * - Always include variants when creating products
 * - Use pagination for product lists
 * - Search across product name, SKU, and barcode
 * - Track reorder points for inventory management
 */

import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

/**
 * LIST - Get all products with pagination and filters
 */
export const list = query({
  args: {
    organizationId: v.id("organizations"),
    paginationOpts: paginationOptsValidator,
    categoryId: v.optional(v.id("categories")),
    brandId: v.optional(v.id("brands")),
    isActive: v.optional(v.boolean()),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const {
      organizationId,
      paginationOpts,
      categoryId,
      brandId,
      isActive,
      includeDeleted = false,
    } = args;

    let queryBuilder = ctx.db
      .query("products")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", organizationId),
      );

    // Apply filters
    if (categoryId) {
      queryBuilder = queryBuilder.filter((q) =>
        q.eq(q.field("categoryId"), categoryId),
      );
    }

    if (brandId) {
      queryBuilder = queryBuilder.filter((q) =>
        q.eq(q.field("brandId"), brandId),
      );
    }

    if (isActive !== undefined) {
      queryBuilder = queryBuilder.filter((q) =>
        q.eq(q.field("isActive"), isActive),
      );
    }

    if (!includeDeleted) {
      queryBuilder = queryBuilder.filter((q) =>
        q.eq(q.field("isDeleted"), false),
      );
    }

    const products = await queryBuilder.order("desc").paginate(paginationOpts);

    return products;
  },
});

/**
 * LIST WITH DETAILS - Get all products with category, brand, variants info (no pagination)
 */
export const listWithDetails = query({
  args: {
    organizationId: v.id("organizations"),
    categoryId: v.optional(v.id("categories")),
    brandId: v.optional(v.id("brands")),
    isActive: v.optional(v.boolean()),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const {
      organizationId,
      categoryId,
      brandId,
      isActive,
      includeDeleted = false,
    } = args;

    let queryBuilder = ctx.db
      .query("products")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", organizationId),
      );

    // Apply filters
    if (categoryId) {
      queryBuilder = queryBuilder.filter((q) =>
        q.eq(q.field("categoryId"), categoryId),
      );
    }

    if (brandId) {
      queryBuilder = queryBuilder.filter((q) =>
        q.eq(q.field("brandId"), brandId),
      );
    }

    if (isActive !== undefined) {
      queryBuilder = queryBuilder.filter((q) =>
        q.eq(q.field("isActive"), isActive),
      );
    }

    if (!includeDeleted) {
      queryBuilder = queryBuilder.filter((q) =>
        q.eq(q.field("isDeleted"), false),
      );
    }

    const products = await queryBuilder.order("desc").collect();

    // Enrich products with related data
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        // Get category
        const category = await ctx.db.get(product.categoryId);

        // Get brand
        const brand = await ctx.db.get(product.brandId);

        // Get storage requirement type
        const storageRequirement = await ctx.db.get(
          product.storageRequirementTypeId,
        );

        // Get tracking method type
        const trackingMethod = await ctx.db.get(product.trackingMethodTypeId);

        // Get variants with barcodes
        const variants = await ctx.db
          .query("product_variants")
          .withIndex("productId", (q) => q.eq("productId", product._id))
          .filter((q) => q.eq(q.field("isDeleted"), false))
          .collect();

        const variantsWithDetails = await Promise.all(
          variants.map(async (variant) => {
            // Get barcodes
            const barcodes = await ctx.db
              .query("product_barcodes")
              .withIndex("skuId", (q) => q.eq("skuId", variant._id))
              .collect();

            // Get barcode types
            const barcodesWithTypes = await Promise.all(
              barcodes.map(async (barcode) => {
                const barcodeType = await ctx.db.get(barcode.barcodeTypeId);
                return {
                  ...barcode,
                  barcodeType: barcodeType
                    ? {
                        _id: barcodeType._id,
                        lookupValue: barcodeType.lookupValue,
                        lookupCode: barcodeType.lookupCode,
                      }
                    : null,
                };
              }),
            );

            // Get unit of measure
            const unitOfMeasure = await ctx.db.get(variant.unitOfMeasureId);

            return {
              ...variant,
              barcodes: barcodesWithTypes,
              unitOfMeasure: unitOfMeasure
                ? {
                    _id: unitOfMeasure._id,
                    lookupValue: unitOfMeasure.lookupValue,
                    lookupCode: unitOfMeasure.lookupCode,
                  }
                : null,
            };
          }),
        );

        return {
          ...product,
          category: category
            ? {
                _id: category._id,
                name: category.name,
                path: category.path,
              }
            : null,
          brand: brand
            ? {
                _id: brand._id,
                name: brand.name,
              }
            : null,
          storageRequirement: storageRequirement
            ? {
                _id: storageRequirement._id,
                lookupValue: storageRequirement.lookupValue,
                lookupCode: storageRequirement.lookupCode,
              }
            : null,
          trackingMethod: trackingMethod
            ? {
                _id: trackingMethod._id,
                lookupValue: trackingMethod.lookupValue,
                lookupCode: trackingMethod.lookupCode,
              }
            : null,
          variants: variantsWithDetails,
        };
      }),
    );

    return enrichedProducts;
  },
});

/**
 * GET - Get a single product by ID
 */
export const get = query({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.isDeleted) {
      throw new Error("Product has been deleted");
    }

    return product;
  },
});

/**
 * GET WITH DETAILS - Get product with category, brand, and variants
 */
export const getWithDetails = query({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.isDeleted) {
      throw new Error("Product has been deleted");
    }

    // Get category
    const category = await ctx.db.get(product.categoryId);

    // Get brand
    const brand = await ctx.db.get(product.brandId);

    // Get variants
    const variants = await ctx.db
      .query("product_variants")
      .withIndex("productId", (q) => q.eq("productId", args.id))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    // Get barcodes for each variant
    const variantsWithBarcodes = await Promise.all(
      variants.map(async (variant) => {
        const barcodes = await ctx.db
          .query("product_barcodes")
          .withIndex("skuId", (q) => q.eq("skuId", variant._id))
          .collect();
        return { ...variant, barcodes };
      }),
    );

    return {
      ...product,
      category,
      brand,
      variants: variantsWithBarcodes,
    };
  },
});

/**
 * SEARCH - Search products by name or SKU
 */
export const search = query({
  args: {
    organizationId: v.id("organizations"),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { organizationId, searchTerm, limit = 20 } = args;

    // Search in products
    const products = await ctx.db
      .query("products")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", organizationId),
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    const searchLower = searchTerm.toLowerCase();
    const matchedProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower),
    );

    // Search in variants (by SKU)
    const variants = await ctx.db.query("product_variants").collect();
    const matchedVariants = variants.filter(
      (variant) =>
        variant.skuCode.toLowerCase().includes(searchLower) &&
        !variant.isDeleted,
    );

    // Get products from matched variants
    const productIdsFromVariants = new Set(
      matchedVariants.map((v) => v.productId),
    );
    const productsFromVariants = products.filter((p) =>
      productIdsFromVariants.has(p._id),
    );

    // Combine and deduplicate
    const allMatched = [...matchedProducts, ...productsFromVariants];
    const uniqueProducts = Array.from(
      new Map(allMatched.map((p) => [p._id, p])).values(),
    ).slice(0, limit);

    return uniqueProducts;
  },
});

/**
 * SEARCH BY BARCODE - Find product by barcode value
 */
export const searchByBarcode = query({
  args: {
    barcodeValue: v.string(),
  },
  handler: async (ctx, args) => {
    const barcode = await ctx.db
      .query("product_barcodes")
      .withIndex("barcodeValue", (q) => q.eq("barcodeValue", args.barcodeValue))
      .first();

    if (!barcode) {
      return null;
    }

    // Get variant
    const variant = await ctx.db.get(barcode.skuId);
    if (!variant || variant.isDeleted) {
      return null;
    }

    // Get product
    const product = await ctx.db.get(variant.productId);
    if (!product || product.isDeleted) {
      return null;
    }

    return {
      product,
      variant,
      barcode,
    };
  },
});

// ============================================================================
// PRODUCT MUTATIONS
// ============================================================================

/**
 * CREATE - Create a new product with variants
 * Permission required: products:create
 */
export const create = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.string(),
    categoryId: v.id("categories"),
    brandId: v.id("brands"),
    storageRequirementTypeId: v.id("system_lookups"),
    trackingMethodTypeId: v.id("system_lookups"),
    shelfLifeDays: v.optional(v.number()),
    reorderPoint: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // TODO: Add permission check
    // const identity = await ctx.auth.getUserIdentity();

    const {
      organizationId,
      name,
      description,
      categoryId,
      brandId,
      storageRequirementTypeId,
      trackingMethodTypeId,
      shelfLifeDays,
      reorderPoint,
      isActive = true,
    } = args;

    // Validate category exists
    const category = await ctx.db.get(categoryId);
    if (!category || category.isDeleted) {
      throw new Error("Category not found or deleted");
    }

    // Validate brand exists
    const brand = await ctx.db.get(brandId);
    if (!brand) {
      throw new Error("Brand not found");
    }

    // Check duplicate name
    const existing = await ctx.db
      .query("products")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", organizationId),
      )
      .filter((q) => q.eq(q.field("name"), name))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .first();

    if (existing) {
      throw new Error("Product with this name already exists");
    }

    const productId = await ctx.db.insert("products", {
      organizationId,
      name,
      description,
      categoryId,
      brandId,
      storageRequirementTypeId,
      trackingMethodTypeId,
      shelfLifeDays,
      reorderPoint,
      reorderPointOverride: undefined,
      isActive,
      isDeleted: false,
    });

    return productId;
  },
});

/**
 * UPDATE - Update an existing product
 * Permission required: products:update
 */
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    brandId: v.optional(v.id("brands")),
    storageRequirementTypeId: v.optional(v.id("system_lookups")),
    trackingMethodTypeId: v.optional(v.id("system_lookups")),
    shelfLifeDays: v.optional(v.number()),
    reorderPoint: v.optional(v.number()),
    reorderPointOverride: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // TODO: Add permission check

    const { id, name, categoryId, brandId, ...otherUpdates } = args;

    const product = await ctx.db.get(id);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.isDeleted) {
      throw new Error("Cannot update deleted product");
    }

    const updates: any = { ...otherUpdates };

    // Check name uniqueness if updating
    if (name !== undefined && name !== product.name) {
      const existing = await ctx.db
        .query("products")
        .withIndex("organizationId", (q) =>
          q.eq("organizationId", product.organizationId),
        )
        .filter((q) => q.eq(q.field("name"), name))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .first();

      if (existing) {
        throw new Error("Product with this name already exists");
      }

      updates.name = name;
    }

    // Validate category if updating
    if (categoryId !== undefined) {
      const category = await ctx.db.get(categoryId);
      if (!category || category.isDeleted) {
        throw new Error("Category not found or deleted");
      }
      updates.categoryId = categoryId;
    }

    // Validate brand if updating
    if (brandId !== undefined) {
      const brand = await ctx.db.get(brandId);
      if (!brand) {
        throw new Error("Brand not found");
      }
      updates.brandId = brandId;
    }

    await ctx.db.patch(id, updates);

    return id;
  },
});

/**
 * DELETE - Soft delete a product
 * Permission required: products:delete
 */
export const remove = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    // TODO: Add permission check

    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Soft delete product
    await ctx.db.patch(args.id, {
      isDeleted: true,
      deletedAt: Date.now(),
    });

    // Also soft delete all variants
    const variants = await ctx.db
      .query("product_variants")
      .withIndex("productId", (q) => q.eq("productId", args.id))
      .collect();

    for (const variant of variants) {
      await ctx.db.patch(variant._id, {
        isDeleted: true,
        deletedAt: Date.now(),
      });
    }

    return args.id;
  },
});

// ============================================================================
// PRODUCT VARIANT QUERIES & MUTATIONS
// ============================================================================

/**
 * GET VARIANTS - Get all variants of a product
 */
export const getVariants = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const variants = await ctx.db
      .query("product_variants")
      .withIndex("productId", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    return variants;
  },
});

/**
 * CREATE VARIANT - Add a new variant to a product
 * Permission required: products:create
 */
export const createVariant = mutation({
  args: {
    productId: v.id("products"),
    skuCode: v.string(),
    description: v.string(),
    costPrice: v.number(),
    sellingPrice: v.number(),
    unitOfMeasureId: v.id("system_lookups"),
    weightKg: v.optional(v.number()),
    volumeM3: v.optional(v.number()),
    temperatureSensitive: v.optional(v.boolean()),
    stackingLimit: v.optional(v.number()),
    customFields: v.optional(v.any()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // TODO: Add permission check

    const {
      productId,
      skuCode,
      temperatureSensitive = false,
      isActive = true,
      ...rest
    } = args;

    // Validate product exists
    const product = await ctx.db.get(productId);
    if (!product || product.isDeleted) {
      throw new Error("Product not found or deleted");
    }

    // Check SKU uniqueness
    const existing = await ctx.db
      .query("product_variants")
      .withIndex("skuCode", (q) => q.eq("skuCode", skuCode))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .first();

    if (existing) {
      throw new Error("SKU code already exists");
    }

    const variantId = await ctx.db.insert("product_variants", {
      productId,
      skuCode,
      temperatureSensitive,
      isActive,
      isDeleted: false,
      ...rest,
    });

    return variantId;
  },
});

/**
 * UPDATE VARIANT - Update a product variant
 */
export const updateVariant = mutation({
  args: {
    id: v.id("product_variants"),
    skuCode: v.optional(v.string()),
    description: v.optional(v.string()),
    costPrice: v.optional(v.number()),
    sellingPrice: v.optional(v.number()),
    unitOfMeasureId: v.optional(v.id("system_lookups")),
    weightKg: v.optional(v.number()),
    volumeM3: v.optional(v.number()),
    temperatureSensitive: v.optional(v.boolean()),
    stackingLimit: v.optional(v.number()),
    customFields: v.optional(v.any()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, skuCode, ...otherUpdates } = args;

    const variant = await ctx.db.get(id);
    if (!variant) {
      throw new Error("Variant not found");
    }

    if (variant.isDeleted) {
      throw new Error("Cannot update deleted variant");
    }

    const updates: any = { ...otherUpdates };

    // Check SKU uniqueness if updating
    if (skuCode !== undefined && skuCode !== variant.skuCode) {
      const existing = await ctx.db
        .query("product_variants")
        .withIndex("skuCode", (q) => q.eq("skuCode", skuCode))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .first();

      if (existing) {
        throw new Error("SKU code already exists");
      }

      updates.skuCode = skuCode;
    }

    await ctx.db.patch(id, updates);

    return id;
  },
});

/**
 * DELETE VARIANT - Soft delete a variant
 */
export const removeVariant = mutation({
  args: {
    id: v.id("product_variants"),
  },
  handler: async (ctx, args) => {
    const variant = await ctx.db.get(args.id);
    if (!variant) {
      throw new Error("Variant not found");
    }

    await ctx.db.patch(args.id, {
      isDeleted: true,
      deletedAt: Date.now(),
    });

    return args.id;
  },
});

// ============================================================================
// BARCODE MANAGEMENT
// ============================================================================

/**
 * ADD BARCODE - Add a barcode to a variant
 */
export const addBarcode = mutation({
  args: {
    skuId: v.id("product_variants"),
    barcodeTypeId: v.id("system_lookups"),
    barcodeValue: v.string(),
  },
  handler: async (ctx, args) => {
    const { skuId, barcodeTypeId, barcodeValue } = args;

    // Validate variant exists
    const variant = await ctx.db.get(skuId);
    if (!variant || variant.isDeleted) {
      throw new Error("Variant not found or deleted");
    }

    // Check barcode uniqueness
    const existing = await ctx.db
      .query("product_barcodes")
      .withIndex("barcodeValue", (q) => q.eq("barcodeValue", barcodeValue))
      .first();

    if (existing) {
      throw new Error("Barcode already exists");
    }

    const barcodeId = await ctx.db.insert("product_barcodes", {
      skuId,
      barcodeTypeId,
      barcodeValue,
    });

    return barcodeId;
  },
});

/**
 * REMOVE BARCODE - Delete a barcode
 */
export const removeBarcode = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id as Id<"product_barcodes">);
    return args.id;
  },
});

/**
 * GET BARCODES - Get all barcodes for a variant
 */
export const getBarcodes = query({
  args: {
    skuId: v.id("product_variants"),
  },
  handler: async (ctx, args) => {
    const barcodes = await ctx.db
      .query("product_barcodes")
      .withIndex("skuId", (q) => q.eq("skuId", args.skuId))
      .collect();

    return barcodes;
  },
});

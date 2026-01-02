import { mutation } from "./_generated/server";

/**
 * Seed mock data for testing purchase order endpoints
 * Run this once to populate the database with test data
 */
export const seedPurchaseOrderTestData = mutation({
  args: {},
  handler: async (ctx) => {
    // ================================================================
    // 1. SYSTEM LOOKUPS (Status types, unit of measure, etc.)
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

    // Tracking Method types
    const fifoTrackingId = await ctx.db.insert("system_lookups", {
      lookupType: "TrackingMethod",
      lookupCode: "FIFO",
      lookupValue: "FIFO",
      description: "First In First Out tracking",
      sortOrder: 1,
    });

    // ================================================================
    // 2. ORGANIZATION
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

    // ================================================================
    // 3. BRANCH
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

    // ================================================================
    // 4. USER
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

    // ================================================================
    // 5. BRANDS
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

    // ================================================================
    // 6. CATEGORIES
    // ================================================================

    const electronicsCategory = await ctx.db.insert("categories", {
      organizationId,
      name: "Electronics",
      path: "electronics",
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

    // ================================================================
    // 7. PRODUCTS
    // ================================================================

    const product1Id = await ctx.db.insert("products", {
      organizationId,
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with USB receiver",
      categoryId: electronicsCategory,
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
      categoryId: electronicsCategory,
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
      categoryId: electronicsCategory,
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
      categoryId: homeCategory,
      brandId: brand2Id,
      storageRequirementTypeId: normalStorageId,
      trackingMethodTypeId: fifoTrackingId,
      reorderPoint: 25,
      isActive: true,
      isDeleted: false,
    });

    // ================================================================
    // 8. PRODUCT VARIANTS (SKUs)
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

    // ================================================================
    // 9. SUPPLIERS
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

    // ================================================================
    // RETURN CREATED IDS FOR TESTING
    // ================================================================

    return {
      success: true,
      message: "Mock data seeded successfully!",
      ids: {
        // Organizations
        organizationId,

        // Branches
        branchId,
        branch2Id,

        // Users
        userId,
        adminUserId,

        // Brands
        brand1Id,
        brand2Id,

        // Categories
        electronicsCategory,
        homeCategory,

        // Products
        product1Id,
        product2Id,
        product3Id,
        product4Id,

        // Variants
        variant1Id,
        variant2Id,
        variant3Id,
        variant4Id,
        variant5Id,

        // Suppliers
        supplier1Id,
        supplier2Id,

        // System Lookups
        statuses: {
          pendingStatusId,
          approvedStatusId,
          receivedStatusId,
          cancelledStatusId,
        },
        unitOfMeasures: {
          unitPieceId,
          unitBoxId,
          unitKgId,
        },
      },
    };
  },
});

/**
 * Clear all test data (use with caution!)
 * This clears ONLY the tables used by the seed function above.
 */
export const clearPurchaseOrderTestData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete in reverse order of dependencies
    const tables = [
      "purchase_order_details",
      "purchase_orders",
      "product_variants",
      "products",
      "suppliers",
      "categories",
      "brands",
      "users",
      "branches",
      "organizations",
      "system_lookups",
    ] as const;

    let deletedCounts: Record<string, number> = {};

    for (const table of tables) {
      const records = await ctx.db.query(table).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
      deletedCounts[table] = records.length;
    }

    return {
      success: true,
      message: "All test data cleared!",
      deletedCounts,
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

      // Work Sessions
      "session_metrics",
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

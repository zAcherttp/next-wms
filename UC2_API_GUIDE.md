# UC2 API DOCUMENTATION - Backend Guide

## 📁 FILES CREATED

✅ `packages/backend/convex/categories.ts` - Categories API (9 functions)
✅ `packages/backend/convex/brands.ts` - Brands API (9 functions) 
✅ `packages/backend/convex/suppliers.ts` - Suppliers API (8 functions)
✅ `packages/backend/convex/products.ts` - Products API (17 functions)

---

## 🚀 GETTING STARTED

### Step 1: Run Backend

```bash
pnpm dev:backend
```

### Step 2: Test APIs on Convex Dashboard

Mở: https://dashboard.convex.dev/t/zacher/backend-91616/hushed-gopher-571

---

## 📋 API LIST FOR TRELLO

Copy danh sách này lên Trello để tracking:

### BRANDS (9 APIs)
- [ ] `brands.getPaginatedBrands` - List with pagination
- [ ] `brands.get` - Get single brand
- [ ] `brands.listAll` - Get all for dropdown
- [ ] `brands.createBrand` - Create new
- [ ] `brands.updateBrand` - Update existing
- [ ] `brands.deleteBrand` - Hard delete
- [ ] `brands.deactivateBrand` - Soft delete
- [ ] `brands.search` - Search by name

### CATEGORIES (9 APIs)
- [ ] `categories.list` - List with pagination
- [ ] `categories.get` - Get single category
- [ ] `categories.getByPath` - Get by hierarchical path
- [ ] `categories.getChildren` - Get direct children
- [ ] `categories.getTree` - Get full tree
- [ ] `categories.create` - Create new
- [ ] `categories.update` - Update existing
- [ ] `categories.remove` - Soft delete
- [ ] `categories.search` - Search by name

### SUPPLIERS (8 APIs)
- [ ] `suppliers.list` - List with pagination
- [ ] `suppliers.get` - Get single supplier
- [ ] `suppliers.getWithStats` - Get with PO statistics
- [ ] `suppliers.create` - Create new
- [ ] `suppliers.update` - Update existing
- [ ] `suppliers.remove` - Soft delete
- [ ] `suppliers.search` - Search by name/email
- [ ] `suppliers.getActive` - Get active only

### PRODUCTS (17 APIs)
- [ ] `products.list` - List with filters
- [ ] `products.get` - Get single product
- [ ] `products.getWithDetails` - Get with full details
- [ ] `products.search` - Search by name/SKU
- [ ] `products.searchByBarcode` - Find by barcode
- [ ] `products.create` - Create new product
- [ ] `products.update` - Update existing
- [ ] `products.remove` - Soft delete
- [ ] `products.getVariants` - Get all variants
- [ ] `products.createVariant` - Create new variant
- [ ] `products.updateVariant` - Update variant
- [ ] `products.removeVariant` - Delete variant
- [ ] `products.addBarcode` - Add barcode to variant
- [ ] `products.removeBarcode` - Remove barcode
- [ ] `products.getBarcodes` - Get all barcodes

---

## 🧪 HOW TO TEST APIS

### 1. Test trên Convex Dashboard

1. Vào Functions tab
2. Chọn function muốn test
3. Nhập args (JSON format)
4. Click Run

### Example: Test createBrand

```json
{
  "organizationId": "test-org-123",
  "name": "Nike",
  "isActive": true
}
```

### 2. Kiểm tra Data tab

- Xem data đã insert chưa
- Verify relationships (category → products → variants)

---

## 📝 API STRUCTURE & PATTERNS

### Query Pattern (READ - không thay đổi data)

```typescript
export const get = query({
  args: { id: v.id("table_name") },
  handler: async (ctx, args) => {
    // Business logic
    return result;
  },
});
```

### Mutation Pattern (WRITE - thay đổi data)

```typescript
export const create = mutation({
  args: { 
    organizationId: v.id("organizations"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Validation
    // Business logic
    return id;
  },
});
```

---

## 🎯 BEST PRACTICES ĐÃ IMPLEMENT

### 1. Pagination
- Dùng `paginationOptsValidator` của Convex
- Return `{ page, isDone, continueCursor }`

### 2. Soft Delete
- Dùng `isDeleted` flag + `deletedAt` timestamp
- Không xóa data khỏi database (trừ trường hợp đặc biệt)

### 3. Validation
- Check duplicate names/emails
- Validate foreign keys exist
- Validate business rules (e.g., can't delete if has children)

### 4. Search
- Case-insensitive
- Support partial match
- Limit results (default 20)

### 5. Stateless
- Mỗi API call độc lập
- Không dựa vào previous state

### 6. Error Handling
```typescript
if (!entity) {
  throw new Error("Entity not found");
}
```

---

## 🔐 PERMISSIONS (TODO)

Mỗi API đã có comment về permissions:

```typescript
/**
 * WHO CAN USE:
 * ✅ Warehouse Manager - full CRUD
 * ✅ Admin - full CRUD
 * ⚠️ Staff - read only
 */
```

**Cần implement:**

```typescript
// Thêm vào handler
const identity = await ctx.auth.getUserIdentity();
if (!hasPermission(identity, "brands:create")) {
  throw new Error("Unauthorized");
}
```

---

## 🔗 RELATIONSHIPS IN SCHEMA

```
organizations
    ↓
categories ← products → brands
              ↓
         product_variants
              ↓
         product_barcodes

organizations
    ↓
suppliers → purchase_orders
```

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "Cannot read property of undefined"
**Fix:** Check if entity exists before accessing properties
```typescript
const entity = await ctx.db.get(id);
if (!entity) throw new Error("Not found");
```

### Issue 2: "Duplicate key error"
**Fix:** Check uniqueness before insert
```typescript
const existing = await ctx.db.query("table").filter(...).first();
if (existing) throw new Error("Already exists");
```

### Issue 3: "Foreign key constraint"
**Fix:** Validate parent exists
```typescript
const parent = await ctx.db.get(parentId);
if (!parent) throw new Error("Parent not found");
```

---

## 📊 EXAMPLE TEST FLOW

### Test Complete Product Creation Flow:

```bash
# 1. Create Category
categories.create({
  organizationId: "org_123",
  name: "Electronics",
  parentPath: "",
  isActive: true
})

# 2. Create Brand
brands.createBrand({
  organizationId: "org_123",
  name: "Samsung",
  isActive: true
})

# 3. Create Product
products.create({
  organizationId: "org_123",
  name: "Samsung Galaxy S24",
  description: "Latest flagship phone",
  categoryId: "...", // từ step 1
  brandId: "...",    // từ step 2
  storageRequirementTypeId: "...",
  trackingMethodTypeId: "...",
  isActive: true
})

# 4. Create Variant
products.createVariant({
  productId: "...",  // từ step 3
  skuCode: "SGS24-128-BLK",
  description: "128GB Black",
  costPrice: 800,
  sellingPrice: 999,
  unitOfMeasureId: "...",
  isActive: true
})

# 5. Add Barcode
products.addBarcode({
  skuId: "...",      // từ step 4
  barcodeTypeId: "...",
  barcodeValue: "8801234567890"
})

# 6. Search Product
products.searchByBarcode({
  barcodeValue: "8801234567890"
})
```

---

## 🚧 BLOCKED ITEMS

Nếu thiếu field/table nào, ghi trên Trello:

**Format:**
```
❌ BLOCKED: products.create
Missing: system_lookups.storageRequirementTypeId
Tag: @PersonLamSystemLookups
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] Schema đã có đầy đủ
- [x] Categories API - 9 functions
- [x] Brands API - 9 functions  
- [x] Suppliers API - 8 functions
- [x] Products API - 17 functions
- [ ] Test tất cả APIs trên Convex Dashboard
- [ ] Ghi log lên Trello
- [ ] Implement permissions
- [ ] Test integration với frontend
- [ ] Code review

---

## 📞 NEXT STEPS

1. **Chạy backend**: `pnpm dev:backend`
2. **Test từng API** trên Convex Dashboard
3. **Ghi kết quả lên Trello** (✅ pass / ❌ fail)
4. **Report blocked items** nếu có
5. **Request code review** khi done

---

## 💡 TIPS

- Mỗi lần test xong 1 function → check ✅ trên Trello ngay
- Nếu có lỗi → screenshot + note lên Trello
- Test theo thứ tự: brands → categories → suppliers → products
- Products phức tạp nhất → test cuối cùng

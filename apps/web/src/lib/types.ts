import type { Doc } from "@wms/backend/convex/_generated/dataModel";

export type SystemLookups = Doc<"system_lookups">;

export type Supplier = Doc<"suppliers">;

export type User = Doc<"users">;

export type NotificationItem = Doc<"notifications"> & {
  category: SystemLookups | null;
  priority: SystemLookups | null;
};

export type PurchaseOrder = Omit<
  Doc<"purchase_orders">,
  | "_id"
  | "supplierId"
  | "createdByUserId"
  | "purchaseOrderStatusTypeId"
  | "organizationId"
  | "branchId"
> & {
  purchaseOrderStatus: Pick<SystemLookups, "lookupValue"> | null;
  supplier: Pick<Supplier, "name" | "defaultLeadTimeDays"> | null;
  createdByUser: Pick<User, "fullName"> | null;
};

export type Product = Omit<Doc<"products">, "_id" | "organizationId"> & {
  storageRequirementType: Pick<SystemLookups, "lookupValue"> | null;
  trackingMethodType: Pick<SystemLookups, "lookupValue"> | null;
};

export type Brand = Doc<"brands">;

export type Branch = Doc<"branches">;

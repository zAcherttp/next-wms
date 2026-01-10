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

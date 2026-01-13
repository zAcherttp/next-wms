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

// ============================================================
// Receive Session Types
// ============================================================

/**
 * Receive Session - General view for table listing
 * Omits IDs of related entities and replaces with enriched data
 */
export type ReceiveSessionGeneral = Omit<
  Doc<"receive_sessions">,
  "purchaseOrderId" | "branchId" | "receiveSessionStatusTypeId"
> & {
  receiveSessionStatus: Pick<
    SystemLookups,
    "lookupValue" | "lookupCode"
  > | null;
  purchaseOrder: {
    code: string;
    expectedDeliveryAt?: number;
  } | null;
  supplier: Pick<Supplier, "name"> | null;
  // Computed fields for display
  totalItems: number;
  totalExpected: number;
  totalReceived: number;
  progressPercentage: number;
};

/**
 * Receive Session Detail Item - Individual SKU item in a receive session
 * Omits IDs and replaces with enriched data
 */
export type ReceiveSessionDetailItem = Omit<
  Doc<"receive_sessions_details">,
  | "receiveSessionId"
  | "skuId"
  | "recommendedZoneId"
  | "receiveSessionItemStatusTypeId"
> & {
  sku: {
    skuCode: string;
    productName: string;
  } | null;
  recommendedZone: Pick<Doc<"storage_zones">, "name"> | null;
  itemStatus: Pick<SystemLookups, "lookupValue" | "lookupCode"> | null;
  // Optional attachment support
  attachmentUrl?: string;
};

/**
 * Work Session Info - Linked work session details for receive session detail view
 */
export type WorkSessionInfo = Pick<
  Doc<"work_sessions">,
  "_id" | "sessionCode" | "startedAt" | "completedAt"
> & {
  assignedUser: Pick<User, "fullName"> | null;
  sessionStatus: Pick<SystemLookups, "lookupValue"> | null;
};

/**
 * Receive Session - Detailed view for individual session page
 * Contains all information including work session and items
 */
export type ReceiveSessionDetailed = Omit<
  Doc<"receive_sessions">,
  "branchId" | "receiveSessionStatusTypeId"
> & {
  receiveSessionStatus: Pick<
    SystemLookups,
    "lookupValue" | "lookupCode"
  > | null;
  purchaseOrder: {
    _id: string;
    code: string;
  } | null;
  supplier: Pick<Supplier, "name"> | null;
  workSession: WorkSessionInfo | null;
  summary: {
    totalSku: number;
    totalExpectedQuantity: number;
    totalReceivedQuantity: number;
  };
  items: ReceiveSessionDetailItem[];
};

/**
 * Pending Purchase Order - For dropdown selection when creating receive session
 * Contains minimal information needed for the dropdown
 */
export type PendingPurchaseOrder = Pick<
  Doc<"purchase_orders">,
  "_id" | "code" | "orderedAt" | "expectedDeliveryAt"
> & {
  supplier: Pick<Supplier, "name"> | null;
  purchaseOrderStatus: Pick<SystemLookups, "lookupValue"> | null;
};

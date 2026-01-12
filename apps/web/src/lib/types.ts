import type { Doc, Id } from "@wms/backend/convex/_generated/dataModel";

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

// ============================================================================
// RETURN REQUEST TYPES
// ============================================================================

/**
 * Return request list item - used in the return requests table
 */
export type ReturnRequestListItem = {
  _id: Id<"return_requests">;
  requestCode: string;
  requestedAt: number;
  supplier: Pick<Supplier, "name"> | null;
  requestedByUser: Pick<User, "fullName"> | null;
  returnStatus: Pick<SystemLookups, "lookupValue"> | null;
  totalSKUs: number;
  totalItems: number;
};

/**
 * Return request detail item - line item in a return request
 */
export type ReturnRequestDetailItem = {
  _id: Id<"return_request_details">;
  skuCode: string;
  productName: string | null;
  quantityToReturn: number;
  expectedCreditAmount: number;
  reason: Pick<SystemLookups, "lookupValue"> | null;
  customReasonNotes?: string;
  batchId: string;
};

/**
 * Return request with full details - used in the detail view
 */
export type ReturnRequestWithDetails = {
  _id: Id<"return_requests">;
  requestCode: string;
  requestedAt: number;
  supplier: Pick<Supplier, "name"> | null;
  requestedByUser: Pick<User, "fullName"> | null;
  returnStatus: Pick<SystemLookups, "lookupValue"> | null;
  totalSKUs: number;
  totalExpectedQuantity: number;
  totalExpectedCredit: number;
  details: ReturnRequestDetailItem[];
};

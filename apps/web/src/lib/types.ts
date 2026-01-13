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

// ============================================================================
// CYCLE COUNT TYPES
// ============================================================================

/**
 * Cycle count session list item - used in the cycle count sessions table
 */
export type CycleCountSessionListItem = {
  _id: Id<"work_sessions">;
  sessionCode: string;
  name: string;
  cycleCountType: Pick<SystemLookups, "lookupValue"> | null;
  sessionStatus: Pick<SystemLookups, "lookupValue"> | null;
  createdByUser: Pick<User, "fullName"> | null;
  zonesCount: number;
  createdAt: number;
};

/**
 * Cycle count stats - summary statistics for the cycle count dashboard
 */
export type CycleCountStats = {
  activeSessions: number;
  totalZones: number;
  completedSessions: number;
  verificationRate: number;
};

/**
 * Cycle count session line item - individual product count in a session
 */
export type CycleCountLineItem = {
  _id: Id<"session_line_items">;
  productId: string;
  productName: string;
  expectedQuantity: number;
  actualQuantity: number;
  variance: number;
};

/**
 * Cycle count zone detail - zone information with assigned worker and line items
 */
export type CycleCountZoneDetail = {
  zoneId: string;
  zoneName: string;
  assignedWorker: Pick<User, "fullName"> | null;
  lineItems: CycleCountLineItem[];
  matchedCount: number;
  totalCount: number;
};

/**
 * Cycle count session with full details - used in the detail view dialog
 */
export type CycleCountSessionWithDetails = {
  _id: Id<"work_sessions">;
  sessionCode: string;
  name: string;
  cycleCountType: Pick<SystemLookups, "lookupValue"> | null;
  sessionStatus: Pick<SystemLookups, "lookupValue"> | null;
  createdByUser: Pick<User, "fullName"> | null;
  createdAt: number;
  zones: CycleCountZoneDetail[];
};

export type Product = Omit<Doc<"products">, "_id" | "organizationId"> & {
  storageRequirementType: Pick<SystemLookups, "lookupValue"> | null;
  trackingMethodType: Pick<SystemLookups, "lookupValue"> | null;
};

export type Brand = Doc<"brands">;

export type BrandWithProductCount = Brand & {
  productCount: number;
};

export type Branch = Doc<"branches">;

import type { PurchaseOrder } from "@/lib/types";

export const MOCK_PO: PurchaseOrder[] = [
  {
    _creationTime: 1685577600000,
    isDeleted: false,
    code: "PO-001",
    orderedAt: 1685577600000,
    createdByUser: {
      fullName: "John Doe",
    },
    purchaseOrderStatus: {
      lookupValue: "Pending",
    },
    supplier: {
      name: "Acme Supplies",
      defaultLeadTimeDays: 5,
    },
  },
  {
    _creationTime: 1685664000000,
    isDeleted: false,
    code: "PO-002",
    orderedAt: 1685664000000,
    createdByUser: {
      fullName: "Jane Smith",
    },
    purchaseOrderStatus: {
      lookupValue: "Approved",
    },
    supplier: {
      name: "Global Parts Inc",
      defaultLeadTimeDays: 10,
    },
  },
  {
    _creationTime: 1685750400000,
    isDeleted: false,
    code: "PO-003",
    orderedAt: 1685750400000,
    createdByUser: {
      fullName: "Bob Johnson",
    },
    purchaseOrderStatus: {
      lookupValue: "Received",
    },
    supplier: {
      name: "Tech Distributors",
      defaultLeadTimeDays: 3,
    },
  },
  {
    _creationTime: 1685836800000,
    isDeleted: false,
    code: "PO-004",
    orderedAt: 1685836800000,
    createdByUser: {
      fullName: "Alice Brown",
    },
    purchaseOrderStatus: {
      lookupValue: "Cancelled",
    },
    supplier: {
      name: "Quality Materials",
      defaultLeadTimeDays: 7,
    },
  },
  {
    _creationTime: 1685923200000,
    isDeleted: false,
    code: "PO-005",
    orderedAt: 1685923200000,
    createdByUser: {
      fullName: "Charlie Davis",
    },
    purchaseOrderStatus: {
      lookupValue: "Pending",
    },
    supplier: {
      name: "Premier Wholesale",
      defaultLeadTimeDays: 14,
    },
  },
  {
    _creationTime: 1686009600000,
    isDeleted: false,
    code: "PO-006",
    orderedAt: 1686009600000,
    createdByUser: {
      fullName: "Diana Wilson",
    },
    purchaseOrderStatus: {
      lookupValue: "Pending",
    },
    supplier: {
      name: "Eastern Imports",
      defaultLeadTimeDays: 12,
    },
  },
  {
    _creationTime: 1686096000000,
    isDeleted: false,
    code: "PO-007",
    orderedAt: 1686096000000,
    createdByUser: {
      fullName: "Edward Martinez",
    },
    purchaseOrderStatus: {
      lookupValue: "Approved",
    },
    supplier: {
      name: "Western Supply Co",
      defaultLeadTimeDays: 6,
    },
  },
  {
    _creationTime: 1686182400000,
    isDeleted: false,
    code: "PO-008",
    orderedAt: 1686182400000,
    createdByUser: {
      fullName: "Fiona Garcia",
    },
    purchaseOrderStatus: {
      lookupValue: "Approved",
    },
    supplier: {
      name: "Northern Trading",
      defaultLeadTimeDays: 8,
    },
  },
  {
    _creationTime: 1686268800000,
    isDeleted: false,
    code: "PO-009",
    orderedAt: 1686268800000,
    createdByUser: {
      fullName: "George Lee",
    },
    purchaseOrderStatus: {
      lookupValue: "Received",
    },
    supplier: {
      name: "Southern Vendors",
      defaultLeadTimeDays: 4,
    },
  },
  {
    _creationTime: 1686355200000,
    isDeleted: false,
    code: "PO-010",
    orderedAt: 1686355200000,
    createdByUser: {
      fullName: "Hannah White",
    },
    purchaseOrderStatus: {
      lookupValue: "Cancelled",
    },
    supplier: {
      name: "Central Supplies Ltd",
      defaultLeadTimeDays: 9,
    },
  },
  {
    _creationTime: 1686441600000,
    isDeleted: false,
    code: "PO-011",
    orderedAt: 1686441600000,
    createdByUser: {
      fullName: "Ian Taylor",
    },
    purchaseOrderStatus: {
      lookupValue: "Pending",
    },
    supplier: {
      name: "Metro Parts",
      defaultLeadTimeDays: 5,
    },
  },
  {
    _creationTime: 1686528000000,
    isDeleted: false,
    code: "PO-012",
    orderedAt: 1686528000000,
    createdByUser: {
      fullName: "Julia Anderson",
    },
    purchaseOrderStatus: {
      lookupValue: "Approved",
    },
    supplier: {
      name: "City Wholesale",
      defaultLeadTimeDays: 7,
    },
  },
  {
    _creationTime: 1686614400000,
    isDeleted: false,
    code: "PO-013",
    orderedAt: 1686614400000,
    createdByUser: {
      fullName: "Kevin Thomas",
    },
    purchaseOrderStatus: {
      lookupValue: "Pending",
    },
    supplier: {
      name: "Industrial Suppliers",
      defaultLeadTimeDays: 11,
    },
  },
  {
    _creationTime: 1686700800000,
    isDeleted: false,
    code: "PO-014",
    orderedAt: 1686700800000,
    createdByUser: {
      fullName: "Laura Jackson",
    },
    purchaseOrderStatus: {
      lookupValue: "Received",
    },
    supplier: {
      name: "Retail Components",
      defaultLeadTimeDays: 3,
    },
  },
  {
    _creationTime: 1686787200000,
    isDeleted: false,
    code: "PO-015",
    orderedAt: 1686787200000,
    createdByUser: {
      fullName: "Michael Harris",
    },
    purchaseOrderStatus: {
      lookupValue: "Approved",
    },
    supplier: {
      name: "Express Materials",
      defaultLeadTimeDays: 2,
    },
  },
  {
    _creationTime: 1686873600000,
    isDeleted: false,
    code: "PO-016",
    orderedAt: 1686873600000,
    createdByUser: {
      fullName: "Nancy Clark",
    },
    purchaseOrderStatus: {
      lookupValue: "Pending",
    },
    supplier: {
      name: "Prime Distributors",
      defaultLeadTimeDays: 6,
    },
  },
  {
    _creationTime: 1686960000000,
    isDeleted: false,
    code: "PO-017",
    orderedAt: 1686960000000,
    createdByUser: {
      fullName: "Oscar Lewis",
    },
    purchaseOrderStatus: {
      lookupValue: "Approved",
    },
    supplier: {
      name: "Elite Supplies",
      defaultLeadTimeDays: 10,
    },
  },
  {
    _creationTime: 1687046400000,
    isDeleted: false,
    code: "PO-018",
    orderedAt: 1687046400000,
    createdByUser: {
      fullName: "Patricia Walker",
    },
    purchaseOrderStatus: {
      lookupValue: "Cancelled",
    },
    supplier: {
      name: "Professional Parts",
      defaultLeadTimeDays: 8,
    },
  },
  {
    _creationTime: 1687132800000,
    isDeleted: false,
    code: "PO-019",
    orderedAt: 1687132800000,
    createdByUser: {
      fullName: "Quincy Hall",
    },
    purchaseOrderStatus: {
      lookupValue: "Received",
    },
    supplier: {
      name: "Superior Trading",
      defaultLeadTimeDays: 4,
    },
  },
  {
    _creationTime: 1687219200000,
    isDeleted: false,
    code: "PO-020",
    orderedAt: 1687219200000,
    createdByUser: {
      fullName: "Rachel Allen",
    },
    purchaseOrderStatus: {
      lookupValue: "Pending",
    },
    supplier: {
      name: "Advanced Materials Co",
      defaultLeadTimeDays: 13,
    },
  },
];

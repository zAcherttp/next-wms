"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Mock data for purchase order details
const MOCK_PO_DETAIL = {
  code: "PO-2024-001",
  createdByUser: {
    fullName: "John Smith",
  },
  supplier: {
    name: "ABC Supplies Inc.",
    phone: "+1-555-0101",
  },
  createdAt: new Date("2024-01-15T10:30:00"),
  expectedDeliveryAt: new Date("2024-01-25"),
  status: "Confirmed",
  items: [
    {
      id: "1",
      sku: "SKU-001A",
      productName: "Industrial Bearing 6mm",
      quantityOrdered: 100,
      location: "Zone A - Receiving",
    },
    {
      id: "2",
      sku: "SKU-002B",
      productName: "Stainless Steel Bolt M8",
      quantityOrdered: 500,
      location: "Zone B - Storage",
    },
    {
      id: "3",
      sku: "SKU-003C",
      productName: "Rubber Gasket 50mm",
      quantityOrdered: 200,
      location: "Zone C - Cold Storage",
    },
  ],
};

const getBadgeStyleByStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/60";
    case "confirmed":
    case "approved":
      return "bg-blue-500/10 text-blue-600 border-blue-500/60";
    case "received":
      return "bg-green-500/10 text-green-600 border-green-500/60";
    case "cancelled":
      return "bg-gray-500/10 text-gray-500 border-gray-500/60";
    default:
      return "bg-orange-500/10 text-orange-500 border-orange-500/60";
  }
};

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="space-y-1">
      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <div className="font-medium text-foreground text-sm">{value}</div>
    </div>
  );
}

interface PurchaseOrderDetailDialogProps {
  trigger?: React.ReactNode;
}

export function PurchaseOrderDetailDialog({
  trigger,
}: PurchaseOrderDetailDialogProps) {
  const [open, setOpen] = React.useState(false);

  // Calculate totals
  const totalItems = MOCK_PO_DETAIL.items.length;
  const totalQuantityOrdered = MOCK_PO_DETAIL.items.reduce(
    (sum, item) => sum + item.quantityOrdered,
    0,
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <span className="cursor-pointer text-sm hover:underline">
            View details
          </span>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">
            {MOCK_PO_DETAIL.code}
          </DialogTitle>
        </DialogHeader>

        {/* Order Information Card */}
        <Card className="flex py-4">
          <CardContent className="px-6 py-0">
            <div className="grid grid-cols-3 gap-x-8 gap-y-4">
              {/* Column 1: User & Status */}
              <div className="space-y-4">
                <InfoItem
                  label="Created By"
                  value={MOCK_PO_DETAIL.createdByUser.fullName}
                />
                <InfoItem
                  label="Status"
                  value={
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        getBadgeStyleByStatus(MOCK_PO_DETAIL.status),
                      )}
                    >
                      {MOCK_PO_DETAIL.status}
                    </Badge>
                  }
                />
              </div>

              {/* Column 2: Supplier Info */}
              <div className="space-y-4">
                <InfoItem
                  label="Supplier"
                  value={MOCK_PO_DETAIL.supplier.name}
                />
                <InfoItem
                  label="Supplier Phone"
                  value={MOCK_PO_DETAIL.supplier.phone}
                />
              </div>

              {/* Column 3: Dates */}
              <div className="space-y-4">
                <InfoItem
                  label="Created At"
                  value={
                    <span>
                      {formatDate(MOCK_PO_DETAIL.createdAt)}{" "}
                      <span className="text-muted-foreground">
                        {formatTime(MOCK_PO_DETAIL.createdAt)}
                      </span>
                    </span>
                  }
                />
                <InfoItem
                  label="Expected Delivery"
                  value={formatDate(MOCK_PO_DETAIL.expectedDeliveryAt)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Item Info Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            Detailed Item Info
          </h3>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="w-[100px] text-center">
                    Qty Ordered
                  </TableHead>
                  <TableHead className="w-[180px]">Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PO_DETAIL.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-blue-600">
                      {item.sku}
                    </TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell className="text-center font-medium text-blue-600">
                      {item.quantityOrdered}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.location}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-4 rounded-lg border bg-card px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Items:</span>
                <span className="font-semibold text-sm">{totalItems}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Total Qty:
                </span>
                <span className="font-bold text-blue-600 text-sm">
                  {totalQuantityOrdered}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

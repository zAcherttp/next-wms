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

// Mock data for receive session details
const MOCK_RECEIVE_SESSION_DETAIL = {
  code: "RS-20260103-0001",
  employee: {
    fullName: "Mike",
  },
  createdAt: new Date("2025-02-28T10:12:00"),
  status: "Returned",
  items: [
    {
      id: "1",
      sku: "SKU-1",
      productName: "Coca",
      expectedQty: 13,
      receivedQty: 13,
      note: "None",
      status: "Accepted",
    },
    {
      id: "2",
      sku: "SKU-2",
      productName: "Pepsi",
      expectedQty: 10,
      receivedQty: 10,
      note: "Móp thùng",
      status: "Returned",
    },
    {
      id: "3",
      sku: "SKU-3",
      productName: "7up",
      expectedQty: 5,
      receivedQty: 3,
      note: "Thiếu 2 thùng",
      status: "Returned",
    },
  ],
};

const getSessionStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "receiving":
      return "bg-orange-500/10 text-orange-600 border-orange-500/60";
    case "completed":
      return "bg-green-500/10 text-green-600 border-green-500/60";
    case "pending":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/60";
    case "returned":
      return "bg-blue-500/10 text-blue-600 border-blue-500/60";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/60";
  }
};

const getItemStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "accepted":
      return "bg-green-500/10 text-green-600 border-green-500/60";
    case "returned":
      return "bg-red-500/10 text-red-600 border-red-500/60";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/60";
  }
};

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground text-sm">{label}</p>
      <div className="font-medium text-foreground text-sm">{value}</div>
    </div>
  );
}

interface ReceiveSessionDetailDialogProps {
  trigger?: React.ReactNode;
}

export function ReceiveSessionDetailDialog({
  trigger,
}: ReceiveSessionDetailDialogProps) {
  const [open, setOpen] = React.useState(false);

  // Calculate totals
  const totalSKUs = MOCK_RECEIVE_SESSION_DETAIL.items.length;
  const totalExpectedQty = MOCK_RECEIVE_SESSION_DETAIL.items.reduce(
    (sum, item) => sum + item.expectedQty,
    0,
  );
  const totalReceivedQty = MOCK_RECEIVE_SESSION_DETAIL.items.reduce(
    (sum, item) => sum + item.receivedQty,
    0,
  );

  const formatDateTime = (date: Date) => {
    const time = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);

    const dateStr = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

    return `${time} ${dateStr}`;
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
          <DialogTitle className="font-semibold text-xl">
            {MOCK_RECEIVE_SESSION_DETAIL.code}
          </DialogTitle>
        </DialogHeader>

        {/* Work Session Details Card */}
        <Card className="py-6">
          <CardContent>
            <div className="grid grid-cols-3 gap-x-8 gap-y-4">
              {/* Row 1 */}
              <InfoItem
                label="Employee:"
                value={MOCK_RECEIVE_SESSION_DETAIL.employee.fullName}
              />
              <InfoItem
                label="Time:"
                value={formatDateTime(MOCK_RECEIVE_SESSION_DETAIL.createdAt)}
              />
              <InfoItem
                label="Status:"
                value={
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      getSessionStatusBadgeStyle(
                        MOCK_RECEIVE_SESSION_DETAIL.status,
                      ),
                    )}
                  >
                    {MOCK_RECEIVE_SESSION_DETAIL.status}
                  </Badge>
                }
              />

              {/* Row 2 */}
              <InfoItem label="Total SKUs:" value={totalSKUs} />
              <InfoItem
                label="Total Expected Quantity:"
                value={totalExpectedQty}
              />
              <InfoItem
                label="Total Received Quantity:"
                value={totalReceivedQty}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Card */}

        <div className="rounded-xl border p-2 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">SKU</TableHead>
                <TableHead className="w-[150px]">Name</TableHead>
                <TableHead className="w-[100px] text-center">Exp Qty</TableHead>
                <TableHead className="w-[100px] text-center">
                  Received
                </TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="w-[120px] text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_RECEIVE_SESSION_DETAIL.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-center">
                    {item.expectedQty}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.receivedQty}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.note}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        getItemStatusBadgeStyle(item.status),
                      )}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

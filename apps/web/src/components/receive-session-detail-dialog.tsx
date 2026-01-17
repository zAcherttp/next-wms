"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@wms/backend/convex/_generated/api";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn, getBadgeStyleByStatus } from "@/lib/utils";

const getItemStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "complete":
      return "bg-green-500/10 text-green-600 border-green-500/60";
    case "partial":
      return "bg-orange-500/10 text-orange-600 border-orange-500/60";
    case "pending":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/60";
    case "return_requested":
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
    <div className="space-y-1">
      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <div className="font-medium text-foreground text-sm">{value}</div>
    </div>
  );
}

interface ReceiveSessionDetailDialogProps {
  sessionId: Id<"receive_sessions"> | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ReceiveSessionDetailDialog({
  sessionId,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: ReceiveSessionDetailDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const { userId } = useCurrentUser();

  const { data: sessionDetail, isPending } = useQuery({
    ...convexQuery(
      api.receiveSessions.getReceiveSessionDetailed,
      userId && open && sessionId
        ? {
            receiveSessionId: sessionId,
          }
        : "skip",
    ),
    enabled: !!userId && open && !!sessionId,
  });

  const formatDateTime = React.useCallback((timestamp: number) => {
    const date = new Date(timestamp);
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
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <span className="cursor-pointer text-sm hover:underline">
            View details
          </span>
        )}
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-4xl">
        <DialogTitle className="sr-only">Receive Session Details</DialogTitle>
        {isPending || !sessionDetail ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-bold text-2xl">
                {sessionDetail.receiveSessionCode}
              </DialogTitle>
            </DialogHeader>

            {/* Work Session Details Card */}
            <Card className="flex py-4">
              <CardContent className="px-6 py-0">
                <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                  {/* Column 1: Employee & Status */}
                  <div className="space-y-4">
                    <InfoItem
                      label="Employee"
                      value={
                        sessionDetail.workSession?.employeeName ??
                        "Not assigned"
                      }
                    />
                    <InfoItem
                      label="Status"
                      value={
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium",
                            getBadgeStyleByStatus(sessionDetail.status ?? ""),
                          )}
                        >
                          {sessionDetail.status ?? "Unknown"}
                        </Badge>
                      }
                    />
                  </div>

                  {/* Column 2: Time & PO Info */}
                  <div className="space-y-4">
                    <InfoItem
                      label="Time"
                      value={formatDateTime(sessionDetail.receivedAt)}
                    />
                    <InfoItem
                      label="Purchase Order"
                      value={sessionDetail.purchaseOrderCode ?? "-"}
                    />
                  </div>

                  {/* Column 3: Summary */}
                  <div className="space-y-4">
                    <InfoItem
                      label="Total SKUs"
                      value={sessionDetail.summary.totalSku}
                    />
                    <InfoItem
                      label="Expected / Received"
                      value={`${sessionDetail.summary.totalExpectedQuantity} / ${sessionDetail.summary.totalReceivedQuantity}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Card */}
            <div className="space-y-3">
              <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                Items
              </h3>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-25">SKU</TableHead>
                      <TableHead className="w-37.5">Name</TableHead>
                      <TableHead className="w-20 text-center">
                        Expected
                      </TableHead>
                      <TableHead className="w-20 text-center">
                        Received
                      </TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="w-28 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionDetail.items.length > 0 ? (
                      sessionDetail.items.map((item) => (
                        <TableRow key={item.detailId}>
                          <TableCell className="font-medium text-blue-600">
                            {item.skuCode}
                          </TableCell>
                          <TableCell>{item.productName ?? "-"}</TableCell>
                          <TableCell className="text-center">
                            {item.quantityExpected}
                          </TableCell>
                          <TableCell className="text-center font-medium text-blue-600">
                            {item.quantityReceived}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.notes ?? "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-medium",
                                getItemStatusBadgeStyle(item.statusCode),
                              )}
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end">
                <div className="inline-flex items-center gap-4 rounded-lg border bg-card px-4 py-2.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">SKUs:</span>
                    <span className="font-semibold text-sm">
                      {sessionDetail.summary.totalSku}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      Total Expected:
                    </span>
                    <span className="font-semibold text-sm">
                      {sessionDetail.summary.totalExpectedQuantity}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      Total Received:
                    </span>
                    <span className="font-bold text-blue-600 text-sm">
                      {sessionDetail.summary.totalReceivedQuantity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

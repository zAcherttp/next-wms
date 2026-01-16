"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@wms/backend/convex/_generated/api";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
import { Calendar, Clock, FileText, Package, User } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn, getBadgeStyleByStatus } from "@/lib/utils";

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}

interface AdjustmentRequestDetailDialogProps {
  adjustmentRequestId: Id<"adjustment_requests">;
  trigger?: React.ReactNode;
}

export function AdjustmentRequestDetailDialog({
  adjustmentRequestId,
  trigger,
}: AdjustmentRequestDetailDialogProps) {
  const [open, setOpen] = React.useState(false);

  const { data: adjustmentRequest, isLoading } = useQuery({
    ...convexQuery(api.cycleCount.getAdjustmentRequestById, {
      adjustmentRequestId,
    }),
    enabled: open && !!adjustmentRequestId,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">View Details</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Adjustment Request Details</DialogTitle>
            {adjustmentRequest && (
              <Badge
                className={cn(
                  "capitalize",
                  getBadgeStyleByStatus(adjustmentRequest.status || ""),
                )}
                variant="outline"
              >
                {adjustmentRequest.status || "Unknown"}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : !adjustmentRequest ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              Adjustment request not found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Request Information Card */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={<FileText className="h-5 w-5 text-primary" />}
                    label="Request Code"
                    value={adjustmentRequest.requestCode}
                  />
                  <InfoItem
                    icon={<Package className="h-5 w-5 text-primary" />}
                    label="Type"
                    value={
                      adjustmentRequest.adjustmentType?.lookupValue || "Unknown"
                    }
                  />
                  <InfoItem
                    icon={<Calendar className="h-5 w-5 text-primary" />}
                    label="Date"
                    value={new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }).format(
                      new Date(
                        adjustmentRequest.requestedAt ||
                          adjustmentRequest._creationTime,
                      ),
                    )}
                  />
                  <InfoItem
                    icon={<Clock className="h-5 w-5 text-primary" />}
                    label="Time"
                    value={new Intl.DateTimeFormat("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(
                      new Date(
                        adjustmentRequest.requestedAt ||
                          adjustmentRequest._creationTime,
                      ),
                    )}
                  />
                  <InfoItem
                    icon={<User className="h-5 w-5 text-primary" />}
                    label="Requested By"
                    value={adjustmentRequest.requestedBy?.fullName || "Unknown"}
                  />
                  {adjustmentRequest.approvedByUser && (
                    <InfoItem
                      icon={<User className="h-5 w-5 text-primary" />}
                      label="Approved By"
                      value={adjustmentRequest.approvedByUser.fullName}
                    />
                  )}
                </div>

                {adjustmentRequest.resolutionNotes && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 text-muted-foreground text-sm">
                        Resolution Notes
                      </p>
                      <p className="text-sm">
                        {adjustmentRequest.resolutionNotes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Adjustment Details */}
            {adjustmentRequest.details &&
              adjustmentRequest.details.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                    Adjustment Items
                  </h3>
                  <div className="space-y-2">
                    {adjustmentRequest.details.map((detail: any) => (
                      <Card key={detail._id}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            {detail.productName && (
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Product
                                </p>
                                <p className="font-medium text-sm">
                                  {detail.productName}
                                </p>
                              </div>
                            )}
                            {detail.fromLocationName && (
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  From Location
                                </p>
                                <p className="font-medium text-sm">
                                  {detail.fromLocationName}
                                </p>
                              </div>
                            )}
                            {detail.toLocationName && (
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  To Location
                                </p>
                                <p className="font-medium text-sm">
                                  {detail.toLocationName}
                                </p>
                              </div>
                            )}
                            {detail.currentQuantity !== undefined && (
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Current Quantity
                                </p>
                                <p className="font-medium text-sm">
                                  {detail.currentQuantity}
                                </p>
                              </div>
                            )}
                            {detail.adjustedQuantity !== undefined && (
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Adjusted Quantity
                                </p>
                                <p
                                  className={cn(
                                    "font-medium text-sm",
                                    detail.adjustedQuantity <
                                      detail.currentQuantity
                                      ? "text-red-600"
                                      : "text-green-600",
                                  )}
                                >
                                  {detail.adjustedQuantity}
                                </p>
                              </div>
                            )}
                            {detail.quantityToTransfer !== undefined && (
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Quantity to Transfer
                                </p>
                                <p className="font-medium text-sm">
                                  {detail.quantityToTransfer}
                                </p>
                              </div>
                            )}
                            {detail.reason && (
                              <div className="col-span-2">
                                <p className="text-muted-foreground text-xs">
                                  Reason
                                </p>
                                <p className="text-sm">{detail.reason}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { LocationTransferDialog } from "@/components/location-transfer-dialog";
import { NewAdjustmentRequestDialog } from "@/components/new-adjustment-request-dialog";
import { QuantityAdjustmentDialog } from "@/components/quantity-adjustment-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CycleCountLineItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getMockSessionDetails } from "@/mock/data/cycle-count";

interface CycleCountSessionDetailDialogProps {
  sessionId: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CycleCountSessionDetailDialog({
  sessionId,
  open,
  onOpenChange,
}: CycleCountSessionDetailDialogProps) {
  const session = sessionId ? getMockSessionDetails(sessionId) : null;
  const [activeZoneIndex, setActiveZoneIndex] = useState(0);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [quantityAdjustmentDialogOpen, setQuantityAdjustmentDialogOpen] =
    useState(false);
  const [locationTransferDialogOpen, setLocationTransferDialogOpen] =
    useState(false);
  const [selectedLineItem, setSelectedLineItem] =
    useState<CycleCountLineItem | null>(null);

  const handleClose = () => {
    setActiveZoneIndex(0);
    onOpenChange?.(false);
  };

  const handleCompleteSession = () => {
    // TODO: Implement complete session logic
    console.log("Complete session:", sessionId);
    handleClose();
  };

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const handleCreateAdjustment = (
    lineItem: CycleCountLineItem,
    zoneId: string,
  ) => {
    setSelectedLineItem(lineItem);
    setSelectedZoneId(zoneId);
    setAdjustmentDialogOpen(true);
  };

  const handleAdjustmentTypeSelect = (type: "quantity" | "location") => {
    setAdjustmentDialogOpen(false);
    if (type === "quantity") {
      setQuantityAdjustmentDialogOpen(true);
    } else {
      setLocationTransferDialogOpen(true);
    }
  };

  if (!session) {
    return null;
  }

  const activeZone = session.zones[activeZoneIndex];
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(session.createdAt));

  const getVarianceDisplay = (variance: number) => {
    if (variance === 0) {
      return <span className="font-medium text-green-600">0</span>;
    }
    if (variance > 0) {
      return <span className="font-medium text-amber-600">+{variance}</span>;
    }
    return <span className="font-medium text-amber-600">{variance}</span>;
  };

  return (
    <>
      {/* New Adjustment Request Dialog */}
      <NewAdjustmentRequestDialog
        open={adjustmentDialogOpen}
        onOpenChange={setAdjustmentDialogOpen}
        onSelectType={handleAdjustmentTypeSelect}
      />

      {/* Quantity Adjustment Dialog */}
      <QuantityAdjustmentDialog
        open={quantityAdjustmentDialogOpen}
        onOpenChange={setQuantityAdjustmentDialogOpen}
        initialData={
          selectedLineItem
            ? {
                productId: selectedLineItem.productId,
                productName: selectedLineItem.productName,
                zoneId: selectedZoneId ?? activeZone?.zoneId,
                zoneName: activeZone?.zoneName,
                skuId: selectedLineItem.productId,
                currentQty: selectedLineItem.expectedQuantity,
                countedQty: selectedLineItem.actualQuantity,
              }
            : undefined
        }
      />

      {/* Location Transfer Dialog */}
      <LocationTransferDialog
        open={locationTransferDialogOpen}
        onOpenChange={setLocationTransferDialogOpen}
        initialData={
          selectedZoneId
            ? {
                zoneId: selectedZoneId,
                zoneName: activeZone?.zoneName,
              }
            : undefined
        }
      />

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[90vh] overflow-hidden sm:max-w-3xl"
        >
          {/* Header */}
          <DialogHeader className="relative">
            <DialogTitle className="pr-8">
              {session.sessionCode} - {session.name}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              Created by {session.createdByUser?.fullName ?? "Unknown"} on{" "}
              {formattedDate}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-0 right-0 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>

          {/* Zone Tabs */}
          <Tabs
            value={String(activeZoneIndex)}
            onValueChange={(v) => setActiveZoneIndex(Number(v))}
            className="w-full"
          >
            <TabsList className="w-full justify-start">
              {session.zones.map((zone, index) => (
                <TabsTrigger
                  key={zone.zoneId}
                  value={String(index)}
                  className="shrink-0"
                >
                  {zone.zoneName}
                </TabsTrigger>
              ))}
            </TabsList>

            {session.zones.map((zone, index) => (
              <TabsContent
                key={zone.zoneId}
                value={String(index)}
                className="mt-4 space-y-4"
              >
                {/* Info Cards */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Assigned Worker */}
                  <div className="rounded-lg border bg-card p-3">
                    <p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                      Assigned Worker
                    </p>
                    <p className="font-medium text-sm">
                      {zone.assignedWorker?.fullName ?? "Unassigned"}
                    </p>
                  </div>

                  {/* Verification Status */}
                  <div className="rounded-lg border bg-card p-3">
                    <p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                      Verification Status
                    </p>
                    <p className="font-medium text-sm">
                      {zone.matchedCount} of {zone.totalCount} matched
                    </p>
                  </div>

                  {/* Count Type */}
                  <div className="rounded-lg border bg-card p-3">
                    <p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                      Count Type
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-0.5 rounded-sm font-semibold uppercase",
                        session.cycleCountType?.lookupValue?.toLowerCase() ===
                          "daily"
                          ? "border-green-500/60 bg-green-500/10 text-green-600"
                          : session.cycleCountType?.lookupValue?.toLowerCase() ===
                              "weekly"
                            ? "border-blue-500/60 bg-blue-500/10 text-blue-600"
                            : "border-purple-500/60 bg-purple-500/10 text-purple-600",
                      )}
                    >
                      {session.cycleCountType?.lookupValue ?? "Unknown"}
                    </Badge>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-25 font-semibold text-xs uppercase">
                          Product ID
                        </TableHead>
                        <TableHead className="font-semibold text-xs uppercase">
                          Product Name
                        </TableHead>
                        <TableHead className="w-30 text-center font-semibold text-xs uppercase">
                          Expected Qty
                        </TableHead>
                        <TableHead className="w-30 text-center font-semibold text-xs uppercase">
                          Counted Qty
                        </TableHead>
                        <TableHead className="w-25 text-center font-semibold text-xs uppercase">
                          Variance
                        </TableHead>
                        <TableHead className="w-35 font-semibold text-xs uppercase">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zone.lineItems.map((item) => (
                        <TableRow key={item._id as string}>
                          <TableCell className="font-medium">
                            {item.productId}
                          </TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-center">
                            {item.expectedQuantity}
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              value={item.actualQuantity}
                              readOnly
                              className="mx-auto h-8 w-20 text-center"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {getVarianceDisplay(item.variance)}
                          </TableCell>
                          <TableCell>
                            <Button
                              className="text-foreground"
                              variant="link"
                              size="sm"
                              onClick={() =>
                                handleCreateAdjustment(item, zone.zoneId)
                              }
                            >
                              Create Adjustment
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Footer */}
          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <Button
              onClick={handleCompleteSession}
              className="flex-1 bg-green-600 text-secondary hover:bg-green-700"
            >
              Complete
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

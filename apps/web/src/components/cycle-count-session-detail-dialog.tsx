"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@wms/backend/convex/_generated/api";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBranches } from "@/hooks/use-branches";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";

interface CycleCountSessionDetailDialogProps {
  sessionId: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Type for line items from the API
type LineItemFromApi = {
  _id: string;
  skuId: string;
  skuCode: string;
  productName: string;
  zoneId: string | null;
  batchId: string | null;
  expectedQuantity: number;
  actualQuantity: number;
  variance: number;
  scannedAt?: number;
  notes?: string;
};

// Type for selected items with zone info
type SelectedItemWithZone = LineItemFromApi & {
  zoneName: string;
  sourceZoneId: string;
};

export function CycleCountSessionDetailDialog({
  sessionId,
  open,
  onOpenChange,
}: CycleCountSessionDetailDialogProps) {
  const { user, organizationId } = useCurrentUser();
  const { currentBranch } = useBranches({ organizationId });
  const queryClient = useQueryClient();

  // Fetch session details from the backend
  const { data: session, isLoading } = useQuery({
    ...convexQuery(
      api.cycleCount.getSessionDetailForDialog,
      sessionId ? { sessionId } : "skip",
    ),
    enabled: !!sessionId && open,
  });

  // Fetch zones for location transfer
  const { data: zones, isLoading: isLoadingZones } = useQuery({
    ...convexQuery(
      api.storageZones.getByBranch,
      currentBranch?._id ? { branchId: currentBranch._id } : "skip",
    ),
    enabled: !!currentBranch?._id,
  });

  // Fetch adjustment type lookups
  const { data: adjustmentTypes } = useQuery(
    convexQuery(api.systemLookups.getByType, { lookupType: "AdjustmentType" }),
  );

  const createAdjustmentRequestMutation = useConvexMutation(
    api.cycleCount.createAdjustmentRequest,
  );
  const createAdjustmentMutation = useMutation({
    mutationFn: createAdjustmentRequestMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycleCount"] });
      queryClient.invalidateQueries({ queryKey: ["adjustmentRequests"] });
    },
  });

  const [activeZoneIndex, setActiveZoneIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState<
    Map<string, SelectedItemWithZone>
  >(new Map());
  const [adjustmentTypeDialogOpen, setAdjustmentTypeDialogOpen] =
    useState(false);
  const [quantityAdjustmentDialogOpen, setQuantityAdjustmentDialogOpen] =
    useState(false);
  const [locationTransferDialogOpen, setLocationTransferDialogOpen] =
    useState(false);
  const [selectedDestinationZone, setSelectedDestinationZone] = useState<
    string | null
  >(null);
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const handleClose = () => {
    setActiveZoneIndex(0);
    setSelectedItems(new Map());
    setAdjustmentTypeDialogOpen(false);
    setQuantityAdjustmentDialogOpen(false);
    setLocationTransferDialogOpen(false);
    setSelectedDestinationZone(null);
    setAdjustmentReason("");
    onOpenChange?.(false);
  };

  const handleItemToggle = (
    item: LineItemFromApi,
    zoneName: string,
    zoneId: string,
  ) => {
    const key = `${item._id}-${zoneId}`;
    const newSelected = new Map(selectedItems);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.set(key, { ...item, zoneName, sourceZoneId: zoneId });
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAllInZone = (
    lineItems: LineItemFromApi[],
    zoneName: string,
    zoneId: string,
    checked: boolean,
  ) => {
    const newSelected = new Map(selectedItems);
    for (const item of lineItems) {
      const key = `${item._id}-${zoneId}`;
      if (checked) {
        newSelected.set(key, { ...item, zoneName, sourceZoneId: zoneId });
      } else {
        newSelected.delete(key);
      }
    }
    setSelectedItems(newSelected);
  };

  const handleCreateAdjustmentClick = () => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one item");
      return;
    }
    setAdjustmentTypeDialogOpen(true);
  };

  const handleAdjustmentTypeSelect = (type: "quantity" | "location") => {
    setAdjustmentTypeDialogOpen(false);
    if (type === "quantity") {
      setQuantityAdjustmentDialogOpen(true);
    } else {
      setLocationTransferDialogOpen(true);
    }
  };

  const handleQuantityAdjustmentSubmit = async () => {
    if (!user?._id || !currentBranch?._id) {
      toast.error("Missing required information. Please ensure you're logged in.");
      return;
    }

    const quantityTypeId = adjustmentTypes?.find(
      (t) => t.lookupValue?.toUpperCase() === "QUANTITY",
    )?._id;
    if (!quantityTypeId) {
      toast.error("Adjustment type not found. Please contact support.");
      return;
    }

    const items = Array.from(selectedItems.values());
    const details = items.map((item) => ({
      skuId: item.skuId as Id<"products">,
      batchId: item.batchId as Id<"inventory_batches"> | null,
      currentQuantity: item.expectedQuantity,
      newQuantity: item.actualQuantity,
      sourceZoneId: item.sourceZoneId as Id<"storage_zones"> | null,
      destinationZoneId: null,
    }));

    try {
      await createAdjustmentMutation.mutateAsync({
        branchId: currentBranch._id,
        adjustmentTypeId: quantityTypeId,
        details,
        reason: adjustmentReason || "Cycle count variance adjustment",
        requestedBy: user._id as Id<"users">,
      });
      toast.success("Quantity adjustment request created successfully");
      setQuantityAdjustmentDialogOpen(false);
      setSelectedItems(new Map());
      setAdjustmentReason("");
    } catch (error) {
      toast.error("Failed to create adjustment request");
      console.error(error);
    }
  };

  const handleLocationTransferSubmit = async () => {
    if (!user?._id || !currentBranch?._id) {
      toast.error("Missing required information. Please ensure you're logged in.");
      return;
    }
    
    if (!selectedDestinationZone) {
      toast.error("Please select a destination zone");
      return;
    }

    const locationTypeId = adjustmentTypes?.find(
      (t) => t.lookupValue?.toUpperCase() === "LOCATION",
    )?._id;
    if (!locationTypeId) {
      toast.error("Adjustment type not found. Please contact support.");
      return;
    }

    const items = Array.from(selectedItems.values());
    const details = items.map((item) => ({
      skuId: item.skuId as Id<"products">,
      batchId: item.batchId as Id<"inventory_batches"> | null,
      currentQuantity: item.expectedQuantity,
      newQuantity: item.expectedQuantity, // No quantity change for location transfer
      sourceZoneId: item.sourceZoneId as Id<"storage_zones"> | null,
      destinationZoneId: selectedDestinationZone as Id<"storage_zones">,
    }));

    try {
      await createAdjustmentMutation.mutateAsync({
        branchId: currentBranch._id,
        adjustmentTypeId: locationTypeId,
        details,
        reason: adjustmentReason || "Cycle count location transfer",
        requestedBy: user._id as Id<"users">,
      });
      toast.success("Location transfer request created successfully");
      setLocationTransferDialogOpen(false);
      setSelectedItems(new Map());
      setSelectedDestinationZone(null);
      setAdjustmentReason("");
    } catch (error) {
      toast.error("Failed to create transfer request");
      console.error(error);
    }
  };

  const selectedItemsArray = Array.from(selectedItems.values());

  // Show loading state
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="flex h-96 items-center justify-center sm:max-w-3xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Loading Session Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              Loading session details...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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

  const isItemSelected = (itemId: string, zoneId: string) => {
    return selectedItems.has(`${itemId}-${zoneId}`);
  };

  const areAllItemsInZoneSelected = (
    lineItems: LineItemFromApi[],
    zoneId: string,
  ) => {
    if (lineItems.length === 0) return false;
    return lineItems.every((item) => isItemSelected(item._id, zoneId));
  };

  return (
    <>
      {/* Adjustment Type Selection Dialog */}
      <Dialog
        open={adjustmentTypeDialogOpen}
        onOpenChange={setAdjustmentTypeDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Adjustment Type</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            {selectedItems.size} item(s) selected. Choose adjustment type:
          </p>
          <div className="flex flex-col gap-3 py-4">
            <Button
              variant="outline"
              className="h-20 justify-start gap-4"
              onClick={() => handleAdjustmentTypeSelect("quantity")}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <span className="font-bold text-blue-600 text-lg">#</span>
              </div>
              <div className="text-left">
                <p className="font-semibold">Quantity Adjustment</p>
                <p className="text-muted-foreground text-sm">
                  Adjust stock quantities based on count variance
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-20 justify-start gap-4"
              onClick={() => handleAdjustmentTypeSelect("location")}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <ArrowRight className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Location Transfer</p>
                <p className="text-muted-foreground text-sm">
                  Move items to a different storage zone
                </p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quantity Adjustment Dialog */}
      <Dialog
        open={quantityAdjustmentDialogOpen}
        onOpenChange={setQuantityAdjustmentDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quantity Adjustment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Review and confirm quantity adjustments for {selectedItems.size}{" "}
              item(s):
            </p>

            <div className="max-h-60 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-xs uppercase">
                      SKU
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase">
                      Product
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase">
                      Zone
                    </TableHead>
                    <TableHead className="text-center font-semibold text-xs uppercase">
                      Expected
                    </TableHead>
                    <TableHead className="text-center font-semibold text-xs uppercase">
                      Counted
                    </TableHead>
                    <TableHead className="text-center font-semibold text-xs uppercase">
                      Variance
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItemsArray.map((item) => (
                    <TableRow key={`${item._id}-${item.sourceZoneId}`}>
                      <TableCell className="font-medium">
                        {item.skuCode}
                      </TableCell>
                      <TableCell className="max-w-32 truncate">
                        {item.productName}
                      </TableCell>
                      <TableCell>{item.zoneName}</TableCell>
                      <TableCell className="text-center">
                        {item.expectedQuantity}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {item.actualQuantity}
                      </TableCell>
                      <TableCell className="text-center">
                        {getVarianceDisplay(item.variance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                placeholder="Enter reason for adjustment..."
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuantityAdjustmentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleQuantityAdjustmentSubmit}
              disabled={createAdjustmentMutation.isPending}
            >
              {createAdjustmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Adjustment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Transfer Dialog */}
      <Dialog
        open={locationTransferDialogOpen}
        onOpenChange={setLocationTransferDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Location Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destination-zone">Destination Zone</Label>
              <Select
                value={selectedDestinationZone ?? ""}
                onValueChange={setSelectedDestinationZone}
              >
                <SelectTrigger id="destination-zone">
                  <SelectValue placeholder="Select destination zone..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingZones ? (
                    <SelectItem value="_loading" disabled>
                      Loading zones...
                    </SelectItem>
                  ) : zones && zones.length > 0 ? (
                    zones.map((zone) => (
                      <SelectItem key={zone._id} value={zone._id}>
                        {zone.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="_empty" disabled>
                      No zones available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <p className="text-muted-foreground text-sm">
              Transfer {selectedItems.size} item(s) to the selected zone:
            </p>

            <div className="max-h-60 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-xs uppercase">
                      SKU
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase">
                      Product
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase">
                      From Zone
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase">
                      To Zone
                    </TableHead>
                    <TableHead className="text-center font-semibold text-xs uppercase">
                      Qty
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItemsArray.map((item) => (
                    <TableRow key={`${item._id}-${item.sourceZoneId}`}>
                      <TableCell className="font-medium">
                        {item.skuCode}
                      </TableCell>
                      <TableCell className="max-w-32 truncate">
                        {item.productName}
                      </TableCell>
                      <TableCell>{item.zoneName}</TableCell>
                      <TableCell>
                        {selectedDestinationZone ? (
                          <Badge variant="outline" className="bg-green-50">
                            {zones?.find(
                              (z) => z._id === selectedDestinationZone,
                            )?.name ?? "—"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.expectedQuantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer-reason">Reason (optional)</Label>
              <Input
                id="transfer-reason"
                placeholder="Enter reason for transfer..."
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLocationTransferDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLocationTransferSubmit}
              disabled={
                !selectedDestinationZone || createAdjustmentMutation.isPending
              }
            >
              {createAdjustmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Create Transfer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Session Detail Dialog */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[90vh] overflow-hidden sm:max-w-3xl"
        >
          {/* Header */}
          <DialogHeader className="relative">
            <div className="flex items-center justify-between pr-8">
              <DialogTitle>
                {session.sessionCode} - {session.name}
              </DialogTitle>
              {selectedItems.size > 0 && (
                <Button size="sm" onClick={handleCreateAdjustmentClick}>
                  Create Adjustment ({selectedItems.size})
                </Button>
              )}
            </div>
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

          {/* Show message if no zones */}
          {session.zones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                No zones or items found for this session.
              </p>
            </div>
          ) : (
            /* Zone Tabs */
            <Tabs
              value={String(activeZoneIndex)}
              onValueChange={(v) => setActiveZoneIndex(Number(v))}
              className="w-full"
            >
              <TabsList className="w-full justify-start overflow-x-auto">
                {session.zones.map((zone, index) => (
                  <TabsTrigger
                    key={zone.zoneId?.toString() ?? index}
                    value={String(index)}
                    className="shrink-0"
                  >
                    {zone.zoneName}
                  </TabsTrigger>
                ))}
              </TabsList>

              {session.zones.map((zone, index) => (
                <TabsContent
                  key={zone.zoneId?.toString() ?? index}
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
                  <div className="max-h-80 overflow-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-10">
                            <Checkbox
                              checked={areAllItemsInZoneSelected(
                                zone.lineItems,
                                zone.zoneId?.toString() ?? "",
                              )}
                              onCheckedChange={(checked) =>
                                handleSelectAllInZone(
                                  zone.lineItems,
                                  zone.zoneName,
                                  zone.zoneId?.toString() ?? "",
                                  !!checked,
                                )
                              }
                            />
                          </TableHead>
                          <TableHead className="w-25 font-semibold text-xs uppercase">
                            SKU Code
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {zone.lineItems.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="h-24 text-center text-muted-foreground"
                            >
                              No items in this zone
                            </TableCell>
                          </TableRow>
                        ) : (
                          zone.lineItems.map((item) => (
                            <TableRow
                              key={item._id?.toString()}
                              className={cn(
                                isItemSelected(
                                  item._id,
                                  zone.zoneId?.toString() ?? "",
                                ) && "bg-muted/50",
                              )}
                            >
                              <TableCell>
                                <Checkbox
                                  checked={isItemSelected(
                                    item._id,
                                    zone.zoneId?.toString() ?? "",
                                  )}
                                  onCheckedChange={() =>
                                    handleItemToggle(
                                      item,
                                      zone.zoneName,
                                      zone.zoneId?.toString() ?? "",
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.skuCode}
                              </TableCell>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell className="text-center">
                                {item.expectedQuantity}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.actualQuantity}
                              </TableCell>
                              <TableCell className="text-center">
                                {getVarianceDisplay(item.variance)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

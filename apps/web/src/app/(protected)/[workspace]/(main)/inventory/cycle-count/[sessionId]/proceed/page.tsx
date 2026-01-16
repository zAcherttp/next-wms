"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@wms/backend/convex/_generated/api";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  ScanLine,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";

// Type for line items from the API
type LineItem = {
  _id: string;
  skuId: string;
  skuCode: string;
  productName: string;
  expectedQuantity: number;
  actualQuantity: number;
  inventoryQuantity: number;
  variance: number;
  isScanned: boolean;
  scannedAt?: number;
  batchId?: string;
  notes?: string;
};

// Type for zone from the API
type Zone = {
  assignmentId: string;
  zoneId: string;
  zoneName: string;
  assignedUser: { _id: string; fullName: string } | null;
  status: string;
  statusCode: string;
  startedAt?: number;
  completedAt?: number;
  lineItems: LineItem[];
  progress: {
    totalItems: number;
    scannedItems: number;
    matchedItems: number;
    progressPercent: number;
  };
};

export default function CycleCountProceedPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const sessionId = params.sessionId as string;

  // State
  const [activeZoneIndex, setActiveZoneIndex] = React.useState(0);
  const [skuInput, setSkuInput] = React.useState("");
  const [foundItem, setFoundItem] = React.useState<LineItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [countedAmount, setCountedAmount] = React.useState(0);
  const [notes, setNotes] = React.useState("");

  // Fetch session data
  const { data: session, isLoading } = useQuery({
    ...convexQuery(api.cycleCount.getSessionForProceed, { sessionId }),
    enabled: !!sessionId,
  });

  // Mutations
  const recordCountFn = useConvexMutation(api.cycleCount.recordLineItemCount);
  const recordCountMutation = useMutation({
    mutationFn: recordCountFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cycleCount.getSessionForProceed"],
      });
    },
  });

  const startZoneFn = useConvexMutation(api.cycleCount.startZoneAssignment);
  const startZoneMutation = useMutation({
    mutationFn: startZoneFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cycleCount.getSessionForProceed"],
      });
    },
  });

  const completeZoneFn = useConvexMutation(
    api.cycleCount.completeZoneAssignment,
  );
  const completeZoneMutation = useMutation({
    mutationFn: completeZoneFn,
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["cycleCount.getSessionForProceed"],
      });
      if (result.sessionCompleted) {
        // Session is fully completed, redirect back
        router.push(`/${params.workspace}/inventory/cycle-count`);
      }
    },
  });

  const activeZone = session?.zones[activeZoneIndex];

  // Handle SKU input submission
  const handleSubmitSku = () => {
    if (!skuInput.trim() || !activeZone) return;

    // Find matching item in current zone
    const matchedItem = activeZone.lineItems.find(
      (item) => item.skuCode.toLowerCase() === skuInput.toLowerCase(),
    );

    if (matchedItem) {
      setFoundItem(matchedItem);
      setCountedAmount(matchedItem.expectedQuantity);
      setNotes("");
      setIsDialogOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmitSku();
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setFoundItem(null);
    setSkuInput("");
    setNotes("");
  };

  const handleConfirmCount = async () => {
    if (!foundItem || !user) return;

    await recordCountMutation.mutateAsync({
      lineItemId: foundItem._id as Id<"session_line_items">,
      actualQuantity: countedAmount,
      scannedByUserId: user._id as Id<"users">,
      notes: notes || undefined,
    });

    handleDialogClose();
  };

  const handleStartZone = async () => {
    if (!activeZone) return;
    await startZoneMutation.mutateAsync({
      assignmentId: activeZone.assignmentId as Id<"session_zone_assignments">,
    });
  };

  const handleCompleteZone = async () => {
    if (!activeZone) return;
    await completeZoneMutation.mutateAsync({
      assignmentId: activeZone.assignmentId as Id<"session_zone_assignments">,
    });
  };

  const handleBack = () => {
    router.push(`/${params.workspace}/inventory/cycle-count`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Session not found</p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cycle Count
        </Button>
      </div>
    );
  }

  const getStatusBadgeStyle = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "completed") {
      return "border-green-500/60 bg-green-500/10 text-green-600";
    }
    if (lowerStatus === "in progress" || lowerStatus === "in_progress") {
      return "border-blue-500/60 bg-blue-500/10 text-blue-600";
    }
    return "border-amber-500/60 bg-amber-500/10 text-amber-600";
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-4">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={handleBack} className="w-fit">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Total Progress Card */}
      <Card>
        <CardContent className="py-4">
          <p className="font-medium text-lg">
            Total Progress: {session.overallProgress.scannedItems} /{" "}
            {session.overallProgress.totalItems}
          </p>
          <p className="text-muted-foreground text-sm">
            Zones: {session.overallProgress.completedZones} /{" "}
            {session.overallProgress.totalZones} completed
          </p>
        </CardContent>
      </Card>

      {/* Session Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="space-y-1 py-4">
          <p className="text-sm">
            Session ID:{" "}
            <span className="font-semibold">{session.sessionCode}</span>
          </p>
          {session.name && session.name !== session.sessionCode && (
            <p className="text-sm">
              Name: <span className="font-semibold">{session.name}</span>
            </p>
          )}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm">Status:</span>
            <Badge
              variant="outline"
              className={cn(
                "font-medium",
                getStatusBadgeStyle(session.sessionStatus),
              )}
            >
              {session.sessionStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Zone Tabs */}
      {session.zones.length > 0 ? (
        <Tabs
          value={String(activeZoneIndex)}
          onValueChange={(v) => setActiveZoneIndex(Number(v))}
          className="w-full"
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            {session.zones.map((zone, index) => (
              <TabsTrigger
                key={zone.zoneId}
                value={String(index)}
                className="shrink-0"
              >
                <span className="flex items-center gap-1.5">
                  {zone.zoneName}
                  {zone.statusCode?.toLowerCase() === "completed" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  )}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {session.zones.map((zone, index) => (
            <TabsContent
              key={zone.zoneId}
              value={String(index)}
              className="mt-4 space-y-4"
            >
              {/* Zone Status Card */}
              <Card className="border-l-4 border-l-primary">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{zone.zoneName}</p>
                      <p className="text-muted-foreground text-sm">
                        Assigned to:{" "}
                        {zone.assignedUser?.fullName ?? "Unassigned"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        getStatusBadgeStyle(zone.status),
                      )}
                    >
                      {zone.status}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-muted-foreground text-sm">
                      Progress: {zone.progress.scannedItems} /{" "}
                      {zone.progress.totalItems} items (
                      {zone.progress.progressPercent}%)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Start Zone Button (if not started) */}
              {zone.statusCode?.toLowerCase() !== "completed" &&
                zone.statusCode?.toLowerCase() !== "in_progress" &&
                zone.statusCode?.toLowerCase() !== "in progress" && (
                  <Button
                    className="w-full"
                    onClick={handleStartZone}
                    disabled={startZoneMutation.isPending}
                  >
                    {startZoneMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Start Counting This Zone
                  </Button>
                )}

              {/* Scan Section (only if zone is in progress) */}
              {(zone.statusCode?.toLowerCase() === "in_progress" ||
                zone.statusCode?.toLowerCase() === "in progress") && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ScanLine className="h-5 w-5" />
                      <span className="font-medium">Scan Item or SKU</span>
                    </div>

                    {/* Scanner Placeholder */}
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <div className="text-center">
                          <p>No camera detected</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* SKU Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter SKU code..."
                        value={skuInput}
                        onChange={(e) => setSkuInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSubmitSku}
                        disabled={!skuInput.trim()}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Expected Items Card */}
              <Card>
                <CardContent className="py-4">
                  <h3 className="mb-4 font-semibold">Expected Items</h3>
                  <div className="space-y-4">
                    {zone.lineItems.length === 0 ? (
                      <p className="text-center text-muted-foreground">
                        No items in this zone
                      </p>
                    ) : (
                      zone.lineItems.map((item) => (
                        <div
                          key={item._id}
                          className={cn(
                            "flex items-center justify-between rounded-md p-2",
                            item.isScanned && "bg-muted/50",
                          )}
                        >
                          <div>
                            <p
                              className={cn(
                                "font-medium",
                                item.isScanned && item.variance === 0
                                  ? "text-green-600"
                                  : item.isScanned && item.variance !== 0
                                    ? "text-amber-600"
                                    : "",
                              )}
                            >
                              {item.skuCode}
                              {item.isScanned && (
                                <CheckCircle2 className="ml-1.5 inline h-4 w-4" />
                              )}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              Exp: {item.expectedQuantity}
                            </p>
                          </div>
                          <div
                            className={cn(
                              "rounded-md border px-3 py-1 text-sm",
                              item.isScanned
                                ? item.variance === 0
                                  ? "border-green-500/60 bg-green-500/10 text-green-600"
                                  : "border-amber-500/60 bg-amber-500/10 text-amber-600"
                                : "text-muted-foreground",
                            )}
                          >
                            {item.isScanned
                              ? `Counted: ${item.actualQuantity}`
                              : "Not counted"}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Complete Zone Button */}
              {(zone.statusCode?.toLowerCase() === "in_progress" ||
                zone.statusCode?.toLowerCase() === "in progress") && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCompleteZone}
                  disabled={completeZoneMutation.isPending}
                >
                  {completeZoneMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-5 w-5" />
                  )}
                  Complete Zone Count
                </Button>
              )}

              {/* Zone Completed Message */}
              {zone.statusCode?.toLowerCase() === "completed" && (
                <Card className="border-green-500/50 bg-green-500/5">
                  <CardContent className="flex items-center justify-center gap-2 py-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">
                      Zone count completed
                    </span>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No zones assigned to this session
          </CardContent>
        </Card>
      )}

      {/* Found SKU Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Found SKU: {foundItem?.skuCode}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              {foundItem?.productName}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Expected vs Current */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Expected Quantity
                </Label>
                <div className="rounded-md border bg-muted/50 px-3 py-2 font-medium">
                  {foundItem?.expectedQuantity}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Current Inventory
                </Label>
                <div className="rounded-md border bg-muted/50 px-3 py-2 font-medium">
                  {foundItem?.inventoryQuantity}
                </div>
              </div>
            </div>

            {/* Counted Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Counted Amount</Label>
              <Input
                id="amount"
                type="number"
                value={countedAmount}
                onChange={(e) => setCountedAmount(Number(e.target.value))}
                min={0}
              />
            </div>

            {/* Variance Display */}
            {foundItem && (
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Variance
                </Label>
                <div
                  className={cn(
                    "rounded-md border px-3 py-2 font-medium",
                    countedAmount === foundItem.expectedQuantity
                      ? "border-green-500/60 bg-green-500/10 text-green-600"
                      : "border-amber-500/60 bg-amber-500/10 text-amber-600",
                  )}
                >
                  {countedAmount - foundItem.expectedQuantity > 0 && "+"}
                  {countedAmount - foundItem.expectedQuantity}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this count..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-16 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-between">
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCount}
              disabled={recordCountMutation.isPending}
            >
              {recordCountMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Confirm Count
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

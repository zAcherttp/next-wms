"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@wms/backend/convex/_generated/api";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
import { Plus } from "lucide-react";
import { useState } from "react";
import { LocationTransferDialog } from "@/components/location-transfer-dialog";
import { NewAdjustmentRequestDialog } from "@/components/new-adjustment-request-dialog";
import { QuantityAdjustmentDialog } from "@/components/quantity-adjustment-dialog";
import { LocationAdjustmentsTable } from "@/components/table/location-adjustments-table";
import { QuantityAdjustmentsTable } from "@/components/table/quantity-adjustments-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBranches } from "@/hooks/use-branches";
import { useCurrentUser } from "@/hooks/use-current-user";

interface StatCardProps {
  title: string;
  value: string | number;
  bgColor: string;
  textColor: string;
}

function StatCard({ title, value, bgColor, textColor }: StatCardProps) {
  return (
    <div className={`flex flex-col gap-2 rounded-lg border p-4 ${bgColor}`}>
      <span className="text-muted-foreground text-sm">{title}</span>
      <div className={`font-bold text-3xl ${textColor}`}>{value}</div>
    </div>
  );
}

export default function Page() {
  const { organizationId } = useCurrentUser();
  const { currentBranch } = useBranches({ organizationId });

  // Fetch real stats data from Convex
  const { data: stats } = useQuery({
    ...convexQuery(
      api.cycleCount.getAdjustmentStats,
      organizationId && currentBranch?._id
        ? {
            organizationId: organizationId as Id<"organizations">,
            branchId: currentBranch._id as Id<"branches">,
          }
        : "skip",
    ),
    enabled: !!organizationId && !!currentBranch?._id,
  });

  // Default stats when loading
  const displayStats = stats ?? {
    totalQuantityRequests: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
  };

  // Dialog states
  const [isNewRequestDialogOpen, setIsNewRequestDialogOpen] = useState(false);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);

  const handleSelectAdjustmentType = (type: "quantity" | "location") => {
    if (type === "quantity") {
      setIsQuantityDialogOpen(true);
    } else {
      setIsLocationDialogOpen(true);
    }
  };

  const handleApprove = (id: string) => {
    console.log("Approve adjustment:", id);
    // TODO: Implement approve logic
  };

  const handleReject = (id: string) => {
    console.log("Reject adjustment:", id);
    // TODO: Implement reject logic
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Dialogs - Rendered conditionally to avoid unnecessary data fetching */}
      {isNewRequestDialogOpen && (
        <NewAdjustmentRequestDialog
          open={isNewRequestDialogOpen}
          onOpenChange={setIsNewRequestDialogOpen}
          onSelectType={handleSelectAdjustmentType}
        />
      )}
      {isQuantityDialogOpen && (
        <QuantityAdjustmentDialog
          open={isQuantityDialogOpen}
          onOpenChange={setIsQuantityDialogOpen}
        />
      )}
      {isLocationDialogOpen && (
        <LocationTransferDialog
          open={isLocationDialogOpen}
          onOpenChange={setIsLocationDialogOpen}
        />
      )}

      {/* Tabs */}
      <Tabs defaultValue="quantity" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="quantity">Quantity Adjustments</TabsTrigger>
          <TabsTrigger value="location">Location Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="quantity" className="mt-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Quantity Requests"
              value={displayStats.totalQuantityRequests}
              bgColor="bg-card"
              textColor="text-foreground"
            />
            <StatCard
              title="Pending Approval"
              value={displayStats.pendingApproval}
              bgColor="bg-yellow-500/5"
              textColor="text-yellow-600"
            />
            <StatCard
              title="Approved"
              value={displayStats.approved}
              bgColor="bg-green-500/5"
              textColor="text-green-600"
            />
            <StatCard
              title="Rejected"
              value={displayStats.rejected}
              bgColor="bg-red-500/5"
              textColor="text-red-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" onClick={() => setIsNewRequestDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>

          {/* Quantity Adjustments Table */}
          <QuantityAdjustmentsTable
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>

        <TabsContent value="location" className="mt-6 space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" onClick={() => setIsNewRequestDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>

          {/* Location Adjustments Table */}
          <LocationAdjustmentsTable
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

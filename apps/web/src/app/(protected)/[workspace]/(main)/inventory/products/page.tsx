"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@wms/backend/convex/_generated/api";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
import {
  AlertTriangle,
  Box,
  Calendar,
  Layers,
  Package,
  PackageX,
  RefreshCw,
} from "lucide-react";
import { ProductInventoryTable } from "@/components/table/product-inventory-table";
import { Button } from "@/components/ui/button";
import { useBranches } from "@/hooks/use-branches";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  subtitle?: string;
}

function StatCard({
  title,
  value,
  icon,
  bgColor,
  textColor,
  subtitle,
}: StatCardProps) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border p-4", bgColor)}>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{title}</span>
        <div className={cn("rounded-full p-2", bgColor)}>{icon}</div>
      </div>
      <div className={cn("font-bold text-3xl", textColor)}>{value}</div>
      {subtitle && (
        <span className="text-muted-foreground text-xs">{subtitle}</span>
      )}
    </div>
  );
}

export default function ProductsInventoryPage() {
  const { organizationId } = useCurrentUser();
  const { currentBranch } = useBranches({ organizationId });

  // Fetch stats data
  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery({
    ...convexQuery(
      api.products.getProductInventoryStats,
      organizationId
        ? {
            organizationId: organizationId as Id<"organizations">,
            branchId: currentBranch?._id as Id<"branches"> | undefined,
          }
        : "skip",
    ),
    enabled: !!organizationId,
  });

  // Default stats when loading
  const displayStats = stats ?? {
    totalProducts: 0,
    totalVariants: 0,
    totalBatches: 0,
    totalQuantity: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    expiringSoon: 0,
  };

  const handleViewDetails = (productId: Id<"products">) => {
    console.log("View product details:", productId);
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* <div>
          <h1 className="font-bold text-2xl tracking-tight">
            Product Inventory
          </h1>
          <p className="text-muted-foreground text-sm">
            View and manage product inventory across all batches and locations
            {currentBranch && (
              <span className="font-medium"> - {currentBranch.name}</span>
            )}
          </p>
        </div> */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchStats()}
          className="w-fit"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard
          title="Total Products"
          value={
            isStatsLoading ? "..." : displayStats.totalProducts.toLocaleString()
          }
          icon={<Box className="h-5 w-5 text-blue-600" />}
          bgColor="bg-blue-500/5"
          textColor="text-blue-600"
          subtitle="Active products"
        />
        <StatCard
          title="Total SKUs"
          value={
            isStatsLoading ? "..." : displayStats.totalVariants.toLocaleString()
          }
          icon={<Layers className="h-5 w-5 text-purple-600" />}
          bgColor="bg-purple-500/5"
          textColor="text-purple-600"
          subtitle="Product variants"
        />
        <StatCard
          title="Total Batches"
          value={
            isStatsLoading ? "..." : displayStats.totalBatches.toLocaleString()
          }
          icon={<Package className="h-5 w-5 text-indigo-600" />}
          bgColor="bg-indigo-500/5"
          textColor="text-indigo-600"
          subtitle="Inventory batches"
        />
        <StatCard
          title="Total Quantity"
          value={
            isStatsLoading ? "..." : displayStats.totalQuantity.toLocaleString()
          }
          icon={<Package className="h-5 w-5 text-foreground" />}
          bgColor="bg-card"
          textColor="text-foreground"
          subtitle="Units in stock"
        />
        <StatCard
          title="Low Stock"
          value={
            isStatsLoading ? "..." : displayStats.lowStockCount.toLocaleString()
          }
          icon={<AlertTriangle className="h-5 w-5 text-yellow-600" />}
          bgColor="bg-yellow-500/5"
          textColor="text-yellow-600"
          subtitle="Below reorder point"
        />
        <StatCard
          title="Out of Stock"
          value={
            isStatsLoading
              ? "..."
              : displayStats.outOfStockCount.toLocaleString()
          }
          icon={<PackageX className="h-5 w-5 text-red-600" />}
          bgColor="bg-red-500/5"
          textColor="text-red-600"
          subtitle="Zero quantity"
        />
        <StatCard
          title="Expiring Soon"
          value={
            isStatsLoading ? "..." : displayStats.expiringSoon.toLocaleString()
          }
          icon={<Calendar className="h-5 w-5 text-orange-600" />}
          bgColor="bg-orange-500/5"
          textColor="text-orange-600"
          subtitle="Within 30 days"
        />
      </div>

      {/* Product Inventory Table */}
      <div className="rounded-lg border bg-card p-4">
        <ProductInventoryTable onViewDetails={handleViewDetails} />
      </div>
    </div>
  );
}

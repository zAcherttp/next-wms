"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@wms/backend/convex/_generated/api";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
import {
  AlertTriangle,
  ArrowLeft,
  Barcode,
  Box,
  Calendar,
  Info,
  Layers,
  MapPin,
  Package,
  PackageX,
  Scale,
  Tag,
  Thermometer,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

// --- Components ---

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  subValue?: string;
}

function InfoItem({ icon, label, value, subValue }: InfoItemProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:bg-accent/5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="font-semibold text-base leading-tight truncate" title={String(value)}>
          {value ?? "-"}
        </p>
        {subValue && (
          <p className="text-muted-foreground text-xs mt-1">{subValue}</p>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
  valueClassName?: string;
}

function StatCard({ label, value, className, valueClassName }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
          {label}
        </p>
        <p className={cn("text-3xl font-bold tracking-tight", valueClassName)}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

// --- Main Page Component ---

export default function ProductInventoryDetailPage() {
  const params = useParams();
  const productId = params.productId as Id<"products">;
  const workspace = params.workspace as string;
  
  const { organizationId } = useCurrentUser();
  const { currentBranch } = useBranches({ organizationId });

  const { data: productDetail, isLoading } = useQuery({
    ...convexQuery(api.products.getProductInventoryDetail, {
      productId,
      branchId: currentBranch?._id as Id<"branches"> | undefined,
    }),
    enabled: !!productId,
  });

  const getStockStatusBadge = (qty: number, reorderPoint: number) => {
    if (qty === 0) {
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-600 border-red-200 h-7 px-3 gap-1.5"
        >
          <PackageX className="h-3.5 w-3.5" />
          Out of Stock
        </Badge>
      );
    }
    if (qty <= reorderPoint) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-600 border-yellow-200 h-7 px-3 gap-1.5"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Low Stock
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-green-500/10 text-green-600 border-green-200 h-7 px-3 gap-1.5"
      >
        <Package className="h-3.5 w-3.5" />
        In Stock
      </Badge>
    );
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!productDetail) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">Product not found.</p>
        <Button variant="outline" asChild>
          <Link href={`/${workspace}/inventory/products`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="border-b bg-background px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/${workspace}/inventory/products`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-xl font-semibold">Product Inventory Details</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground mr-2">
              <span className="bg-primary/10 px-2 py-0.5 rounded text-primary font-mono text-xs">
                ID: {productDetail.product._id.slice(-6)}
              </span>
            </div>
            {getStockStatusBadge(
              productDetail.summary.totalQuantity,
              productDetail.product.reorderPoint ?? 10
            )}
            {productDetail.product.isActive ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700 h-7 px-3">
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 h-7 px-3">
                Inactive
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto bg-muted/5">
        <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
          
          {/* SECTION 1: Header Info & Attributes */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-2 max-w-4xl">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  {productDetail.product.name}
                </h2>
                {productDetail.product.description ? (
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {productDetail.product.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">No description available.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoItem
                icon={<Tag className="h-5 w-5" />}
                label="Category"
                value={productDetail.product.categoryName}
              />
              <InfoItem
                icon={<Box className="h-5 w-5" />}
                label="Brand"
                value={productDetail.product.brandName}
              />
              <InfoItem
                icon={<Calendar className="h-5 w-5" />}
                label="Shelf Life"
                value={
                  productDetail.product.shelfLifeDays
                    ? `${productDetail.product.shelfLifeDays} days`
                    : "N/A"
                }
              />
              <InfoItem
                icon={<AlertTriangle className="h-5 w-5" />}
                label="Reorder Point"
                value={productDetail.product.reorderPoint ?? "Not Set"}
                subValue={productDetail.product.reorderPoint ? "Min quantity alert" : undefined}
              />
            </div>
          </div>

          <Separator />

          {/* SECTION 2: Summary Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Total Quantity" 
              value={productDetail.summary.totalQuantity.toLocaleString()}
              className="bg-blue-50/50 border-blue-100"
              valueClassName="text-blue-700"
            />
            <StatCard 
              label="Active Variants" 
              value={productDetail.summary.totalVariants}
            />
            <StatCard 
              label="Total Batches" 
              value={productDetail.summary.totalBatches}
            />
            <StatCard 
              label="Total Value" 
              value={formatCurrency(productDetail.summary.totalValue)}
              className="bg-green-50/50 border-green-100"
              valueClassName="text-green-700"
            />
          </div>

          {/* SECTION 3: Detailed Tables (Tabs) */}
          <div className="bg-background rounded-xl border shadow-sm">
            <Tabs defaultValue="variants" className="w-full">
              <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/20">
                <TabsList className="h-9">
                  <TabsTrigger value="variants" className="px-4">
                    Variants ({productDetail.variants.length})
                  </TabsTrigger>
                  <TabsTrigger value="batches" className="px-4">
                    Batches ({productDetail.batches.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="variants" className="m-0 p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="pl-6">SKU Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead className="pr-6">Barcodes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productDetail.variants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                          No variants found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      productDetail.variants.map((variant) => (
                        <TableRow key={variant._id} className="hover:bg-muted/5">
                          <TableCell className="pl-6 font-medium font-mono text-primary">
                            {variant.skuCode}
                          </TableCell>
                          <TableCell className="max-w-[280px]">
                            <p className="truncate" title={variant.description}>
                              {variant.description}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "font-bold inline-block min-w-[30px]",
                                variant.totalQuantity === 0
                                  ? "text-red-600"
                                  : variant.totalQuantity <=
                                    (productDetail.product.reorderPoint ?? 10)
                                  ? "text-yellow-600"
                                  : "text-foreground"
                              )}
                            >
                              {variant.totalQuantity.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(variant.costPrice)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(variant.sellingPrice)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1.5">
                              {variant.weightKg && (
                                <Badge variant="outline" className="text-[10px] h-5 gap-1">
                                  <Scale className="h-3 w-3" />
                                  {variant.weightKg}kg
                                </Badge>
                              )}
                              {variant.temperatureSensitive && (
                                <Badge variant="secondary" className="text-[10px] h-5 gap-1 bg-blue-50 text-blue-700 border-blue-100">
                                  <Thermometer className="h-3 w-3" />
                                  Cold
                                </Badge>
                              )}
                              {variant.stackingLimit && (
                                <Badge variant="outline" className="text-[10px] h-5 gap-1">
                                  <Layers className="h-3 w-3" />
                                  Max: {variant.stackingLimit}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="pr-6">
                            {variant.barcodes.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {variant.barcodes.slice(0, 2).map((barcode, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-[10px] font-mono h-5">
                                    <Barcode className="mr-1 h-3 w-3" />
                                    {barcode}
                                  </Badge>
                                ))}
                                {variant.barcodes.length > 2 && (
                                  <Badge variant="secondary" className="text-[10px] h-5">
                                    +{variant.barcodes.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="batches" className="m-0 p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="pl-6">SKU / Batch</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Received Date</TableHead>
                      <TableHead className="pr-6">Expiry Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productDetail.batches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                          No active batches found in inventory.
                        </TableCell>
                      </TableRow>
                    ) : (
                      productDetail.batches.map((batch) => {
                        const isExpiringSoon =
                          batch.expiresAt &&
                          batch.expiresAt < Date.now() + 30 * 24 * 60 * 60 * 1000;
                        const isExpired =
                          batch.expiresAt && batch.expiresAt < Date.now();

                        return (
                          <TableRow key={batch._id} className="hover:bg-muted/5">
                            <TableCell className="pl-6">
                              <div className="flex flex-col">
                                <span className="font-medium font-mono text-primary">{batch.skuCode}</span>
                                <span className="text-xs text-muted-foreground font-mono mt-0.5">
                                  #{batch.supplierBatchNumber || batch.internalBatchNumber || "N/A"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{batch.branchName}</span>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                  <MapPin className="h-3 w-3" />
                                  {batch.zoneName}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-bold">{batch.quantity.toLocaleString()}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{formatDate(batch.receivedAt)}</span>
                            </TableCell>
                            <TableCell className="pr-6">
                              {batch.expiresAt ? (
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-sm",
                                    isExpired ? "text-red-600 font-medium" : isExpiringSoon ? "text-yellow-600 font-medium" : ""
                                  )}>
                                    {formatDate(batch.expiresAt)}
                                  </span>
                                  {isExpired && <Badge variant="destructive" className="h-5 text-[10px]">Expired</Badge>}
                                  {isExpiringSoon && !isExpired && <Badge variant="outline" className="h-5 text-[10px] border-yellow-500 text-yellow-600 bg-yellow-50">Expiring</Badge>}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm italic">No Expiry</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@wms/backend/convex/_generated/api";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
import {
  AlertTriangle,
  Barcode,
  Box,
  Calendar,
  DollarSign,
  Info,
  Layers,
  MapPin,
  Package,
  PackageX,
  Scale,
  Tag,
  Thermometer,
  Warehouse,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
        <p className="font-medium text-sm leading-snug">{value ?? "-"}</p>
      </div>
    </div>
  );
}

interface ProductInventoryDetailDialogProps {
  productId: Id<"products">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductInventoryDetailDialog({
  productId,
  open,
  onOpenChange,
}: ProductInventoryDetailDialogProps) {
  const { organizationId } = useCurrentUser();
  const { currentBranch } = useBranches({ organizationId });

  const { data: productDetail, isLoading } = useQuery({
    ...convexQuery(api.products.getProductInventoryDetail, {
      productId,
      branchId: currentBranch?._id as Id<"branches"> | undefined,
    }),
    enabled: open && !!productId,
  });

  const getStockStatusBadge = (qty: number, reorderPoint: number) => {
    if (qty === 0) {
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-600 border-red-500/60"
        >
          <PackageX className="mr-1 h-3 w-3" />
          Out of Stock
        </Badge>
      );
    }
    if (qty <= reorderPoint) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-600 border-yellow-500/60"
        >
          <AlertTriangle className="mr-1 h-3 w-3" />
          Low Stock
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-green-500/10 text-green-600 border-green-500/60"
      >
        <Package className="mr-1 h-3 w-3" />
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1400px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Inventory Details
            </DialogTitle>
            {productDetail && (
              <div className="flex items-center gap-2">
                {getStockStatusBadge(
                  productDetail.summary.totalQuantity,
                  productDetail.product.reorderPoint ?? 10
                )}
                {productDetail.product.isActive ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/60">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/60">
                    Inactive
                  </Badge>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center px-6">
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        ) : !productDetail ? (
          <div className="flex h-40 items-center justify-center px-6">
            <p className="text-muted-foreground">Product not found.</p>
          </div>
        ) : (
          <div className="flex-1 w-full overflow-y-auto min-h-0">
            <div className="px-8 pb-8 space-y-6">
              {/* Product Information Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_auto_1fr] gap-8">
                    {/* Left side - Product details */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-2xl font-semibold leading-tight mb-3">
                          {productDetail.product.name}
                        </h3>
                        {productDetail.product.description && (
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {productDetail.product.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <Separator orientation="vertical" className="hidden lg:block" />
                    <Separator className="lg:hidden" />

                    {/* Right side - Product attributes in 2 columns */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                      <InfoItem
                        icon={<Tag className="h-4 w-4 text-primary" />}
                        label="Category"
                        value={productDetail.product.categoryName}
                      />
                      <InfoItem
                        icon={<Box className="h-4 w-4 text-primary" />}
                        label="Brand"
                        value={productDetail.product.brandName}
                      />
                      <InfoItem
                        icon={<Calendar className="h-4 w-4 text-primary" />}
                        label="Shelf Life"
                        value={
                          productDetail.product.shelfLifeDays
                            ? `${productDetail.product.shelfLifeDays} days`
                            : "N/A"
                        }
                      />
                      <InfoItem
                        icon={<AlertTriangle className="h-4 w-4 text-primary" />}
                        label="Reorder Point"
                        value={productDetail.product.reorderPoint ?? "Not Set"}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats - Horizontal row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="pt-6 pb-5 px-6">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">
                      Total Quantity
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {productDetail.summary.totalQuantity.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 pb-5 px-6">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">
                      Variants
                    </p>
                    <p className="text-3xl font-bold">
                      {productDetail.summary.totalVariants}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 pb-5 px-6">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">
                      Batches
                    </p>
                    <p className="text-3xl font-bold">
                      {productDetail.summary.totalBatches}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-linear-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                  <CardContent className="pt-6 pb-5 px-6">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">
                      Total Value
                    </p>
                    <p className="text-3xl font-bold text-green-600 whitespace-nowrap">
                      {formatCurrency(productDetail.summary.totalValue)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for Variants and Batches */}
              <Tabs defaultValue="variants" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="variants">
                    Variants ({productDetail.variants.length})
                  </TabsTrigger>
                  <TabsTrigger value="batches">
                    Batches ({productDetail.batches.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="variants" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Product Variants (SKUs)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>SKU Code</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead className="text-right">
                                Cost Price
                              </TableHead>
                              <TableHead className="text-right">
                                Sell Price
                              </TableHead>
                              <TableHead>Properties</TableHead>
                              <TableHead>Barcodes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {productDetail.variants.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  className="h-24 text-center text-muted-foreground"
                                >
                                  No variants found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              productDetail.variants.map((variant) => (
                                <TableRow key={variant._id}>
                                  <TableCell className="font-medium">
                                    {variant.skuCode}
                                  </TableCell>
                                  <TableCell className="max-w-[200px] truncate">
                                    {variant.description}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span
                                      className={cn(
                                        "font-medium",
                                        variant.totalQuantity === 0
                                          ? "text-red-600"
                                          : variant.totalQuantity <=
                                              (productDetail.product
                                                .reorderPoint ?? 10)
                                            ? "text-yellow-600"
                                            : ""
                                      )}
                                    >
                                      {variant.totalQuantity.toLocaleString()}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(variant.costPrice)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(variant.sellingPrice)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {variant.weightKg && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          <Scale className="mr-1 h-3 w-3" />
                                          {variant.weightKg}kg
                                        </Badge>
                                      )}
                                      {variant.temperatureSensitive && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs bg-blue-100 text-blue-700"
                                        >
                                          <Thermometer className="mr-1 h-3 w-3" />
                                          Cold
                                        </Badge>
                                      )}
                                      {variant.stackingLimit && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          Stack: {variant.stackingLimit}
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {variant.barcodes.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {variant.barcodes
                                          .slice(0, 2)
                                          .map((barcode, idx) => (
                                            <Badge
                                              key={idx}
                                              variant="outline"
                                              className="text-xs font-mono"
                                            >
                                              <Barcode className="mr-1 h-3 w-3" />
                                              {barcode}
                                            </Badge>
                                          ))}
                                        {variant.barcodes.length > 2 && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            +{variant.barcodes.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">
                                        -
                                      </span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="batches" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Warehouse className="h-4 w-4" />
                        Inventory Batches
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>SKU</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Branch</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead>Batch #</TableHead>
                              <TableHead>Received</TableHead>
                              <TableHead>Expires</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {productDetail.batches.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  className="h-24 text-center text-muted-foreground"
                                >
                                  No batches found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              productDetail.batches.map((batch) => {
                                const isExpiringSoon =
                                  batch.expiresAt &&
                                  batch.expiresAt <
                                    Date.now() + 30 * 24 * 60 * 60 * 1000;
                                const isExpired =
                                  batch.expiresAt &&
                                  batch.expiresAt < Date.now();

                                return (
                                  <TableRow key={batch._id}>
                                    <TableCell className="font-medium">
                                      {batch.skuCode}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        {batch.zoneName}
                                      </div>
                                    </TableCell>
                                    <TableCell>{batch.branchName}</TableCell>
                                    <TableCell className="text-right font-medium">
                                      {batch.quantity.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                      {batch.supplierBatchNumber ||
                                        batch.internalBatchNumber ||
                                        "-"}
                                    </TableCell>
                                    <TableCell>
                                      {formatDate(batch.receivedAt)}
                                    </TableCell>
                                    <TableCell>
                                      {batch.expiresAt ? (
                                        <span
                                          className={cn(
                                            isExpired
                                              ? "text-red-600 font-medium"
                                              : isExpiringSoon
                                                ? "text-yellow-600 font-medium"
                                                : ""
                                          )}
                                        >
                                          {formatDate(batch.expiresAt)}
                                          {isExpired && (
                                            <Badge
                                              variant="destructive"
                                              className="ml-2 text-xs"
                                            >
                                              Expired
                                            </Badge>
                                          )}
                                          {isExpiringSoon && !isExpired && (
                                            <Badge
                                              variant="outline"
                                              className="ml-2 text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/60"
                                            >
                                              Expiring Soon
                                            </Badge>
                                          )}
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground">
                                          -
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

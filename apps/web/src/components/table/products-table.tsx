"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CreateProductDialog } from "@/components/products/create-product-dialog";
import { DeleteProductDialog } from "@/components/products/delete-product-dialog";
import { EditProductDialog } from "@/components/products/edit-product-dialog";
import TableCellFirst from "@/components/table/table-cell-first";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useCurrentUser } from "@/hooks/use-current-user";
import { type ProductListItem, useProductsList } from "@/hooks/use-products";

// Product table item type - flattened view showing one row per variant
export type ProductTableItem = {
  _id: string;
  productId: string;
  variantId: string;
  barcode: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  variantDescription: string;
  storageRequirement: string;
  trackingMethod: string;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
};

// Actions Cell Component
function ActionsCell({
  product,
  onEdit,
  onDelete,
}: {
  product: ProductTableItem;
  onEdit: (productId: Id<"products">) => void;
  onDelete: (productId: Id<"products">, name: string) => void;
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onEdit(product.productId as Id<"products">)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit product
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() =>
              onDelete(product.productId as Id<"products">, product.name)
            }
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const columns: ColumnDef<ProductTableItem>[] = [
  {
    accessorKey: "barcode",
    header: () => <span className="font-medium">Barcode</span>,
    cell: ({ row }) => (
      <TableCellFirst>{row.getValue("barcode") || "-"}</TableCellFirst>
    ),
  },
  {
    accessorKey: "sku",
    header: () => <span className="font-medium">SKU</span>,
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("sku")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: () => <span className="font-medium">Name</span>,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: () => <span className="font-medium">Category</span>,
    cell: ({ row }) => <div>{row.getValue("category") || "-"}</div>,
  },
  {
    accessorKey: "brand",
    header: () => <span className="font-medium">Brand</span>,
    cell: ({ row }) => <div>{row.getValue("brand") || "-"}</div>,
  },
  {
    accessorKey: "variantDescription",
    header: () => <span className="font-medium">Variant</span>,
    cell: ({ row }) => <div>{row.getValue("variantDescription") || "-"}</div>,
  },
  {
    accessorKey: "storageRequirement",
    header: () => <span className="font-medium">Storage</span>,
    cell: ({ row }) => <div>{row.getValue("storageRequirement") || "-"}</div>,
  },
  {
    accessorKey: "trackingMethod",
    header: () => <span className="font-medium">Tracking</span>,
    cell: ({ row }) => <div>{row.getValue("trackingMethod") || "-"}</div>,
  },
  {
    accessorKey: "costPrice",
    header: () => <span className="block text-right font-medium">Cost</span>,
    cell: ({ row }) => {
      const price = row.getValue("costPrice") as number;
      return (
        <div className="text-right">
          {price?.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          }) ?? "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "sellingPrice",
    header: () => <span className="block text-right font-medium">Price</span>,
    cell: ({ row }) => {
      const price = row.getValue("sellingPrice") as number;
      return (
        <div className="text-right">
          {price?.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          }) ?? "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => (
      <div className="text-right">
        <span className="font-medium">Actions</span>
      </div>
    ),
    enableHiding: false,
    cell: () => null, // Will be overridden in component
  },
];

// Helper function to flatten products into table rows
function flattenProductsToTableItems(
  products: ProductListItem[],
): ProductTableItem[] {
  const items: ProductTableItem[] = [];

  for (const product of products) {
    const variants = product.variants ?? [];

    if (variants.length === 0) {
      // Product has no variants - show product without variant info
      items.push({
        _id: `${product._id}-no-variant`,
        productId: product._id,
        variantId: "",
        barcode: "",
        sku: "-",
        name: product.name,
        category: product.category?.name ?? "",
        brand: product.brand?.name ?? "",
        variantDescription: "-",
        storageRequirement: product.storageRequirement?.lookupValue ?? "",
        trackingMethod: product.trackingMethod?.lookupValue ?? "",
        costPrice: 0,
        sellingPrice: 0,
        isActive: product.isActive,
      });
    } else {
      // Create one row per variant
      for (const variant of variants) {
        const primaryBarcode = variant.barcodes?.[0]?.barcodeValue ?? "";

        items.push({
          _id: `${product._id}-${variant._id}`,
          productId: product._id,
          variantId: variant._id,
          barcode: primaryBarcode,
          sku: variant.skuCode,
          name: product.name,
          category: product.category?.name ?? "",
          brand: product.brand?.name ?? "",
          variantDescription: variant.description,
          storageRequirement: product.storageRequirement?.lookupValue ?? "",
          trackingMethod: product.trackingMethod?.lookupValue ?? "",
          costPrice: variant.costPrice,
          sellingPrice: variant.sellingPrice,
          isActive: product.isActive && variant.isActive,
        });
      }
    }
  }

  return items;
}

export function ProductsTable() {
  const { organizationId } = useCurrentUser();

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] =
    useState<Id<"products"> | null>(null);
  const [selectedProductName, setSelectedProductName] = useState("");

  // Fetch products from Convex
  const {
    products: rawProducts,
    isPending,
    error,
  } = useProductsList({
    organizationId: organizationId,
  });

  // Transform products to table items
  const products = useMemo(
    () => flattenProductsToTableItems(rawProducts as ProductListItem[]),
    [rawProducts],
  );

  // Handle edit
  const handleEdit = (productId: Id<"products">) => {
    setSelectedProductId(productId);
    setEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (productId: Id<"products">, name: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(name);
    setDeleteDialogOpen(true);
  };

  // Dynamic columns with callbacks
  const tableColumns = useMemo(() => {
    return columns.map((col) => {
      if (col.id === "actions") {
        return {
          ...col,
          cell: ({ row }: { row: { original: ProductTableItem } }) => (
            <ActionsCell
              product={row.original}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ),
        };
      }
      return col;
    });
  }, []);

  const table = useReactTable({
    data: products ?? [],
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isPending) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-destructive">
          Error loading products: {error.message}
        </p>
      </div>
    );
  }

  const totalProducts = products?.length ?? 0;

  return (
    <div className="w-full">
      <div className="flex flex-row justify-end pb-4">
        <CreateProductDialog />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table className="bg-card">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="hidden items-center gap-2 lg:flex">
          <Label htmlFor="Showing" className="font-medium text-sm">
            Showing
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label htmlFor="per-page" className="font-medium text-sm">
            per page
          </Label>
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="flex w-fit items-center justify-center font-medium text-sm">
            Showing {table.getRowModel().rows.length} product(s) of{" "}
            {totalProducts} total
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Product Dialog */}
      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        productId={selectedProductId}
      />

      {/* Delete Product Dialog */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        productId={selectedProductId}
        productName={selectedProductName}
      />
    </div>
  );
}

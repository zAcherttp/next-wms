"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { CreateProductDialog } from "@/components/products/create-product-dialog";
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

// Product type for the table
export type ProductTableItem = {
  _id: string;
  barcode: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  variant: string;
  zoneType: string;
  itemType: string;
};

// Actions Cell Component
function ActionsCell({ product }: { product: ProductTableItem }) {
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
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Edit product</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
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
      <TableCellFirst>{row.getValue("barcode")}</TableCellFirst>
    ),
  },
  {
    accessorKey: "sku",
    header: () => <span className="font-medium">SKU</span>,
    cell: ({ row }) => <div>{row.getValue("sku")}</div>,
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
    cell: ({ row }) => <div>{row.getValue("category")}</div>,
  },
  {
    accessorKey: "brand",
    header: () => <span className="font-medium">Brand</span>,
    cell: ({ row }) => <div>{row.getValue("brand")}</div>,
  },
  {
    accessorKey: "variant",
    header: () => <span className="font-medium">Variant</span>,
    cell: ({ row }) => <div>{row.getValue("variant")}</div>,
  },
  {
    accessorKey: "zoneType",
    header: () => <span className="font-medium">Zone Type</span>,
    cell: ({ row }) => <div>{row.getValue("zoneType")}</div>,
  },
  {
    accessorKey: "itemType",
    header: () => <span className="font-medium">Item Type</span>,
    cell: ({ row }) => <div>{row.getValue("itemType")}</div>,
  },
  {
    id: "actions",
    header: () => (
      <div className="text-right">
        <span className="font-medium">Actions</span>
      </div>
    ),
    enableHiding: false,
    cell: ({ row }) => {
      return <ActionsCell product={row.original} />;
    },
  },
];

export function ProductsTable() {
  // Mock data for testing
  const products: ProductTableItem[] = [
    {
      _id: "1",
      barcode: "",
      sku: "",
      name: "PROD-01",
      category: "",
      brand: "",
      variant: "",
      zoneType: "",
      itemType: "",
    },
    {
      _id: "2",
      barcode: "",
      sku: "",
      name: "PROD-02",
      category: "",
      brand: "",
      variant: "",
      zoneType: "",
      itemType: "",
    },
    {
      _id: "3",
      barcode: "",
      sku: "",
      name: "PROD-03",
      category: "",
      brand: "",
      variant: "",
      zoneType: "",
      itemType: "",
    },
  ];
  const isLoading = false;

  const table = useReactTable({
    data: products ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-muted-foreground">Loading products...</p>
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
    </div>
  );
}

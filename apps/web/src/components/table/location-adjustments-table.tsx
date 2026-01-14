"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from "lucide-react";
import * as React from "react";
import { FilterPopover } from "@/components/table/filter-popover";
import TableCellFirst from "@/components/table/table-cell-first";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, getBadgeStyleByStatus } from "@/lib/utils";
import {
  type LocationAdjustmentRequest,
  MOCK_LOCATION_ADJUSTMENTS,
} from "@/mock/data/adjustments";

// Status filter options
const statusFilterOptions = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

interface LocationAdjustmentsTableProps {
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
}

export function LocationAdjustmentsTable({
  onApprove,
  onReject,
  onView,
}: LocationAdjustmentsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);

  // Using mock data
  const data = MOCK_LOCATION_ADJUSTMENTS;

  const columns: ColumnDef<LocationAdjustmentRequest>[] = [
    {
      accessorKey: "requestCode",
      header: "Request ID",
      cell: ({ row }) => (
        <TableCellFirst className="text-primary">
          {row.getValue("requestCode")}
        </TableCellFirst>
      ),
    },
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("productName")}</span>
      ),
    },
    {
      accessorKey: "fromLocation",
      header: "From Location",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("fromLocation")}</span>
      ),
    },
    {
      accessorKey: "toLocation",
      header: "To Location",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("toLocation")}</span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("quantity")}</span>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.getValue("reason")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant="outline"
            className={cn("capitalize", getBadgeStyleByStatus(status))}
          >
            {status}
          </Badge>
        );
      },
      filterFn: (row, id, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true;
        const status = (row.getValue(id) as string).toLowerCase();
        return filterValue.includes(status);
      },
    },
    {
      accessorKey: "requestedBy",
      header: "Requested By",
      cell: ({ row }) => {
        const requestedBy = row.original.requestedBy;
        return (
          <span className="text-sm">{requestedBy?.fullName ?? "Unknown"}</span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const adjustment = row.original;
        const isPending = adjustment.status === "Pending";

        return (
          <div className="flex items-center gap-2">
            {isPending ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-green-600 hover:bg-transparent hover:text-green-700"
                  onClick={() => onApprove?.(adjustment._id as string)}
                >
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-red-600 hover:bg-transparent hover:text-red-700"
                  onClick={() => onReject?.(adjustment._id as string)}
                >
                  Reject
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-primary hover:bg-transparent hover:text-primary/80"
                onClick={() => onView?.(adjustment._id as string)}
              >
                View
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Filter data based on status
  const filteredData = React.useMemo(() => {
    if (statusFilter.length === 0) return data;
    return data.filter((item) =>
      statusFilter.includes(item.status.toLowerCase()),
    );
  }, [data, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <InputGroup className="max-w-sm">
          <InputGroupAddon align="inline-start">
            <Filter className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by product or request ID..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </InputGroup>

        <div className="flex items-center gap-2">
          <FilterPopover
            label="All Status"
            options={statusFilterOptions}
            currentValue={statusFilter}
            onChange={(value) =>
              setStatusFilter(Array.isArray(value) ? value : [])
            }
            variant="multi-select"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
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
                  No location transfer requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

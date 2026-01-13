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
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Funnel,
} from "lucide-react";
import * as React from "react";
import TableCellFirst from "@/components/table/table-cell-first";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedInput } from "@/hooks/use-debounced-input";
import { cn, getBadgeStyleByStatus } from "@/lib/utils";
import {
  MOCK_QUANTITY_ADJUSTMENTS,
  type QuantityAdjustmentRequest,
} from "@/mock/data/adjustments";

interface FilterPopoverProps {
  label: string;
  options: { label: string; value: string }[];
  currentValue?: string | string[];
  onChange: (value: string | string[] | undefined) => void;
  isSort?: boolean;
  variant?: "single" | "multi-select";
}

const FilterPopover = ({
  label,
  options,
  currentValue,
  onChange,
  isSort = false,
  variant = "single",
}: FilterPopoverProps) => {
  const [searchQuery, instantQuery, debouncedQuery] = useDebouncedInput(
    "",
    100,
  );

  const isFiltered =
    variant === "single"
      ? currentValue !== undefined && currentValue !== "default"
      : Array.isArray(currentValue) && currentValue.length > 0;

  const selectedValues = Array.isArray(currentValue) ? currentValue : [];
  const allSelected = selectedValues.length === 0;

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  const toggleSelection = (value: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const currentArray = Array.isArray(currentValue) ? currentValue : [];
    const newSelected = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    onChange(newSelected.length === 0 ? undefined : newSelected);
  };

  const toggleAll = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onChange(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={isFiltered ? "default" : "ghost"} size={"sm"}>
          {label}
          {variant === "multi-select" && selectedValues.length > 0 && (
            <span className="ml-1 rounded-full bg-primary-foreground px-1.5 text-primary text-xs">
              {selectedValues.length}
            </span>
          )}
          {isSort ? <ArrowUpDown /> : <Funnel />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command shouldFilter={false}>
          {variant === "multi-select" && (
            <CommandInput
              placeholder="Search..."
              value={instantQuery}
              onValueChange={searchQuery}
              className="h-9"
            />
          )}
          <CommandList>
            {variant === "multi-select" ? (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => toggleAll()}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Checkbox
                      checked={allSelected}
                      className="pointer-events-none"
                    />
                    <span>All</span>
                  </CommandItem>
                </CommandGroup>
                <ScrollArea className="h-[200px]">
                  <CommandGroup>
                    {filteredOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => toggleSelection(option.value)}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Checkbox
                          checked={selectedValues.includes(option.value)}
                          className="pointer-events-none"
                        />
                        <span>{option.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </ScrollArea>
              </>
            ) : (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => onChange(option.value)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2",
                      currentValue === option.value && "bg-accent",
                    )}
                  >
                    <span>{option.label}</span>
                    {currentValue === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Status filter options
const statusFilterOptions = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

interface QuantityAdjustmentsTableProps {
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
}

export function QuantityAdjustmentsTable({
  onApprove,
  onReject,
  onView,
}: QuantityAdjustmentsTableProps) {
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
  const data = MOCK_QUANTITY_ADJUSTMENTS;

  const columns: ColumnDef<QuantityAdjustmentRequest>[] = [
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
      accessorKey: "currentQty",
      header: "Current QTY",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("currentQty")}</span>
      ),
    },
    {
      accessorKey: "adjustedQty",
      header: "Adjusted QTY",
      cell: ({ row }) => {
        const current = row.original.currentQty;
        const adjusted = row.getValue("adjustedQty") as number;
        const isDecrease = adjusted < current;
        return (
          <span
            className={cn(
              "font-medium text-sm",
              isDecrease ? "text-red-600" : "text-green-600",
            )}
          >
            {adjusted}
          </span>
        );
      },
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
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
                  No adjustment requests found.
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

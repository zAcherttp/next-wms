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
  MoreHorizontal,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import * as React from "react";
import { AddReceiveSessionDialog } from "@/components/add-receive-session-dialog";
import { ReceiveSessionDetailDialog } from "@/components/receive-session-detail-dialog";
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { cn } from "@/lib/utils";
import {
  MOCK_RECEIVE_SESSIONS,
  type ReceiveSession,
} from "@/mock/data/receiving-sessions";

const getBadgeStyleByStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case "receiving":
      return "bg-orange-500/10 text-orange-600 border-orange-500/60";
    case "completed":
      return "bg-green-500/10 text-green-600 border-green-500/60";
    case "pending":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/60";
    case "returned":
      return "bg-blue-500/10 text-blue-600 border-blue-500/60";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/60";
  }
};

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
            <span className="ml-1">({selectedValues.length})</span>
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
                    onSelect={(_value) => toggleAll()}
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
                    onSelect={() => {
                      onChange(
                        option.value === "all" ? undefined : option.value,
                      );
                    }}
                    className="flex justify-between"
                  >
                    {option.label}
                    {(currentValue === option.value ||
                      (currentValue === "default" &&
                        option.value === "default") ||
                      (!currentValue && option.value === "all")) && (
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

export const columns: ColumnDef<ReceiveSession>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: "IO-ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("code")}</div>
    ),
  },
  {
    accessorKey: "from",
    header: ({ column }) => {
      const suppliers = Array.from(
        new Set(MOCK_RECEIVE_SESSIONS.map((session) => session.from)),
      ).map((name) => ({ label: name, value: name }));

      const currentFilter = column.getFilterValue() as string[] | undefined;

      return (
        <FilterPopover
          label="From"
          options={suppliers}
          currentValue={currentFilter}
          onChange={(value) => column.setFilterValue(value)}
          variant="multi-select"
        />
      );
    },
    filterFn: (row, id, value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
      const rowValue = row.getValue(id) as string;
      return Array.isArray(value)
        ? value.includes(rowValue)
        : rowValue === value;
    },
    cell: ({ row }) => <div>{row.getValue("from")}</div>,
  },
  {
    accessorKey: "totalItems",
    header: ({ column }) => {
      const sortOptions = [
        { label: "Default", value: "default" },
        { label: "Ascending", value: "asc" },
        { label: "Descending", value: "desc" },
      ];

      const currentSort = column.getIsSorted();
      const currentValue = currentSort ? String(currentSort) : "default";

      return (
        <div className="flex items-center justify-end">
          <FilterPopover
            label="Total items"
            options={sortOptions}
            currentValue={currentValue}
            onChange={(value) => {
              if (value === "default" || !value) {
                column.clearSorting();
              } else {
                column.toggleSorting(value === "desc", false);
              }
            }}
            isSort
          />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="text-right font-medium">{row.getValue("totalItems")}</div>
    ),
  },
  {
    accessorKey: "orderedAt",
    header: ({ column }) => {
      const sortOptions = [
        { label: "Default", value: "default" },
        { label: "Ascending", value: "asc" },
        { label: "Descending", value: "desc" },
      ];

      const currentSort = column.getIsSorted();
      const currentValue = currentSort ? String(currentSort) : "default";

      return (
        <div className="flex items-center justify-end">
          <FilterPopover
            label="Ordered at"
            options={sortOptions}
            currentValue={currentValue}
            onChange={(value) => {
              if (value === "default" || !value) {
                column.clearSorting();
              } else {
                column.toggleSorting(value === "desc", false);
              }
            }}
            isSort
          />
        </div>
      );
    },
    cell: ({ row }) => {
      const timestamp = row.getValue("orderedAt") as number;
      const formatted = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(timestamp));

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "expectedBy",
    header: ({ column }) => {
      const sortOptions = [
        { label: "Default", value: "default" },
        { label: "Ascending", value: "asc" },
        { label: "Descending", value: "desc" },
      ];

      const currentSort = column.getIsSorted();
      const currentValue = currentSort ? String(currentSort) : "default";

      return (
        <div className="flex items-center justify-end">
          <FilterPopover
            label="Expected by"
            options={sortOptions}
            currentValue={currentValue}
            onChange={(value) => {
              if (value === "default" || !value) {
                column.clearSorting();
              } else {
                column.toggleSorting(value === "desc", false);
              }
            }}
            isSort
          />
        </div>
      );
    },
    cell: ({ row }) => {
      const timestamp = row.getValue("expectedBy") as number;
      const formatted = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(timestamp));

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      const statusFilterOptions = [
        { label: "All", value: "all" },
        { label: "Receiving", value: "receiving" },
        { label: "Pending", value: "pending" },
        { label: "Completed", value: "completed" },
        { label: "Returned", value: "returned" },
      ];

      const currentFilter = column.getFilterValue() as string | undefined;

      return (
        <div className="flex items-center justify-center">
          <FilterPopover
            label="Status"
            options={statusFilterOptions}
            currentValue={currentFilter}
            onChange={(value) => column.setFilterValue(value)}
          />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as string;
      return rowValue.toLowerCase() === value.toLowerCase();
    },
    cell: ({ row }) => (
      <div className="text-center">
        <Badge
          className={cn(
            "w-24 justify-center rounded-sm text-center text-xs",
            getBadgeStyleByStatus(row.getValue("status")),
          )}
          variant={"outline"}
        >
          {row.getValue("status")}
        </Badge>
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const session = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={"icon-sm"}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(session.code)}
            >
              Copy IO-ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ReceiveSessionDetailDialog
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  View details
                </DropdownMenuItem>
              }
            />
            {(session.status === "Pending" ||
              session.status === "Receiving") && (
              <DropdownMenuItem asChild>
                <Link
                  href={`receiving-sessions/${session.id}/verifying` as Route}
                >
                  Proceed
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ReceiveSessionsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [setFilterValue, instantFilterValue, debouncedFilterValue] =
    useDebouncedInput("", 300);

  const table = useReactTable({
    data: MOCK_RECEIVE_SESSIONS,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  React.useEffect(() => {
    table.getColumn("code")?.setFilterValue(debouncedFilterValue);
  }, [debouncedFilterValue, table]);

  const activeFiltersCount =
    sorting.length + columnFilters.length + (instantFilterValue ? 1 : 0);

  const handleClearAllFilters = () => {
    table.resetColumnFilters();
    table.resetSorting();
    setFilterValue("");
  };

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between pb-4">
        <InputGroup className="max-w-[200px]">
          <InputGroupInput
            placeholder="Filter IO-ID..."
            value={instantFilterValue}
            onChange={(event) => setFilterValue(event.target.value)}
          />
          <InputGroupAddon>
            <Filter />
          </InputGroupAddon>
        </InputGroup>
        <div className="flex items-center gap-2">
          {activeFiltersCount >= 2 && (
            <Button
              variant={"default"}
              className=""
              onClick={handleClearAllFilters}
            >
              Clear filters ({activeFiltersCount})
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
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
          <AddReceiveSessionDialog />
        </div>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

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
  Eye,
  Filter,
  Funnel,
  MoreHorizontal,
  Play,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";
import { CycleCountSessionDetailDialog } from "@/components/cycle-count-session-detail-dialog";
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
import type { CycleCountSessionListItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MOCK_CYCLE_COUNT_SESSIONS } from "@/mock/data/cycle-count";

const getBadgeStyleByStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
    case "in progress":
      return "bg-green-500/10 text-green-600 border-green-500/60";
    case "completed":
      return "bg-blue-500/10 text-blue-600 border-blue-500/60";
    case "pending":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/60";
    case "cancelled":
      return "bg-red-500/10 text-red-600 border-red-500/60";
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
            <ScrollArea className="max-h-[200px]">
              <CommandGroup>
                {variant === "multi-select" && (
                  <CommandItem
                    onSelect={() => toggleAll()}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        allSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50",
                      )}
                    >
                      {allSelected && <Check className="h-3 w-3" />}
                    </div>
                    All
                  </CommandItem>
                )}
                {filteredOptions.map((option) => {
                  if (variant === "multi-select") {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => toggleSelection(option.value)}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50",
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        {option.label}
                      </CommandItem>
                    );
                  }
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => onChange(option.value)}
                      className="cursor-pointer"
                    >
                      {option.label}
                      {currentValue === option.value && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export function CycleCountSessionsTable() {
  const params = useParams();
  const workspace = params.workspace as string;

  // Using mock data instead of Convex
  const cycleCountSessions = MOCK_CYCLE_COUNT_SESSIONS;
  const isPending = false;

  // Detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [selectedSessionId, setSelectedSessionId] = React.useState<
    string | null
  >(null);

  const handleViewDetails = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setDetailDialogOpen(true);
  };

  const columns: ColumnDef<CycleCountSessionListItem>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
        accessorKey: "sessionCode",
        header: "Session ID",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => handleViewDetails(row.original._id.toString())}
            className="font-medium text-primary hover:underline"
          >
            {row.getValue("sessionCode")}
          </button>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate">{row.getValue("name")}</div>
        ),
      },
      {
        id: "cycleCountType.lookupValue",
        accessorFn: (row) => row.cycleCountType?.lookupValue,
        header: ({ column }) => {
          const typeOptions = [
            { label: "All", value: "all" },
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
            { label: "Quarterly", value: "quarterly" },
          ];

          const currentFilter = column.getFilterValue() as string | undefined;

          return (
            <FilterPopover
              label="Type"
              options={typeOptions}
              currentValue={currentFilter}
              onChange={(value) =>
                column.setFilterValue(value === "all" ? undefined : value)
              }
            />
          );
        },
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          const rowValue = row.getValue(id) as string;
          return rowValue?.toLowerCase() === value?.toLowerCase();
        },
        cell: ({ row }) => (
          <div className="text-center">
            {row.getValue("cycleCountType.lookupValue") ?? "-"}
          </div>
        ),
      },
      {
        accessorKey: "zonesCount",
        header: "Zones",
        cell: ({ row }) => {
          const count = row.getValue("zonesCount") as number;
          return (
            <div className="text-center">
              {count} {count === 1 ? "zone" : "zones"}
            </div>
          );
        },
      },
      {
        id: "sessionStatus.lookupValue",
        accessorFn: (row) => row.sessionStatus?.lookupValue,
        header: ({ column }) => {
          const statusOptions = [
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "In Progress", value: "in progress" },
            { label: "Pending", value: "pending" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ];

          const currentFilter = column.getFilterValue() as string | undefined;

          return (
            <div className="flex items-center justify-center">
              <FilterPopover
                label="Status"
                options={statusOptions}
                currentValue={currentFilter}
                onChange={(value) =>
                  column.setFilterValue(value === "all" ? undefined : value)
                }
              />
            </div>
          );
        },
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          const rowValue = row.getValue(id) as string;
          return rowValue?.toLowerCase() === value?.toLowerCase();
        },
        cell: ({ row }) => {
          const status = row.getValue("sessionStatus.lookupValue") as string;
          return (
            <div className="text-center">
              <Badge
                className={cn(
                  "rounded-sm text-center",
                  getBadgeStyleByStatus(status ?? ""),
                )}
                variant={"outline"}
              >
                {status ?? "Unknown"}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "createdByUser.fullName",
        accessorFn: (row) => row.createdByUser?.fullName,
        header: "Created By",
        cell: ({ row }) => (
          <div className="">{row.getValue("createdByUser.fullName") ?? "-"}</div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const session = row.original;
          const status = session.sessionStatus?.lookupValue?.toLowerCase();

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
                {status === "active" || status === "pending" ? (
                  <DropdownMenuItem>
                    <Play className="mr-2 h-4 w-4" />
                    Proceed
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  onClick={() => handleViewDetails(session._id.toString())}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleViewDetails],
  );

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
    data: cycleCountSessions ?? [],
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
    table.getColumn("sessionCode")?.setFilterValue(debouncedFilterValue);
  }, [debouncedFilterValue, table]);

  const activeFiltersCount =
    sorting.length + columnFilters.length + (instantFilterValue ? 1 : 0);

  const handleClearAllFilters = () => {
    table.resetColumnFilters();
    table.resetSorting();
    setFilterValue("");
  };

  if (isPending) {
    return (
      <div className="w-full space-y-4">
        <div className="flex flex-row justify-between pb-4">
          <div className="h-10 w-[200px] animate-pulse rounded bg-muted" />
          <div className="h-10 w-[100px] animate-pulse rounded bg-muted" />
        </div>
        <div className="overflow-hidden rounded-md border">
          <div className="bg-card p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted mb-2" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Detail Dialog */}
      <CycleCountSessionDetailDialog
        sessionId={selectedSessionId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      <div className="flex flex-row justify-between pb-4">
        <InputGroup className="max-w-[250px]">
          <InputGroupInput
            placeholder="Search by session name or ID..."
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
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-muted-foreground"
            >
              Clear all filters
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

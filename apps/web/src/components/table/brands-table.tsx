"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
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
} from "@tanstack/react-table";
import { api } from "@wms/backend/convex/_generated/api";
import {
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Funnel,
  MoreHorizontal,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { CreateBrandDialog } from "@/components/table/create-brand-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useDebouncedInput } from "@/hooks/use-debounced-input";
import type { Brand } from "@/lib/types";
import { cn } from "@/lib/utils";

const getStatusBadgeStyle = (isActive: boolean) => {
  return isActive
    ? "bg-green-500/10 text-green-500 border-green-500/60"
    : "bg-gray-500/10 text-gray-500 border-gray-500/60";
};

interface FilterPopoverProps {
  label: string;
  options: { label: string; value: string }[];
  currentValue?: string;
  onChange: (value: string | undefined) => void;
  isSort?: boolean;
}

const FilterPopover = ({
  label,
  options,
  currentValue,
  onChange,
  isSort = false,
}: FilterPopoverProps) => {
  const isFiltered = currentValue !== undefined && currentValue !== "default";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={isFiltered ? "default" : "ghost"} size={"sm"}>
          {label}
          {isSort ? <ArrowUpDown /> : <Funnel />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-50 p-0">
        <Command shouldFilter={false}>
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(option.value === "all" ? undefined : option.value);
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const columns: ColumnDef<Brand>[] = [
  {
    accessorKey: "name",
    header: () => {
      return <span className="pl-1">Brand</span>;
    },
    cell: ({ row }) => (
      <div className="pl-1 font-medium">{row.getValue("name")}</div>
    ),
    filterFn: (row, _id, value) => {
      const name = row.getValue("name") as string;
      return name.toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => {
      const statusFilterOptions = [
        { label: "All", value: "all" },
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
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
      const rowValue = row.getValue(id) as boolean;
      return String(rowValue) === value;
    },
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <div className="text-center">
          <Badge
            className={cn(
              "w-16 rounded-sm text-center",
              getStatusBadgeStyle(isActive),
            )}
            variant={"outline"}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "_creationTime",
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
            label="Created At"
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
      const timestamp = row.getValue("_creationTime") as number;
      const formatted = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(new Date(timestamp));

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: function ActionsCell({ row }) {
      const brand = row.original;

      const { mutate: deactivate } = useMutation({
        mutationFn: useConvexMutation(api.brands.deactivateBrand),
      });

      const { mutate: updateBrand } = useMutation({
        mutationFn: useConvexMutation(api.brands.updateBrand),
      });

      const handleDeactivate = () => {
        deactivate(
          { id: brand._id },
          {
            onSuccess: () => {
              toast.success(`Brand "${brand.name}" deactivated`);
            },
            onError: (error) => {
              toast.error(
                error instanceof Error ? error.message : "Failed to deactivate",
              );
            },
          },
        );
      };

      const handleChangeName = () => {
        const newName = prompt("Enter new brand name:", brand.name);
        if (newName && newName !== brand.name) {
          updateBrand(
            { id: brand._id, name: newName },
            {
              onSuccess: () => {
                toast.success(`Brand renamed to "${newName}"`);
              },
              onError: (error) => {
                toast.error(
                  error instanceof Error ? error.message : "Failed to rename",
                );
              },
            },
          );
        }
      };

      return (
        <div className="flex justify-end pr-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size={"icon-sm"}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleChangeName}>
                Change name
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDeactivate}
                disabled={!brand.isActive}
              >
                Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function BrandsTable() {
  const { organizationId } = useCurrentUser();

  const { data: brands, isLoading } = useQuery({
    ...convexQuery(api.brands.listAll, {
      organizationId: organizationId as unknown as string,
    }),
    enabled: !!organizationId,
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState({});

  const [setFilterValue, instantFilterValue, debouncedFilterValue] =
    useDebouncedInput("", 300);

  const table = useReactTable({
    data: brands ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  React.useEffect(() => {
    table.getColumn("name")?.setFilterValue(debouncedFilterValue);
  }, [debouncedFilterValue, table]);

  const activeFiltersCount =
    sorting.length + columnFilters.length + (instantFilterValue ? 1 : 0);

  const handleClearAllFilters = () => {
    table.resetColumnFilters();
    table.resetSorting();
    setFilterValue("");
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-muted-foreground">Loading brands...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between pb-4">
        <InputGroup className="max-w-60">
          <InputGroupInput
            placeholder="Search by brand name..."
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
          <CreateBrandDialog />
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
                  No brands found.
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
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
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

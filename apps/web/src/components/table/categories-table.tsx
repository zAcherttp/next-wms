"use client";

import { ChevronDown, ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Category type with hierarchy
export type CategoryItem = {
  _id: string;
  name: string;
  parentId: string | null;
  isActive: boolean;
  children?: CategoryItem[];
};

// CreateCategoryDialog component
function CreateCategoryDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    console.log("Creating category:", name);
    setName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add New
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name..."
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Category Row Component (with expand/collapse for children)
function CategoryRow({
  category,
  level = 0,
  expandedIds,
  toggleExpand,
}: {
  category: CategoryItem;
  level?: number;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category._id);

  return (
    <>
      <TableRow>
        <TableCell>
          <div
            className="flex items-center"
            style={{ paddingLeft: `${level * 24}px` }}
          >
            {hasChildren ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="mr-1 h-5 w-5"
                onClick={() => toggleExpand(category._id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <span className="mr-1 inline-block w-5" />
            )}
            <span className="font-medium">{category.name}</span>
          </div>
        </TableCell>
        <TableCell>
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
                <DropdownMenuItem>Edit name</DropdownMenuItem>
                <DropdownMenuItem>Add subcategory</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
      {hasChildren &&
        isExpanded &&
        category.children?.map((child) => (
          <CategoryRow
            key={child._id}
            category={child}
            level={level + 1}
            expandedIds={expandedIds}
            toggleExpand={toggleExpand}
          />
        ))}
    </>
  );
}

export function CategoriesTable() {
  // Mock data for testing - hierarchical structure
  const categories: CategoryItem[] = [
    {
      _id: "1",
      name: "CAT-01",
      parentId: null,
      isActive: true,
      children: [
        {
          _id: "1-1",
          name: "CAT-01-Sub",
          parentId: "1",
          isActive: true,
        },
      ],
    },
    {
      _id: "2",
      name: "CAT-02",
      parentId: null,
      isActive: true,
      children: [],
    },
    {
      _id: "3",
      name: "CAT-03",
      parentId: null,
      isActive: true,
      children: [],
    },
  ];

  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    new Set(["1"]),
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-row justify-end pb-4">
        <CreateCategoryDialog />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table className="bg-card">
          <TableHeader>
            <TableRow>
              <TableHead>
                <span className="font-medium">Name</span>
              </TableHead>
              <TableHead className="text-right">
                <span className="font-medium">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length ? (
              categories.map((category) => (
                <CategoryRow
                  key={category._id}
                  category={category}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import { FileSpreadsheet, MapPin, Pencil, Plus, Upload } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { MOCK_PO } from "@/mock/data/purchase-orders";

// Extract unique suppliers from mock data
const MOCK_SUPPLIERS = Array.from(
  new Set(MOCK_PO.map((po) => po.supplier?.name).filter(Boolean)),
) as string[];

// Mock branches
const MOCK_BRANCHES = ["Main Warehouse", "Branch A", "Branch B", "Branch C"];

interface ProductItem {
  id: string;
  name: string;
  quantity: number;
}

interface AddPurchaseOrderDialogProps {
  trigger?: React.ReactNode;
}

export function AddPurchaseOrderDialog({
  trigger,
}: AddPurchaseOrderDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [poCode, setPoCode] = React.useState("PO-00012");
  const [isEditingCode, setIsEditingCode] = React.useState(false);
  const [receivingBranch, setReceivingBranch] = React.useState<string>("");
  const [supplier, setSupplier] = React.useState<string>("");
  const [note, setNote] = React.useState("");
  const [products, setProducts] = React.useState<ProductItem[]>([
    { id: "1", name: "Dầu gội đầu", quantity: 3 },
  ]);

  const handleAddProduct = () => {
    const newProduct: ProductItem = {
      id: String(products.length + 1),
      name: "",
      quantity: 1,
    };
    setProducts([...products, newProduct]);
  };

  const handleUpdateProductName = (id: string, name: string) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const handleUpdateProductQuantity = (id: string, quantity: number) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, quantity } : p)));
  };

  const handleCreatePurchaseOrder = () => {
    // TODO: Implement actual creation logic
    console.log("Creating purchase order:", {
      poCode,
      receivingBranch,
      supplier,
      note,
      products,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus />
            Add New
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditingCode ? (
              <Input
                value={poCode}
                onChange={(e) => setPoCode(e.target.value)}
                onBlur={() => setIsEditingCode(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingCode(false);
                }}
                className="w-32 font-semibold text-lg italic"
                autoFocus
              />
            ) : (
              <>
                <DialogTitle className="font-semibold text-lg italic">
                  {poCode}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsEditingCode(true)}
                >
                  <Pencil className="size-4" />
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" className="mr-8">
            <FileSpreadsheet className="size-4" />
            Import excel
          </Button>
        </DialogHeader>

        {/* Form Fields */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="receiving-branch">
              Receiving Branch <span className="text-destructive">*</span>
            </Label>
            <Select value={receivingBranch} onValueChange={setReceivingBranch}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_BRANCHES.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">
              Supplier <span className="text-destructive">*</span>
            </Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_SUPPLIERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              placeholder="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Products</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Input
                      value={product.name}
                      onChange={(e) =>
                        handleUpdateProductName(product.id, e.target.value)
                      }
                      placeholder="Product name"
                      className="border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      value={product.quantity}
                      onChange={(e) =>
                        handleUpdateProductQuantity(
                          product.id,
                          Number.parseInt(e.target.value, 10) || 0,
                        )
                      }
                      className="mx-auto w-20 border-none bg-transparent p-0 text-center shadow-none focus-visible:ring-0"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <MapPin className="mr-1 size-4" />
                      Add location
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Add Product Button */}
          <Button variant="outline" className="mt-4" onClick={handleAddProduct}>
            Add product <Plus className="size-4" />
          </Button>
        </div>

        {/* Footer */}
        <DialogFooter className="mt-6">
          <Button variant="outline">
            <Upload className="size-4" />
            Add File
          </Button>
          <Button onClick={handleCreatePurchaseOrder}>
            Create Purchase Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

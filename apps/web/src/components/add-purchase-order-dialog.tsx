"use client";

import { Check, MapPin, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditableField } from "@/components/ui/editable-field";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { MOCK_PO } from "@/mock/data/purchase-orders";

// Extract unique suppliers from mock data
const MOCK_SUPPLIERS = Array.from(
  new Set(MOCK_PO.map((po) => po.supplier?.name).filter(Boolean)),
) as string[];

// Mock branches
const MOCK_BRANCHES = ["Main Warehouse", "Branch A", "Branch B", "Branch C"];

// Mock SKUs data
const MOCK_SKUS = [
  { id: "sku-1", code: "SKU-001A", name: "Industrial Bearing 6mm" },
  { id: "sku-2", code: "SKU-002B", name: "Stainless Steel Bolt M8" },
  { id: "sku-3", code: "SKU-003C", name: "Rubber Gasket 50mm" },
  { id: "sku-4", code: "SKU-004D", name: "Copper Wire 2.5mm" },
  { id: "sku-5", code: "SKU-005E", name: "Aluminum Sheet 1mm" },
  { id: "sku-6", code: "SKU-006F", name: "Plastic Container 500ml" },
  { id: "sku-7", code: "SKU-007G", name: "LED Light Bulb 12W" },
  { id: "sku-8", code: "SKU-008H", name: "Electric Motor 1HP" },
  { id: "sku-9", code: "SKU-009I", name: "PVC Pipe 2inch" },
  { id: "sku-10", code: "SKU-010J", name: "Steel Cable 5mm" },
];

// Mock Zones data
const MOCK_ZONES = [
  { id: "zone-1", name: "Zone A - Receiving" },
  { id: "zone-2", name: "Zone B - Storage" },
  { id: "zone-3", name: "Zone C - Cold Storage" },
  { id: "zone-4", name: "Zone D - Hazardous Materials" },
  { id: "zone-5", name: "Zone E - Bulk Storage" },
  { id: "zone-6", name: "Zone F - Fast Moving" },
  { id: "zone-7", name: "Zone G - Overflow" },
  { id: "zone-8", name: "Zone H - Returns" },
];

interface ProductItem {
  id: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  quantity: number;
  zoneId?: string;
  zoneName?: string;
}

interface AddPurchaseOrderDialogProps {
  trigger?: React.ReactNode;
}

export function AddPurchaseOrderDialog({
  trigger,
}: AddPurchaseOrderDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [poCode, setPoCode] = React.useState("PO-00012");
  const [receivingBranch, setReceivingBranch] = React.useState<string>("");
  const [supplier, setSupplier] = React.useState<string>("");
  const [products, setProducts] = React.useState<ProductItem[]>([]);
  const [skuPopoverOpen, setSkuPopoverOpen] = React.useState(false);
  const [zonePopoverOpenId, setZonePopoverOpenId] = React.useState<
    string | null
  >(null);

  // Get list of already selected SKU IDs
  const selectedSkuIds = products.map((p) => p.skuId);

  // Filter out already selected SKUs
  const availableSkus = MOCK_SKUS.filter(
    (sku) => !selectedSkuIds.includes(sku.id),
  );

  const handleAddProduct = (sku: (typeof MOCK_SKUS)[0]) => {
    const newProduct: ProductItem = {
      id: String(Date.now()),
      skuId: sku.id,
      skuCode: sku.code,
      skuName: sku.name,
      quantity: 1,
    };
    setProducts([...products, newProduct]);
    setSkuPopoverOpen(false);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleUpdateProductQuantity = (id: string, quantity: number) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, quantity } : p)));
  };

  const handleSelectZone = (
    productId: string,
    zone: (typeof MOCK_ZONES)[0],
  ) => {
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, zoneId: zone.id, zoneName: zone.name } : p,
      ),
    );
    setZonePopoverOpenId(null);
  };

  const handleCreatePurchaseOrder = () => {
    // TODO: Implement actual creation logic
    // console.log("Creating purchase order:", {
    //   poCode,
    //   receivingBranch,
    //   supplier,
    //   products,
    // });
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
      <DialogContent className="flex max-h-250 w-full flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Purchase Order</DialogTitle>
        </DialogHeader>

        {/* Form Fields */}
        <div className="flex max-w-150 flex-row gap-4">
          <div className="space-y-2">
            <Label htmlFor="receiving-branch">
              PO-ID<span className="text-destructive">*</span>
            </Label>
            <EditableField
              value={poCode}
              onChange={setPoCode}
              placeholder="Leave blank to auto-generate"
              inputClassName="min-w-40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receiving-branch">
              Receiving Branch<span className="text-destructive">*</span>
            </Label>
            <Select value={receivingBranch} onValueChange={setReceivingBranch}>
              <SelectTrigger className="min-w-40">
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
              <SelectTrigger className="min-w-40">
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
        </div>

        {/* Products Table */}
        <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="max-h-75 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-3">SKU Code</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-20 text-center text-muted-foreground"
                    >
                      No products added yet. Click "Add product" to add items.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="px-3 font-medium">
                        {product.skuCode}
                      </TableCell>
                      <TableCell>{product.skuName}</TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={1}
                          value={product.quantity}
                          onChange={(e) =>
                            handleUpdateProductQuantity(
                              product.id,
                              Number.parseInt(e.target.value, 10) || 1,
                            )
                          }
                          className="mx-auto w-20 text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Popover
                          open={zonePopoverOpenId === product.id}
                          onOpenChange={(isOpen) =>
                            setZonePopoverOpenId(isOpen ? product.id : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "w-full justify-start",
                                !product.zoneName && "text-muted-foreground",
                              )}
                            >
                              <MapPin className="mr-1 size-4" />
                              {product.zoneName || "Select zone"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-62.5 p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search zones..." />
                              <CommandList>
                                <CommandEmpty>No zone found.</CommandEmpty>
                                <CommandGroup>
                                  {MOCK_ZONES.map((zone) => (
                                    <CommandItem
                                      key={zone.id}
                                      value={zone.name}
                                      onSelect={() =>
                                        handleSelectZone(product.id, zone)
                                      }
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          product.zoneId === zone.id
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      {zone.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Add Product Button with SKU Selection */}
          <Popover open={skuPopoverOpen} onOpenChange={setSkuPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="mt-4">
                Add product <Plus className="ml-1 size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-87.5 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search SKU code or name..." />
                <CommandList>
                  <CommandEmpty>No SKU found.</CommandEmpty>
                  <CommandGroup heading="Available SKUs">
                    {availableSkus.map((sku) => (
                      <CommandItem
                        key={sku.id}
                        value={`${sku.code} ${sku.name}`}
                        onSelect={() => handleAddProduct(sku)}
                        className="flex flex-col items-start gap-1 py-2"
                      >
                        <span className="font-medium text-blue-600">
                          {sku.code}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {sku.name}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Footer */}
        <DialogFooter className="mt-6">
          <Button onClick={handleCreatePurchaseOrder}>
            Create Purchase Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

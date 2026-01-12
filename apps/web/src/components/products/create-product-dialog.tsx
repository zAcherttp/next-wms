"use client";

import { Plus, Settings2, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
interface UnitConversion {
  id: string;
  unitName: string;
  conversionValue: number;
  baseUnit: string;
  price: number;
  barcode: string;
}

interface ProductAttribute {
  id: string;
  name: string;
  values: string[];
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
}

// Unit & Attribute Dialog
function UnitAttributeDialog({
  open,
  onOpenChange,
  baseUnit,
  unitConversions,
  setUnitConversions,
  attributes,
  setAttributes,
  variants,
  setVariants,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseUnit: string;
  unitConversions: UnitConversion[];
  setUnitConversions: React.Dispatch<React.SetStateAction<UnitConversion[]>>;
  attributes: ProductAttribute[];
  setAttributes: React.Dispatch<React.SetStateAction<ProductAttribute[]>>;
  variants: ProductVariant[];
  setVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>;
}) {
  const addUnitConversion = () => {
    setUnitConversions([
      ...unitConversions,
      {
        id: Date.now().toString(),
        unitName: "",
        conversionValue: 1,
        baseUnit: baseUnit || "cái",
        price: 0,
        barcode: "",
      },
    ]);
  };

  const removeUnitConversion = (id: string) => {
    setUnitConversions(unitConversions.filter((u) => u.id !== id));
  };

  const addAttribute = () => {
    setAttributes([
      ...attributes,
      {
        id: Date.now().toString(),
        name: "",
        values: [],
      },
    ]);
  };

  const removeAttribute = (id: string) => {
    setAttributes(attributes.filter((a) => a.id !== id));
    generateVariants(attributes.filter((a) => a.id !== id));
  };

  const updateAttributeValues = (id: string, valuesStr: string) => {
    const values = valuesStr
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v);
    const newAttributes = attributes.map((a) =>
      a.id === id ? { ...a, values } : a,
    );
    setAttributes(newAttributes);
    generateVariants(newAttributes);
  };

  const generateVariants = (attrs: ProductAttribute[]) => {
    const validAttrs = attrs.filter((a) => a.name && a.values.length > 0);
    if (validAttrs.length === 0) {
      setVariants([]);
      return;
    }

    // Generate all combinations
    const combinations: string[][] = [];
    const generate = (index: number, current: string[]) => {
      if (index === validAttrs.length) {
        combinations.push([...current]);
        return;
      }
      for (const value of validAttrs[index].values) {
        current.push(value);
        generate(index + 1, current);
        current.pop();
      }
    };
    generate(0, []);

    const newVariants: ProductVariant[] = combinations.map((combo, idx) => ({
      id: `var-${idx}`,
      name: combo.join(" - "),
      sku: `SP001-${combo.join("-").toUpperCase().replace(/\s/g, "")}`,
      costPrice: 50000,
      sellingPrice: 100000,
    }));
    setVariants(newVariants);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>THIẾT LẬP ĐƠN VỊ & THUỘC TÍNH</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="units" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="units">Đơn vị quy đổi</TabsTrigger>
            <TabsTrigger value="attributes">Thuộc tính</TabsTrigger>
          </TabsList>

          <TabsContent value="units" className="space-y-4">
            <p className="text-muted-foreground text-sm">
              &gt; Đơn vị cơ bản: [ {baseUnit || "cái"} ] (Lấy từ màn hình
              trước)
            </p>

            <div className="space-y-2">
              <h4 className="font-semibold text-amber-600">
                1. DANH SÁCH ĐƠN VỊ QUY ĐỔI
              </h4>
              <p className="text-muted-foreground text-sm">
                (Thêm các đơn vị lớn hơn như Thùng, Hộp, Lốc)
              </p>

              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-2 font-medium text-sm">
                  <span>Tên đơn vị</span>
                  <span>Giá trị quy đổi</span>
                  <span>Giá bán</span>
                  <span>Mã vạch</span>
                  <span></span>
                </div>

                {unitConversions.map((unit) => (
                  <div key={unit.id} className="grid grid-cols-5 gap-2">
                    <Input
                      placeholder="Hộp"
                      value={unit.unitName}
                      onChange={(e) =>
                        setUnitConversions(
                          unitConversions.map((u) =>
                            u.id === unit.id
                              ? { ...u, unitName: e.target.value }
                              : u,
                          ),
                        )
                      }
                    />
                    <div className="flex items-center gap-1">
                      <span>=</span>
                      <Input
                        type="number"
                        value={unit.conversionValue}
                        onChange={(e) =>
                          setUnitConversions(
                            unitConversions.map((u) =>
                              u.id === unit.id
                                ? {
                                    ...u,
                                    conversionValue: Number(e.target.value),
                                  }
                                : u,
                            ),
                          )
                        }
                      />
                      <span>{baseUnit || "cái"}</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="120C"
                      value={unit.price || ""}
                      onChange={(e) =>
                        setUnitConversions(
                          unitConversions.map((u) =>
                            u.id === unit.id
                              ? { ...u, price: Number(e.target.value) }
                              : u,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder="SCAN..."
                      value={unit.barcode}
                      onChange={(e) =>
                        setUnitConversions(
                          unitConversions.map((u) =>
                            u.id === unit.id
                              ? { ...u, barcode: e.target.value }
                              : u,
                          ),
                        )
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeUnitConversion(unit.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="ghost"
                  className="text-amber-600"
                  onClick={addUnitConversion}
                >
                  + Thêm đơn vị tính mới
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attributes" className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-600">
                2. THUỘC TÍNH SẢN PHẨM (tạo nhiều biến thể)
              </h4>
              <p className="text-muted-foreground text-sm">
                (Dùng cho hàng thời trang, điện thoại...)
              </p>

              <div className="space-y-3">
                {attributes.map((attr, idx) => (
                  <div key={attr.id} className="grid grid-cols-4 items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Thuộc tính {idx + 1}:</span>
                      <Input
                        placeholder="Màu sắc"
                        value={attr.name}
                        onChange={(e) =>
                          setAttributes(
                            attributes.map((a) =>
                              a.id === attr.id
                                ? { ...a, name: e.target.value }
                                : a,
                            ),
                          )
                        }
                        className="w-24"
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-sm">Giá trị quy đổi:</span>
                      <Input
                        placeholder="Xanh, Đỏ, Vàng"
                        value={attr.values.join(", ")}
                        onChange={(e) =>
                          updateAttributeValues(attr.id, e.target.value)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeAttribute(attr.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="ghost"
                  className="text-amber-600"
                  onClick={addAttribute}
                >
                  + Thêm thuộc tính mới
                </Button>
              </div>
            </div>

            {variants.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">
                  &gt; DANH SÁCH PHIÊN BẢN HÀNG HÓA ĐƯỢC TẠO ({variants.length}{" "}
                  phiên bản)
                </h4>
                <div className="max-h-48 overflow-y-auto rounded border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Tên phiên bản</th>
                        <th className="p-2 text-left">Mã hàng (SKU)</th>
                        <th className="p-2 text-left">Giá vốn</th>
                        <th className="p-2 text-left">Giá bán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant) => (
                        <tr key={variant.id} className="border-t">
                          <td className="bg-amber-50 p-2">{variant.name}</td>
                          <td className="bg-purple-50 p-2">{variant.sku}</td>
                          <td className="p-2">{variant.costPrice}</td>
                          <td className="p-2">{variant.sellingPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bỏ qua
          </Button>
          <Button onClick={() => onOpenChange(false)}>Xác nhận & Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Create Product Dialog
export function CreateProductDialog() {
  const [open, setOpen] = React.useState(false);
  const [unitAttributeOpen, setUnitAttributeOpen] = React.useState(false);

  // Form state
  const [barcode, setBarcode] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [zoneType, setZoneType] = React.useState("");
  const [baseUnit, setBaseUnit] = React.useState("Piece");

  // Inventory
  const [stock, setStock] = React.useState(0);
  const [minStock, setMinStock] = React.useState(0);
  const [maxStock, setMaxStock] = React.useState(999999999);

  // Unit conversions & attributes (managed by sub-dialog)
  const [unitConversions, setUnitConversions] = React.useState<UnitConversion[]>([]);
  const [attributes, setAttributes] = React.useState<ProductAttribute[]>([]);
  const [variants, setVariants] = React.useState<ProductVariant[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving product:", {
      barcode,
      sku,
      name,
      category,
      brand,
      zoneType,
      baseUnit,
      stock,
      minStock,
      maxStock,
      unitConversions,
      attributes,
      variants,
    });
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="bg-green-500 hover:bg-green-600">
            <Plus className="mr-1 h-4 w-4" />
            Add New
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Barcode & SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    placeholder="Nhập mã vạch..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="Nhập mã SKU..."
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Nhập tên sản phẩm..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Điện tử</SelectItem>
                      <SelectItem value="fashion">Thời trang</SelectItem>
                      <SelectItem value="food">Thực phẩm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Brand</Label>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thương hiệu..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand1">BRAND-01</SelectItem>
                      <SelectItem value="brand2">BRAND-02</SelectItem>
                      <SelectItem value="brand3">BRAND-03</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Zone Type & Base Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Zone Type</Label>
                  <Select value={zoneType} onValueChange={setZoneType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ambient">Ambient</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Base Unit</Label>
                  <Select value={baseUnit} onValueChange={setBaseUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Piece">Piece</SelectItem>
                      <SelectItem value="Box">Box</SelectItem>
                      <SelectItem value="Kg">Kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Inventory Section */}
              <div className="rounded-md border p-4">
                <h4 className="mb-3 font-semibold">Tồn kho</h4>
                <p className="mb-3 text-muted-foreground text-sm">
                  Quán lý số lượng tồn kho và định mức tồn. Khi tồn kho chạm đến
                  định mức, bạn sẽ nhận được cảnh báo.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm">Tồn kho</Label>
                    <Input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm">Định mức tồn thấp nhất</Label>
                    <Input
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm">Định mức tồn cao nhất</Label>
                    <Input
                      type="number"
                      value={maxStock}
                      onChange={(e) => setMaxStock(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Manage Units & Attributes Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-amber-400 text-amber-600"
                onClick={() => setUnitAttributeOpen(true)}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Quản lý Đơn vị & Thuộc tính
              </Button>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600"
              >
                Lưu sản phẩm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UnitAttributeDialog
        open={unitAttributeOpen}
        onOpenChange={setUnitAttributeOpen}
        baseUnit={baseUnit}
        unitConversions={unitConversions}
        setUnitConversions={setUnitConversions}
        attributes={attributes}
        setAttributes={setAttributes}
        variants={variants}
        setVariants={setVariants}
      />
    </>
  );
}

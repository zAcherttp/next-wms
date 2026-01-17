"use client";

import type { Id } from "@wms/backend/convex/_generated/dataModel";
import { Loader2, Plus, Settings2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useBrands } from "@/hooks/use-brands";
import { useCategoryTree } from "@/hooks/use-categories";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  type CreateProductWithVariantsInput,
  useCreateProductWithVariants,
} from "@/hooks/use-products";
import {
  useBarcodeTypes,
  useStorageRequirements,
  useTrackingMethods,
  useUnitsOfMeasure,
} from "@/hooks/use-system-lookups";

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
  barcode: string;
}

// Unit & Attribute Dialog
function UnitAttributeDialog({
  open,
  onOpenChange,
  baseUnit,
  productName,
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
  productName: string;
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

  const _updateAttributeValues = (id: string, valuesStr: string) => {
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

    // Create SKU prefix from product name (remove spaces, accents, uppercase)
    const skuPrefix =
      productName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .substring(0, 10) || "SKU";

    const newVariants: ProductVariant[] = combinations.map((combo, idx) => ({
      id: `var-${idx}`,
      name: productName
        ? `${productName} - ${combo.join(" - ")}`
        : combo.join(" - "),
      sku: `${skuPrefix}-${combo.join("-").toUpperCase().replace(/\s/g, "")}`,
      costPrice: 50000,
      sellingPrice: 100000,
      barcode: "",
    }));
    setVariants(newVariants);
  };

  const updateVariant = (
    id: string,
    field: keyof ProductVariant,
    value: string | number,
  ) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
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
                <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_auto] gap-3 font-medium text-sm">
                  <span>Tên đơn vị</span>
                  <span>Giá trị quy đổi</span>
                  <span>Giá bán</span>
                  <span>Mã vạch</span>
                  <span />
                </div>

                {unitConversions.map((unit) => (
                  <div
                    key={unit.id}
                    className="grid grid-cols-[1fr_1.5fr_1fr_1fr_auto] gap-3"
                  >
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
                    <div className="flex items-center gap-2">
                      <span>=</span>
                      <Input
                        type="number"
                        className="w-20"
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
                      <span className="whitespace-nowrap">
                        {baseUnit || "cái"}
                      </span>
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

              <div className="space-y-4">
                {attributes.map((attr, idx) => (
                  <div
                    key={attr.id}
                    className="space-y-2 rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          Thuộc tính {idx + 1}:
                        </span>
                        <Input
                          placeholder="Màu sắc, Size..."
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
                          className="w-32"
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

                    <div className="space-y-2">
                      <span className="text-muted-foreground text-sm">
                        Các giá trị:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((value) => (
                          <span
                            key={value}
                            className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-800 text-sm"
                          >
                            {value}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                const newValues = attr.values.filter(
                                  (v) => v !== value,
                                );
                                const newAttributes = attributes.map((a) =>
                                  a.id === attr.id
                                    ? { ...a, values: newValues }
                                    : a,
                                );
                                setAttributes(newAttributes);
                                generateVariants(newAttributes);
                              }}
                              className="ml-1 rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </span>
                        ))}
                        <Input
                          placeholder="Nhập giá trị rồi nhấn Enter"
                          className="w-48"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              const input = e.currentTarget;
                              const value = input.value.trim();
                              if (value && !attr.values.includes(value)) {
                                const newAttributes = attributes.map((a) =>
                                  a.id === attr.id
                                    ? { ...a, values: [...a.values, value] }
                                    : a,
                                );
                                setAttributes(newAttributes);
                                input.value = "";
                                // Auto generate variants when adding values
                                generateVariants(newAttributes);
                              }
                            }
                          }}
                        />
                      </div>
                      <p className="text-muted-foreground text-xs">
                        💡 Nhập giá trị và nhấn Enter hoặc dấu phẩy để thêm
                      </p>
                    </div>
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
                  &gt; DANH SÁCH PHIÊN BẢN ({variants.length} phiên bản)
                </h4>
                <div className="max-h-64 overflow-y-auto rounded border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted">
                      <tr>
                        <th className="p-2 text-left">Tên phiên bản</th>
                        <th className="p-2 text-left">Mã SKU</th>
                        <th className="p-2 text-left">Giá vốn</th>
                        <th className="p-2 text-left">Giá bán</th>
                        <th className="p-2 text-left">Barcode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant) => (
                        <tr key={variant.id} className="border-t">
                          <td className="bg-amber-100 p-2 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
                            {variant.name}
                          </td>
                          <td className="p-1">
                            <Input
                              value={variant.sku}
                              onChange={(e) =>
                                updateVariant(variant.id, "sku", e.target.value)
                              }
                              className="h-8"
                            />
                          </td>
                          <td className="p-1">
                            <Input
                              type="number"
                              value={variant.costPrice}
                              onChange={(e) =>
                                updateVariant(
                                  variant.id,
                                  "costPrice",
                                  Number(e.target.value),
                                )
                              }
                              className="h-8"
                            />
                          </td>
                          <td className="p-1">
                            <Input
                              type="number"
                              value={variant.sellingPrice}
                              onChange={(e) =>
                                updateVariant(
                                  variant.id,
                                  "sellingPrice",
                                  Number(e.target.value),
                                )
                              }
                              className="h-8"
                            />
                          </td>
                          <td className="p-1">
                            <Input
                              value={variant.barcode}
                              onChange={(e) =>
                                updateVariant(
                                  variant.id,
                                  "barcode",
                                  e.target.value,
                                )
                              }
                              placeholder="Barcode..."
                              className="h-8"
                            />
                          </td>
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
  const { organizationId } = useCurrentUser();
  const [open, setOpen] = React.useState(false);
  const [unitAttributeOpen, setUnitAttributeOpen] = React.useState(false);

  // Fetch data for dropdowns
  const { categories } = useCategoryTree(organizationId);
  const { brands } = useBrands(organizationId as unknown as string);
  const { lookups: storageRequirements } = useStorageRequirements();
  const { lookups: trackingMethods } = useTrackingMethods();
  const { lookups: unitsOfMeasure } = useUnitsOfMeasure();
  const { lookups: barcodeTypes } = useBarcodeTypes();

  // Create mutation
  const createProductMutation = useCreateProductWithVariants();

  // Form state - Product info
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string>("");
  const [brandId, setBrandId] = React.useState<string>("");
  const [storageRequirementId, setStorageRequirementId] =
    React.useState<string>("");
  const [trackingMethodId, setTrackingMethodId] = React.useState<string>("");
  const [shelfLifeDays, setShelfLifeDays] = React.useState<number | undefined>(
    undefined,
  );
  const [reorderPoint, setReorderPoint] = React.useState<number | undefined>(
    undefined,
  );

  // Default variant (when no attributes)
  const [defaultSku, setDefaultSku] = React.useState("");
  const [defaultBarcode, setDefaultBarcode] = React.useState("");
  const [defaultCostPrice, setDefaultCostPrice] = React.useState(0);
  const [defaultSellingPrice, setDefaultSellingPrice] = React.useState(0);
  const [baseUnitId, setBaseUnitId] = React.useState<string>("");

  // Unit conversions & attributes (managed by sub-dialog)
  const [unitConversions, setUnitConversions] = React.useState<
    UnitConversion[]
  >([]);
  const [attributes, setAttributes] = React.useState<ProductAttribute[]>([]);
  const [variants, setVariants] = React.useState<ProductVariant[]>([]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategoryId("");
    setBrandId("");
    setStorageRequirementId("");
    setTrackingMethodId("");
    setShelfLifeDays(undefined);
    setReorderPoint(undefined);
    setDefaultSku("");
    setDefaultBarcode("");
    setDefaultCostPrice(0);
    setDefaultSellingPrice(0);
    setBaseUnitId("");
    setUnitConversions([]);
    setAttributes([]);
    setVariants([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organizationId) {
      toast.error("Không tìm thấy tổ chức");
      return;
    }

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!categoryId) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    if (!brandId) {
      toast.error("Vui lòng chọn thương hiệu");
      return;
    }

    if (!storageRequirementId) {
      toast.error("Vui lòng chọn yêu cầu lưu trữ");
      return;
    }

    if (!trackingMethodId) {
      toast.error("Vui lòng chọn phương thức theo dõi");
      return;
    }

    if (!baseUnitId) {
      toast.error("Vui lòng chọn đơn vị cơ bản");
      return;
    }

    // Get default barcode type (EAN13)
    const defaultBarcodeType = barcodeTypes.find(
      (b) => b.lookupCode === "EAN13",
    );

    // Build variants to create
    let variantsToCreate: CreateProductWithVariantsInput["variants"] = [];

    if (variants.length > 0) {
      // Use attribute-based variants
      variantsToCreate = variants.map((v) => ({
        skuCode: v.sku,
        description: v.name,
        costPrice: v.costPrice,
        sellingPrice: v.sellingPrice,
        unitOfMeasureId: baseUnitId as Id<"system_lookups">,
        temperatureSensitive: false,
        isActive: true,
        barcodes: v.barcode
          ? [
              {
                barcodeTypeId:
                  (defaultBarcodeType?._id as Id<"system_lookups">) ??
                  (barcodeTypes[0]?._id as Id<"system_lookups">),
                barcodeValue: v.barcode,
              },
            ]
          : undefined,
      }));
    } else {
      // Create single default variant
      if (!defaultSku.trim()) {
        toast.error("Vui lòng nhập mã SKU");
        return;
      }

      variantsToCreate = [
        {
          skuCode: defaultSku,
          description: name,
          costPrice: defaultCostPrice,
          sellingPrice: defaultSellingPrice,
          unitOfMeasureId: baseUnitId as Id<"system_lookups">,
          temperatureSensitive: false,
          isActive: true,
          barcodes: defaultBarcode
            ? [
                {
                  barcodeTypeId:
                    (defaultBarcodeType?._id as Id<"system_lookups">) ??
                    (barcodeTypes[0]?._id as Id<"system_lookups">),
                  barcodeValue: defaultBarcode,
                },
              ]
            : undefined,
        },
      ];
    }

    try {
      await createProductMutation.mutateAsync({
        organizationId: organizationId as Id<"organizations">,
        name,
        description: description || name,
        categoryId: categoryId as Id<"categories">,
        brandId: brandId as Id<"brands">,
        storageRequirementTypeId: storageRequirementId as Id<"system_lookups">,
        trackingMethodTypeId: trackingMethodId as Id<"system_lookups">,
        shelfLifeDays,
        reorderPoint,
        isActive: true,
        variants: variantsToCreate,
      });

      toast.success("Tạo sản phẩm thành công!");
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error(
        `Tạo sản phẩm thất bại: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Get base unit name for display
  const baseUnitName =
    unitsOfMeasure.find((u) => u._id === baseUnitId)?.lookupValue || "Piece";

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus />
            Add New
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Tên sản phẩm <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Nhập tên sản phẩm..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Nhập mô tả sản phẩm..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    Danh mục <span className="text-destructive">*</span>
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>
                    Thương hiệu <span className="text-destructive">*</span>
                  </Label>
                  <Select value={brandId} onValueChange={setBrandId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thương hiệu..." />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Storage Requirement & Tracking Method */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    Yêu cầu lưu trữ <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={storageRequirementId}
                    onValueChange={setStorageRequirementId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn..." />
                    </SelectTrigger>
                    <SelectContent>
                      {storageRequirements.map((item) => (
                        <SelectItem key={item._id} value={item._id}>
                          {item.lookupValue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>
                    Phương thức theo dõi{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={trackingMethodId}
                    onValueChange={setTrackingMethodId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn..." />
                    </SelectTrigger>
                    <SelectContent>
                      {trackingMethods.map((item) => (
                        <SelectItem key={item._id} value={item._id}>
                          {item.lookupValue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Base Unit & Shelf Life */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    Đơn vị cơ bản <span className="text-destructive">*</span>
                  </Label>
                  <Select value={baseUnitId} onValueChange={setBaseUnitId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đơn vị..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unitsOfMeasure.map((item) => (
                        <SelectItem key={item._id} value={item._id}>
                          {item.lookupValue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Hạn sử dụng (ngày)</Label>
                  <Input
                    type="number"
                    placeholder="Số ngày..."
                    value={shelfLifeDays ?? ""}
                    onChange={(e) =>
                      setShelfLifeDays(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    min={0}
                  />
                </div>
              </div>

              {/* Reorder Point */}
              <div className="grid gap-2">
                <Label>Điểm đặt hàng lại</Label>
                <Input
                  type="number"
                  placeholder="Số lượng tối thiểu..."
                  value={reorderPoint ?? ""}
                  onChange={(e) =>
                    setReorderPoint(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  min={0}
                />
              </div>

              {/* Default Variant Section (when no attributes) */}
              {variants.length === 0 && (
                <div className="rounded-md border p-4">
                  <h4 className="mb-3 font-semibold">
                    Thông tin phiên bản mặc định
                  </h4>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>
                          Mã SKU <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="Nhập mã SKU..."
                          value={defaultSku}
                          onChange={(e) => setDefaultSku(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Barcode</Label>
                        <Input
                          placeholder="Nhập mã vạch..."
                          value={defaultBarcode}
                          onChange={(e) => setDefaultBarcode(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Giá vốn</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={defaultCostPrice || ""}
                          onChange={(e) =>
                            setDefaultCostPrice(Number(e.target.value))
                          }
                          min={0}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Giá bán</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={defaultSellingPrice || ""}
                          onChange={(e) =>
                            setDefaultSellingPrice(Number(e.target.value))
                          }
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Variants info (when has attributes) */}
              {variants.length > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                  <h4 className="mb-2 font-semibold text-amber-800">
                    Đã tạo {variants.length} phiên bản từ thuộc tính
                  </h4>
                  <p className="text-amber-700 text-sm">
                    Các phiên bản sẽ được tạo tự động khi lưu sản phẩm.
                  </p>
                </div>
              )}

              {/* Manage Units & Attributes Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full border-amber-400 border-dashed text-amber-600"
                onClick={() => setUnitAttributeOpen(true)}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Quản lý Đơn vị & Thuộc tính ({variants.length} phiên bản)
              </Button>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createProductMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600"
                disabled={createProductMutation.isPending}
              >
                {createProductMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu sản phẩm"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UnitAttributeDialog
        open={unitAttributeOpen}
        onOpenChange={setUnitAttributeOpen}
        baseUnit={baseUnitName}
        productName={name}
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

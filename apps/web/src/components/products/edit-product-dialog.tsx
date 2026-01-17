"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useBrands } from "@/hooks/use-brands";
import { useCategoryTree } from "@/hooks/use-categories";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useProductDetails, useUpdateProduct } from "@/hooks/use-products";
import {
  useStorageRequirements,
  useTrackingMethods,
} from "@/hooks/use-system-lookups";

// Form Schema
const editProductSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Danh mục là bắt buộc"),
  brandId: z.string().min(1, "Thương hiệu là bắt buộc"),
  storageRequirementTypeId: z.string().min(1, "Yêu cầu lưu trữ là bắt buộc"),
  trackingMethodTypeId: z.string().min(1, "Phương thức theo dõi là bắt buộc"),
  shelfLifeDays: z.number().optional(),
  reorderPoint: z.number().optional(),
  isActive: z.boolean(),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: Id<"products"> | null;
}

export function EditProductDialog({
  open,
  onOpenChange,
  productId,
}: EditProductDialogProps) {
  const { organizationId } = useCurrentUser();

  // Fetch product details
  const { product, isLoading: isLoadingProduct } = useProductDetails(
    productId ?? undefined,
  );

  // Fetch dropdown data
  const { categories } = useCategoryTree(organizationId);
  const { brands } = useBrands(organizationId);
  const { lookups: storageRequirements } = useStorageRequirements();
  const { lookups: trackingMethods } = useTrackingMethods();

  // Mutation
  const updateProduct = useUpdateProduct();

  // Form
  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      brandId: "",
      storageRequirementTypeId: "",
      trackingMethodTypeId: "",
      shelfLifeDays: undefined,
      reorderPoint: undefined,
      isActive: true,
    },
  });

  // Reset form when product data loads
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        categoryId: product.categoryId,
        brandId: product.brandId,
        storageRequirementTypeId: product.storageRequirementTypeId,
        trackingMethodTypeId: product.trackingMethodTypeId,
        shelfLifeDays: product.shelfLifeDays,
        reorderPoint: product.reorderPoint,
        isActive: product.isActive,
      });
    }
  }, [product, form]);

  // Submit handler
  const onSubmit = async (data: EditProductFormData) => {
    if (!productId) return;

    try {
      await updateProduct.mutateAsync({
        id: productId,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId as Id<"categories">,
        brandId: data.brandId as Id<"brands">,
        storageRequirementTypeId:
          data.storageRequirementTypeId as Id<"system_lookups">,
        trackingMethodTypeId: data.trackingMethodTypeId as Id<"system_lookups">,
        shelfLifeDays: data.shelfLifeDays,
        reorderPoint: data.reorderPoint,
        isActive: data.isActive,
      });

      toast.success("Cập nhật sản phẩm thành công!");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Lỗi khi cập nhật sản phẩm",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin sản phẩm. Nhấn Lưu để xác nhận thay đổi.
          </DialogDescription>
        </DialogHeader>

        {isLoadingProduct ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Product Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên sản phẩm *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên sản phẩm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập mô tả sản phẩm"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thương hiệu *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn thương hiệu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand._id} value={brand._id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Storage & Tracking */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="storageRequirementTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yêu cầu lưu trữ *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn yêu cầu lưu trữ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {storageRequirements.map((item) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.lookupValue}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trackingMethodTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phương thức theo dõi *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn phương thức" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {trackingMethods.map((item) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.lookupValue}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Shelf Life & Reorder Point */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shelfLifeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hạn sử dụng (ngày)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Số ngày"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reorderPoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điểm đặt hàng lại</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Số lượng tối thiểu"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Is Active */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Trạng thái hoạt động</FormLabel>
                      <p className="text-muted-foreground text-sm">
                        Sản phẩm có thể được sử dụng trong hệ thống
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={updateProduct.isPending}>
                  {updateProduct.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

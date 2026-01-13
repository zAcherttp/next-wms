"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import {
  MOCK_ADJUSTMENT_REASONS,
  MOCK_PRODUCTS,
  MOCK_SECTIONS,
  MOCK_STORAGE_ZONES,
} from "@/mock/data/cycle-count";

interface QuantityAdjustmentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Pre-fill data from line item
  initialData?: {
    productId?: string;
    zoneId?: string;
    currentQty?: number;
    countedQty?: number;
  };
}

export function QuantityAdjustmentDialog({
  open,
  onOpenChange,
  initialData,
}: QuantityAdjustmentDialogProps) {
  // Form state
  const [zoneId, setZoneId] = useState(initialData?.zoneId ?? "");
  const [sectionId, setSectionId] = useState("");
  const [productId, setProductId] = useState(initialData?.productId ?? "");
  const [currentQty, setCurrentQty] = useState(
    initialData?.currentQty?.toString() ?? "",
  );
  const [countedQty, setCountedQty] = useState(
    initialData?.countedQty?.toString() ?? "",
  );
  const [reasonId, setReasonId] = useState("");
  const [comments, setComments] = useState("");

  // File upload
  const [{ files, isDragging }, { removeFile, openFileDialog, getInputProps }] =
    useFileUpload({
      maxFiles: 5,
      maxSize: 5 * 1024 * 1024, // 5MB
      accept: "image/*",
      multiple: true,
    });

  const handleClose = () => {
    // Reset form
    setZoneId(initialData?.zoneId ?? "");
    setSectionId("");
    setProductId(initialData?.productId ?? "");
    setCurrentQty(initialData?.currentQty?.toString() ?? "");
    setCountedQty(initialData?.countedQty?.toString() ?? "");
    setReasonId("");
    setComments("");
    onOpenChange?.(false);
  };

  const handleZoneChange = (value: string) => {
    setZoneId(value);
    setSectionId(""); // Reset section when zone changes
  };

  const handleSubmit = () => {
    // TODO: Implement submit logic
    console.log({
      zoneId,
      sectionId,
      productId,
      currentQty: Number(currentQty),
      countedQty: Number(countedQty),
      reasonId,
      comments,
      files,
    });
    handleClose();
  };

  const sections = zoneId ? (MOCK_SECTIONS[zoneId] ?? []) : [];

  const isFormValid =
    zoneId !== "" &&
    productId !== "" &&
    currentQty !== "" &&
    countedQty !== "" &&
    reasonId !== "";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader className="relative">
          <DialogTitle>Create Adjustment Request</DialogTitle>
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-0 right-0 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {/* Zone and Section Row */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Zone</FieldLabel>
              <Select value={zoneId} onValueChange={handleZoneChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select zone..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_STORAGE_ZONES.map((zone) => (
                    <SelectItem key={zone._id} value={zone._id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Section</FieldLabel>
              <Select
                value={sectionId}
                onValueChange={setSectionId}
                disabled={!zoneId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select section..." />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section._id} value={section._id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Product */}
          <Field>
            <FieldLabel>Product</FieldLabel>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select product..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_PRODUCTS.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.code} - {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Current Qty, Counted Qty, Reason Row */}
          <div className="grid grid-cols-3 gap-4">
            <Field>
              <FieldLabel>Current Qty</FieldLabel>
              <Input
                type="number"
                value={currentQty}
                onChange={(e) => setCurrentQty(e.target.value)}
                placeholder="0"
              />
            </Field>

            <Field>
              <FieldLabel>Counted Qty</FieldLabel>
              <Input
                type="number"
                value={countedQty}
                onChange={(e) => setCountedQty(e.target.value)}
                placeholder="0"
              />
            </Field>

            <Field>
              <FieldLabel>Reason</FieldLabel>
              <Select value={reasonId} onValueChange={setReasonId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_ADJUSTMENT_REASONS.map((reason) => (
                    <SelectItem key={reason._id} value={reason._id}>
                      {reason.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Comments */}
          <Field>
            <FieldLabel>Comments</FieldLabel>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any additional notes..."
              className="min-h-16 resize-none"
            />
          </Field>

          {/* Images (Optional) */}
          <Field>
            <FieldLabel>Images (Optional)</FieldLabel>
            <div
              onClick={openFileDialog}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  openFileDialog();
                }
              }}
              className={cn(
                "flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-4 transition-colors hover:bg-accent/50",
                isDragging && "border-primary bg-primary/5",
              )}
            >
              <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">
                Click to upload
              </span>
              <input {...getInputProps()} className="sr-only" />
            </div>

            {/* Image Previews */}
            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {files.map((fileWithPreview) => (
                  <div
                    key={fileWithPreview.id}
                    className="group relative h-16 w-16 overflow-hidden rounded-md border"
                  >
                    <Image
                      src={fileWithPreview.preview ?? ""}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(fileWithPreview.id);
                      }}
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Field>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex-1"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

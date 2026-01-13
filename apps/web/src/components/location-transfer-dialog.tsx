"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Check, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  MOCK_STORAGE_ZONES,
  MOCK_SECTIONS,
  MOCK_TRANSFER_ITEMS,
} from "@/mock/data/cycle-count";

interface TransferItem {
  id: string;
  productId: string;
  productName: string;
  box: string;
  quantity: number;
  expiryDate: string;
}

interface LocationTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    zoneId?: string;
    sectionId?: string;
  };
}

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export function LocationTransferDialog({
  open,
  onOpenChange,
  initialData,
}: LocationTransferDialogProps) {
  const [step, setStep] = useState(1);

  // Step 1: Source Location
  const [fromZone, setFromZone] = useState<string>("");
  const [fromSection, setFromSection] = useState<string>("");

  // Step 2: Destination Location
  const [toZone, setToZone] = useState<string>("");
  const [toSection, setToSection] = useState<string>("");

  // Step 3: Item Selection
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Get sections based on selected zone
  const fromSections = fromZone ? MOCK_SECTIONS[fromZone] || [] : [];
  const toSections = toZone ? MOCK_SECTIONS[toZone] || [] : [];

  // Get available items for transfer (mock data)
  const availableItems: TransferItem[] = MOCK_TRANSFER_ITEMS;

  // Initialize with provided data
  useEffect(() => {
    if (open && initialData) {
      if (initialData.zoneId) {
        setFromZone(initialData.zoneId);
      }
      if (initialData.sectionId) {
        setFromSection(initialData.sectionId);
      }
    }
  }, [open, initialData]);

  // Reset section when zone changes
  useEffect(() => {
    if (!fromSections.find((s) => s._id === fromSection)) {
      setFromSection("");
    }
  }, [fromZone, fromSections, fromSection]);

  useEffect(() => {
    if (!toSections.find((s) => s._id === toSection)) {
      setToSection("");
    }
  }, [toZone, toSections, toSection]);

  const handleClose = () => {
    setStep(1);
    setFromZone("");
    setFromSection("");
    setToZone("");
    setToSection("");
    setSelectedItems([]);
    onOpenChange(false);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = () => {
    console.log("Submitting transfer:", {
      from: { zone: fromZone, section: fromSection },
      to: { zone: toZone, section: toSection },
      items: selectedItems,
    });
    handleClose();
  };

  const canProceedStep1 = fromZone && fromSection;
  const canProceedStep2 = toZone && toSection;
  const canSubmit = selectedItems.length > 0;

  const getZoneName = (zoneId: string) => {
    return MOCK_STORAGE_ZONES.find((z) => z._id === zoneId)?.name || zoneId;
  };

  const getSectionName = (zoneId: string, sectionId: string) => {
    const sections = MOCK_SECTIONS[zoneId] || [];
    return sections.find((s) => s._id === sectionId)?.name || sectionId;
  };

  const getTotalQuantity = () => {
    return availableItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Transfer Items to New Location</DialogTitle>
        </DialogHeader>

        <Separator />

        <AnimatePresence mode="wait">
          {/* Step 1: Select Source Location */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={springTransition}
              className="space-y-6 py-4"
            >
              <h3 className="text-sm font-medium">Step 1: Select Source Location</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    From Zone
                  </label>
                  <Select value={fromZone} onValueChange={setFromZone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_STORAGE_ZONES.map((zone) => (
                        <SelectItem key={zone._id} value={zone._id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    From Section
                  </label>
                  <Select
                    value={fromSection}
                    onValueChange={setFromSection}
                    disabled={!fromZone}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {fromSections.map((section) => (
                        <SelectItem key={section._id} value={section._id}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Destination Location */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={springTransition}
              className="space-y-6 py-4"
            >
              <h3 className="text-sm font-medium">Step 2: Select Destination Location</h3>

              {/* From Location Display */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase text-muted-foreground">
                  FROM
                </label>
                <div className="rounded-md bg-muted px-3 py-2 text-sm">
                  {getZoneName(fromZone)} - {getSectionName(fromZone, fromSection)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    To Zone
                  </label>
                  <Select value={toZone} onValueChange={setToZone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_STORAGE_ZONES.map((zone) => (
                        <SelectItem key={zone._id} value={zone._id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    To Section
                  </label>
                  <Select
                    value={toSection}
                    onValueChange={setToSection}
                    disabled={!toZone}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {toSections.map((section) => (
                        <SelectItem key={section._id} value={section._id}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Select Items to Transfer */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={springTransition}
              className="space-y-4 py-4"
            >
              <h3 className="text-sm font-medium">Step 3: Select Items to Transfer</h3>

              {/* From/To Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border bg-muted/50 p-3">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    FROM
                  </span>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {getZoneName(fromZone)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getSectionName(fromZone, fromSection)}
                  </p>
                </div>
                <div className="rounded-md border bg-primary/5 p-3">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    TO
                  </span>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {getZoneName(toZone)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getSectionName(toZone, toSection)}
                  </p>
                </div>
              </div>

              {/* Available Items */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Available Items in {getSectionName(fromZone, fromSection)}
                </label>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {availableItems.map((item) => {
                    const isSelected = selectedItems.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "cursor-pointer rounded-lg border p-3 transition-colors",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "hover:border-muted-foreground/30"
                        )}
                        onClick={() => handleItemToggle(item.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleItemToggle(item.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {item.productName}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.productId}
                            </p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>
                                <span className="font-medium text-foreground">Box</span>{" "}
                                {item.box}
                              </span>
                              <span>
                                <span className="font-medium text-foreground">Quantity</span>{" "}
                                {item.quantity} units
                              </span>
                              <span>
                                <span className="font-medium text-foreground">Expiry Date</span>{" "}
                                {item.expiryDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selection Summary */}
              <div className="rounded-md bg-muted px-3 py-2">
                <p className="text-sm font-medium text-primary">
                  {selectedItems.length} item(s) selected
                </p>
                <p className="text-xs text-muted-foreground">
                  Total quantity: {getTotalQuantity()} units
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          {step === 1 ? (
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
          ) : (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              className="flex-1"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Submit Transfer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

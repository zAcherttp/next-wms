"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VerifyingSessionItem } from "@/mock/data/receiving-session-verifying";

interface FoundSkuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: VerifyingSessionItem;
  onClose: () => void;
  onConfirm: (amount: number, note: string) => void;
  onReturn: () => void;
}

export function FoundSkuDialog({
  open,
  onOpenChange,
  item,
  onClose,
  onConfirm,
  onReturn,
}: FoundSkuDialogProps) {
  const [amount, setAmount] = React.useState(item.expectedQty);
  const [note, setNote] = React.useState("");

  const handleConfirm = () => {
    onConfirm(amount, note);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Found SKU: {item.skuCode}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">{item.productName}</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={0}
              max={item.expectedQty}
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              placeholder="Enter note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="flex min-h-[80px] items-center justify-center rounded-md border p-4 text-muted-foreground">
              Add attachment
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-between">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogClose>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onReturn}>
              Return
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

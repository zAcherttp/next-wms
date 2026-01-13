"use client";

import { ArrowRight, Check, ScanLine } from "lucide-react";
import * as React from "react";
import { FoundSkuDialog } from "@/components/found-sku-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getTotalExpected,
  getTotalRecorded,
  MOCK_VERIFYING_SESSION,
  type VerifyingSessionItem,
} from "@/mock/data/receiving-session-verifying";

export default function VerifyingPage() {
  const [skuInput, setSkuInput] = React.useState("");
  const [foundItem, setFoundItem] = React.useState<VerifyingSessionItem | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const session = MOCK_VERIFYING_SESSION;
  const totalExpected = getTotalExpected(session);
  const totalRecorded = getTotalRecorded(session);

  const handleSubmitSku = () => {
    if (!skuInput.trim()) return;

    // Find matching item
    const matchedItem = session.items.find(
      (item) => item.skuCode.toLowerCase() === skuInput.toLowerCase(),
    );

    if (matchedItem) {
      setFoundItem(matchedItem);
      setIsDialogOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmitSku();
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setFoundItem(null);
    setSkuInput("");
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
      {/* Total Progress Card */}
      <Card>
        <CardContent className="py-4">
          <p className="font-medium text-lg">
            Total Progress: {totalRecorded} / {totalExpected}
          </p>
        </CardContent>
      </Card>

      {/* Session Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="space-y-1 py-4">
          <p className="text-sm">
            Session ID:{" "}
            <span className="font-semibold">{session.sessionId}</span>
          </p>
          <p className="text-sm">
            Linked PO: <span className="font-semibold">{session.linkedPO}</span>
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm">Status:</span>
            <Badge
              variant="outline"
              className="border-primary/60 bg-primary/10 font-medium text-primary"
            >
              {session.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Scan Item or SKU Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ScanLine className="h-5 w-5" />
          <span className="font-medium">Scan Item or SKU</span>
        </div>

        {/* Scanner Placeholder */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <div className="text-center">
              <p>No camera detected</p>
            </div>
          </CardContent>
        </Card>

        {/* SKU Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter SKU code..."
            value={skuInput}
            onChange={(e) => setSkuInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSubmitSku}
            disabled={!skuInput.trim()}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Expected Items Card */}
      <Card>
        <CardContent className="py-4">
          <h3 className="mb-4 font-semibold">Expected Items</h3>
          <div className="space-y-4">
            {session.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.skuCode}</p>
                  <p className="text-muted-foreground text-sm">
                    Exp: {item.expectedQty}
                  </p>
                </div>
                <div className="rounded-md border px-3 py-1 text-muted-foreground text-sm">
                  Record: {item.recordedQty}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Complete Receiving Session Button */}
      <Button className="w-full" size="lg">
        <Check className="mr-2 h-5 w-5" />
        Complete Receiving Session
      </Button>

      {/* Found SKU Dialog */}
      {foundItem && (
        <FoundSkuDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          item={foundItem}
          onClose={handleDialogClose}
          onConfirm={handleDialogClose}
          onReturn={handleDialogClose}
        />
      )}
    </div>
  );
}

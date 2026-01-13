"use client";

import { ArrowLeft, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { springTransition } from "@/components/easing";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { cn } from "@/lib/utils";
import { MOCK_STORAGE_ZONES, MOCK_WORKERS } from "@/mock/data/cycle-count";

interface CreateCycleCountSessionDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type DialogView = "type-selection" | "form";
type CycleCountType = "daily" | "weekly";

interface ZoneAssignment {
  id: string;
  zoneId: string;
  workerId: string;
}

export function CreateCycleCountSessionDialog({
  open,
  onOpenChange,
}: CreateCycleCountSessionDialogProps) {
  const [view, setView] = useState<DialogView>("type-selection");
  const [cycleCountType, setCycleCountType] = useState<CycleCountType | null>(
    null,
  );

  // Form states
  const [sessionName, setSessionName] = useState("");
  const [description, setDescription] = useState("");
  const [zoneAssignments, setZoneAssignments] = useState<ZoneAssignment[]>([
    { id: "1", zoneId: "", workerId: "" },
  ]);

  const handleClose = () => {
    // Reset state when dialog closes
    setView("type-selection");
    setCycleCountType(null);
    setSessionName("");
    setDescription("");
    setZoneAssignments([{ id: "1", zoneId: "", workerId: "" }]);
    onOpenChange?.(false);
  };

  const handleSelectType = (type: CycleCountType) => {
    setCycleCountType(type);

    // For daily, auto-select 2 zones; for weekly, show 5 zones
    if (type === "daily") {
      setZoneAssignments([
        { id: "1", zoneId: MOCK_STORAGE_ZONES[4]._id, workerId: "" },
        { id: "2", zoneId: MOCK_STORAGE_ZONES[1]._id, workerId: "" },
      ]);
    } else {
      setZoneAssignments([
        { id: "1", zoneId: MOCK_STORAGE_ZONES[0]._id, workerId: "" },
        { id: "2", zoneId: MOCK_STORAGE_ZONES[1]._id, workerId: "" },
        { id: "3", zoneId: MOCK_STORAGE_ZONES[2]._id, workerId: "" },
        { id: "4", zoneId: MOCK_STORAGE_ZONES[3]._id, workerId: "" },
        { id: "5", zoneId: MOCK_STORAGE_ZONES[4]._id, workerId: "" },
      ]);
    }

    setView("form");
  };

  const handleChangeType = () => {
    setView("type-selection");
  };

  const handleAddZone = () => {
    const newId = String(Date.now());
    setZoneAssignments([
      ...zoneAssignments,
      { id: newId, zoneId: "", workerId: "" },
    ]);
  };

  const handleRemoveZone = (id: string) => {
    if (zoneAssignments.length > 1) {
      setZoneAssignments(zoneAssignments.filter((z) => z.id !== id));
    }
  };

  const handleZoneChange = (id: string, zoneId: string) => {
    setZoneAssignments(
      zoneAssignments.map((z) => (z.id === id ? { ...z, zoneId } : z)),
    );
  };

  const handleWorkerChange = (id: string, workerId: string) => {
    setZoneAssignments(
      zoneAssignments.map((z) => (z.id === id ? { ...z, workerId } : z)),
    );
  };

  const handleCreateSession = () => {
    // TODO: Implement create session logic with Convex
    console.log({
      cycleCountType,
      sessionName,
      description,
      zoneAssignments,
    });
    handleClose();
  };

  const isFormValid =
    sessionName.trim() !== "" && zoneAssignments.every((z) => z.zoneId !== "");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Session
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden sm:max-w-lg"
      >
        <AnimatePresence mode={"popLayout"} initial={false}>
          {view === "type-selection" ? (
            <motion.div
              key="type-selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={springTransition}
            >
              <DialogHeader className="relative">
                <DialogTitle>Create Cycle Count Session</DialogTitle>
                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute top-0 right-0 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                <p className="font-medium text-sm">Select Cycle Count Type</p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleSelectType("daily")}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors hover:bg-accent",
                    )}
                  >
                    <span className="font-semibold">Daily</span>
                    <span className="text-muted-foreground text-xs">
                      Auto-select 2 longest unchecked zones
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectType("weekly")}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors hover:bg-accent",
                    )}
                  >
                    <span className="font-semibold">Weekly</span>
                    <span className="text-muted-foreground text-xs">
                      Customize all zones and counts
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={springTransition}
            >
              <DialogHeader className="relative">
                <DialogTitle>Create Cycle Count Session</DialogTitle>
                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute top-0 right-0 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              </DialogHeader>

              <div className="mt-4 space-y-5">
                {/* Change Type Link */}
                <button
                  type="button"
                  onClick={handleChangeType}
                  className="flex items-center gap-1 text-primary text-sm hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Change Type
                </button>

                {/* Session Name */}
                <Field>
                  <FieldLabel>Session Name</FieldLabel>
                  <Input
                    placeholder={
                      cycleCountType === "daily"
                        ? "e.g., Daily Cycle Count"
                        : "e.g., Weekly Cycle Count"
                    }
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                  />
                </Field>

                {/* Description */}
                <Field>
                  <FieldLabel>Description (Optional)</FieldLabel>
                  <Textarea
                    placeholder="Add any notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-20 resize-none"
                  />
                </Field>

                {/* Storage Zones */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FieldLabel>Storage Zones</FieldLabel>
                    <button
                      type="button"
                      onClick={handleAddZone}
                      className="flex items-center gap-1 text-primary text-sm hover:underline"
                    >
                      <Plus className="h-3 w-3" />
                      Add Zone
                    </button>
                  </div>

                  <div className="max-h-[200px] space-y-2 overflow-y-auto pr-1">
                    {zoneAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center gap-2"
                      >
                        {/* Zone Select */}
                        <Select
                          value={assignment.zoneId}
                          onValueChange={(value) =>
                            handleZoneChange(assignment.id, value)
                          }
                        >
                          <SelectTrigger className="h-9 flex-1">
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

                        {/* Worker Select */}
                        <Select
                          value={assignment.workerId}
                          onValueChange={(value) =>
                            handleWorkerChange(assignment.id, value)
                          }
                        >
                          <SelectTrigger className="h-9 flex-1">
                            <SelectValue placeholder="Assign worker..." />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_WORKERS.map((worker) => (
                              <SelectItem key={worker._id} value={worker._id}>
                                {worker.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Remove Button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveZone(assignment.id)}
                          disabled={zoneAssignments.length <= 1}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSession} disabled={!isFormValid}>
                  Create Session
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { AlertTriangle, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { organization } from "@/lib/auth-client";
import type { Role } from "./roles-table";

interface DeleteRoleDialogProps {
  /** The role to delete */
  role: Role | null;
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Called when the role is successfully deleted */
  onDeleted?: () => void;
}

/**
 * Confirmation dialog for deleting a role.
 */
export function DeleteRoleDialog({
  role,
  open,
  onOpenChange,
  onDeleted,
}: DeleteRoleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!role) return;

    setError(null);
    setIsDeleting(true);

    try {
      const result = await (
        organization.deleteRole as (params: {
          roleName: string;
        }) => Promise<{ data?: unknown; error?: { message?: string } }>
      )({
        roleName: role.role,
      });

      if (result.error) {
        setError(result.error.message ?? "Failed to delete role");
        return;
      }

      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setError(null);
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Delete Role
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the role{" "}
            <strong className="text-foreground">{role.name}</strong>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-5 text-amber-600 dark:text-amber-400" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Warning
              </p>
              <p className="mt-1 text-amber-700 dark:text-amber-300">
                Members with this role will lose their associated permissions.
                You may need to reassign them to a different role.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Delete Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

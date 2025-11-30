"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import type { MemberData } from "./member-actions";

interface KickMemberDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** The member being removed */
  member: MemberData;
  /** Called when member is successfully removed */
  onSuccess?: () => void;
}

/**
 * Confirmation dialog for removing a member from the organization.
 */
export function KickMemberDialog({
  open,
  onOpenChange,
  member,
  onSuccess,
}: KickMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await organization.removeMember({
        memberIdOrEmail: member.id,
      });
      toast.success(
        `${member.user.name ?? member.user.email} has been removed`,
      );
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove member";
      toast.error(message);
      console.error("Kick member error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Remove Member
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <strong>{member.user.name ?? member.user.email}</strong> from this
            workspace? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-muted-foreground text-sm">
            This will immediately revoke their access to the workspace. They
            will need to be invited again to regain access.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Remove Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

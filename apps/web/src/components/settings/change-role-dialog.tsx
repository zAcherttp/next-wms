"use client";

import { Loader2, Shield } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { organization } from "@/lib/auth-client";
import type { MemberData } from "./member-actions";

interface ChangeRoleDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** The member whose role is being changed */
  member: MemberData;
  /** Called when role is successfully changed */
  onSuccess?: () => void;
}

const AVAILABLE_ROLES = [
  {
    value: "admin",
    label: "Admin",
    description: "Can manage members and settings",
  },
  {
    value: "member",
    label: "Member",
    description: "Standard workspace access",
  },
];

/**
 * Dialog for changing a member's role in the organization.
 */
export function ChangeRoleDialog({
  open,
  onOpenChange,
  member,
  onSuccess,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState(member.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanged = selectedRole !== member.role;

  const handleSubmit = async () => {
    if (!hasChanged) return;

    try {
      setIsSubmitting(true);
      await organization.updateMemberRole({
        memberId: member.id,
        role: selectedRole,
      });
      toast.success(`Role updated to ${selectedRole}`);
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update role";
      toast.error(message);
      console.error("Change role error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Change Role
          </DialogTitle>
          <DialogDescription>
            Change the role for{" "}
            <strong>{member.user.name ?? member.user.email}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-muted-foreground text-xs">
                        {role.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!hasChanged || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { organization } from "@/lib/auth-client";
import {
  DEFAULT_PERMISSION_CATEGORIES,
  type PermissionState,
  PermissionToggleGroup,
} from "./permission-toggle-group";
import type { Role } from "./roles-table";

interface EditRoleDialogProps {
  /** The role to edit */
  role: Role | null;
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Called when the role is successfully updated */
  onUpdated?: () => void;
}

/**
 * Dialog for editing an existing role's name and permissions.
 */
export function EditRoleDialog({
  role,
  open,
  onOpenChange,
  onUpdated,
}: EditRoleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<PermissionState>({});

  // Reset permissions when role changes
  useEffect(() => {
    if (role) {
      setPermissions(role.permissions);
    }
  }, [role]);

  const form = useForm({
    defaultValues: {
      name: role?.name ?? "",
    },
    onSubmit: async () => {
      if (!role) return;

      setError(null);
      setIsSubmitting(true);

      try {
        const result = await (
          organization.updateRole as (params: {
            roleName: string;
            data: { permission?: Record<string, string[]> };
          }) => Promise<{ data?: unknown; error?: { message?: string } }>
        )({
          roleName: role.role,
          data: {
            permission: permissions,
          },
        });

        if (result.error) {
          setError(result.error.message ?? "Failed to update role");
          return;
        }

        onOpenChange(false);
        onUpdated?.();
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Update form when role changes
  useEffect(() => {
    if (role) {
      form.setFieldValue("name", role.name ?? "");
    }
  }, [role, form]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setError(null);
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Edit Role: {role.name}
          </DialogTitle>
          <DialogDescription>
            Update the permissions for this role.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Role Name (read-only for now) */}
          <div className="space-y-2">
            <Label htmlFor="edit-role-name">Role Name</Label>
            <Input
              id="edit-role-name"
              value={role.name}
              disabled
              className="opacity-60"
            />
            <p className="text-muted-foreground text-xs">
              Role names cannot be changed after creation.
            </p>
          </div>

          {/* Permission Groups */}
          <div className="space-y-2">
            <Label>Permissions</Label>
            <PermissionToggleGroup
              categories={DEFAULT_PERMISSION_CATEGORIES}
              value={permissions}
              onChange={setPermissions}
              disabled={isSubmitting}
            />
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

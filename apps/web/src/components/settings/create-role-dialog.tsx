"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2, Plus, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { organization } from "@/lib/auth-client";
import {
  DEFAULT_PERMISSION_CATEGORIES,
  type PermissionState,
  PermissionToggleGroup,
} from "./permission-toggle-group";
import { RoleBaseSelector } from "./role-base-selector";

interface CreateRoleDialogProps {
  /** Called when a role is successfully created */
  onCreated?: () => void;
  /** Children to use as trigger */
  children?: React.ReactNode;
}

/**
 * Dialog for creating a new role with Discord-style permission selection.
 * Allows copying permissions from an existing role as a base.
 */
export function CreateRoleDialog({
  onCreated,
  children,
}: CreateRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<PermissionState>({});

  const form = useForm({
    defaultValues: {
      name: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setIsSubmitting(true);

      try {
        const result = await organization.createRole({
          role: value.name.toLowerCase().replace(/\s+/g, "-"),
          permission: permissions,
        });

        if (result.error) {
          setError(result.error.message ?? "Failed to create role");
          return;
        }

        setOpen(false);
        form.reset();
        setPermissions({});
        onCreated?.();
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      setPermissions({});
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button>
            <Plus className="mr-2 size-4" />
            Create Role
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Create New Role
          </DialogTitle>
          <DialogDescription>
            Create a custom role with specific permissions for your
            organization.
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
          {/* Role Name */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                if (!value.trim()) {
                  return "Role name is required";
                }
                if (value.length < 2) {
                  return "Role name must be at least 2 characters";
                }
                if (value.length > 32) {
                  return "Role name must be less than 32 characters";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  placeholder="e.g., Warehouse Manager"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={isSubmitting}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Base Role Selector */}
          <RoleBaseSelector onSelect={setPermissions} />

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
              Create Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * Permission definition with display name and underlying permission keys.
 */
export interface PermissionDefinition {
  /** Display label for the permission */
  label: string;
  /** Description of what the permission allows */
  description?: string;
  /** Maps to these permission keys (resource: actions[]) */
  permissions: Record<string, string[]>;
  /** Whether this is a grouped permission (multiple actions) */
  isGrouped?: boolean;
}

/**
 * Category of permissions.
 */
export interface PermissionCategory {
  /** Category name */
  name: string;
  /** Category icon component */
  icon?: React.ReactNode;
  /** Permissions in this category */
  permissions: PermissionDefinition[];
}

/**
 * Permission state as a flat Record.
 */
export type PermissionState = Record<string, string[]>;

interface PermissionToggleGroupProps {
  /** Categories of permissions to display */
  categories: PermissionCategory[];
  /** Current permission state */
  value: PermissionState;
  /** Called when permissions change */
  onChange: (value: PermissionState) => void;
  /** Whether the toggles are disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Discord-style permission toggle group component.
 * Displays permissions organized by category with toggle switches.
 */
export function PermissionToggleGroup({
  categories,
  value,
  onChange,
  disabled = false,
  className,
}: PermissionToggleGroupProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.name)),
  );

  const toggleCategory = (name: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const isPermissionEnabled = (permission: PermissionDefinition): boolean => {
    return Object.entries(permission.permissions).every(([resource, actions]) =>
      actions.every((action) => value[resource]?.includes(action)),
    );
  };

  const togglePermission = (
    permission: PermissionDefinition,
    enabled: boolean,
  ) => {
    const newValue = { ...value };

    for (const [resource, actions] of Object.entries(permission.permissions)) {
      if (!newValue[resource]) {
        newValue[resource] = [];
      }

      if (enabled) {
        // Add actions
        const currentActions = new Set(newValue[resource]);
        for (const action of actions) {
          currentActions.add(action);
        }
        newValue[resource] = Array.from(currentActions);
      } else {
        // Remove actions
        newValue[resource] = newValue[resource].filter(
          (a) => !actions.includes(a),
        );
        // Clean up empty arrays
        if (newValue[resource].length === 0) {
          delete newValue[resource];
        }
      }
    }

    onChange(newValue);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {categories.map((category) => (
        <Collapsible
          key={category.name}
          open={openCategories.has(category.name)}
          onOpenChange={() => toggleCategory(category.name)}
        >
          <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 font-medium text-sm hover:bg-muted">
            {openCategories.has(category.name) ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
            {category.icon}
            {category.name}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pt-1">
            {category.permissions.map((permission, idx) => {
              const isEnabled = isPermissionEnabled(permission);
              const permissionId = `${category.name}-${idx}`;

              return (
                <div
                  key={permissionId}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/30"
                >
                  <div className="flex-1 space-y-0.5">
                    <Label
                      htmlFor={permissionId}
                      className="cursor-pointer font-medium text-sm"
                    >
                      {permission.label}
                      {permission.isGrouped && (
                        <span className="ml-1 text-muted-foreground text-xs">
                          (grouped)
                        </span>
                      )}
                    </Label>
                    {permission.description && (
                      <p className="text-muted-foreground text-xs">
                        {permission.description}
                      </p>
                    )}
                  </div>
                  <Switch
                    id={permissionId}
                    checked={isEnabled}
                    onCheckedChange={(checked) =>
                      togglePermission(permission, checked)
                    }
                    disabled={disabled}
                  />
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

/**
 * Default permission categories based on the permission statement.
 */
export const DEFAULT_PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    name: "Organization",
    permissions: [
      {
        label: "Update workspace settings",
        description: "Modify workspace name, logo, and configuration",
        permissions: { organization: ["update"] },
      },
      {
        label: "Delete workspace",
        description: "Permanently delete the workspace",
        permissions: { organization: ["delete"] },
      },
    ],
  },
  {
    name: "Members",
    permissions: [
      {
        label: "Manage members",
        description: "View, add, edit, and remove members",
        permissions: { member: ["create", "read", "update", "delete"] },
        isGrouped: true,
      },
      {
        label: "Invite new members",
        description: "Send invitations to new users",
        permissions: { member: ["invite"] },
      },
      {
        label: "Kick members",
        description: "Remove members from the workspace",
        permissions: { member: ["kick"] },
      },
    ],
  },
  {
    name: "Roles",
    permissions: [
      {
        label: "Manage roles",
        description: "Create, edit, and delete custom roles",
        permissions: { role: ["create", "update", "delete"] },
        isGrouped: true,
      },
      {
        label: "View roles",
        description: "View role configurations",
        permissions: { role: ["read"] },
      },
    ],
  },
  {
    name: "Invitations",
    permissions: [
      {
        label: "Manage invitations",
        description: "View and cancel pending invitations",
        permissions: { invitation: ["create", "read", "cancel"] },
        isGrouped: true,
      },
    ],
  },
  {
    name: "Settings Access",
    permissions: [
      {
        label: "Profile settings",
        description: "Access profile settings page",
        permissions: { settings: ["profile"] },
      },
      {
        label: "Security settings",
        description: "Access security settings page",
        permissions: { settings: ["security"] },
      },
      {
        label: "Admin settings",
        description: "Access admin settings page",
        permissions: { settings: ["admin"] },
      },
      {
        label: "Member management",
        description: "Access member management page",
        permissions: { settings: ["members"] },
      },
      {
        label: "Role management",
        description: "Access role management page",
        permissions: { settings: ["roles"] },
      },
    ],
  },
  {
    name: "Inventory (WMS)",
    permissions: [
      {
        label: "Manage inventory",
        description: "Full inventory access",
        permissions: { inventory: ["create", "read", "update", "delete"] },
        isGrouped: true,
      },
      {
        label: "View inventory",
        description: "Read-only inventory access",
        permissions: { inventory: ["read"] },
      },
    ],
  },
  {
    name: "Warehouse",
    permissions: [
      {
        label: "Manage warehouse",
        description: "Full warehouse access",
        permissions: { warehouse: ["create", "read", "update", "delete"] },
        isGrouped: true,
      },
      {
        label: "View warehouse",
        description: "Read-only warehouse access",
        permissions: { warehouse: ["read"] },
      },
    ],
  },
  {
    name: "Reports",
    permissions: [
      {
        label: "View reports",
        description: "Access and view reports",
        permissions: { reports: ["view"] },
      },
      {
        label: "Export reports",
        description: "Export report data",
        permissions: { reports: ["export"] },
      },
    ],
  },
];

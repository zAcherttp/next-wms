"use client";

import { Copy, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { organization } from "@/lib/auth-client";
import type { PermissionState } from "./permission-toggle-group";

interface RoleData {
  id: string;
  role: string;
  permissions: PermissionState;
}

interface RoleBaseSelectorProps {
  /** Called when a base role is selected */
  onSelect: (permissions: PermissionState) => void;
  /** Additional class name */
  className?: string;
}

// Default base roles with their permissions
const DEFAULT_ROLES: RoleData[] = [
  {
    id: "none",
    role: "None (Start empty)",
    permissions: {},
  },
  {
    id: "admin",
    role: "Admin",
    permissions: {
      organization: ["update"],
      member: ["create", "read", "update", "delete", "invite", "kick"],
      role: ["create", "read", "update", "delete"],
      invitation: ["create", "read", "cancel"],
      settings: ["profile", "security", "admin", "members", "roles"],
      inventory: ["create", "read", "update", "delete"],
      warehouse: ["create", "read", "update", "delete"],
      reports: ["view", "export"],
    },
  },
  {
    id: "member",
    role: "Member",
    permissions: {
      member: ["read"],
      role: ["read"],
      settings: ["profile", "security"],
      inventory: ["read"],
      warehouse: ["read"],
      reports: ["view"],
    },
  },
];

/**
 * Dropdown for selecting a base role to copy permissions from.
 * Used when creating a new role to start with existing permissions.
 */
export function RoleBaseSelector({
  onSelect,
  className,
}: RoleBaseSelectorProps) {
  const [roles, setRoles] = useState<RoleData[]>(DEFAULT_ROLES);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState<string>("none");

  // Fetch custom roles from the organization
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const result = await organization.listRoles();
        if (result.data) {
          // Add custom roles to the list
          const customRoles: RoleData[] = result.data.map((r) => ({
            id: r.id,
            role: r.role,
            permissions: r.permission as PermissionState,
          }));
          setRoles([...DEFAULT_ROLES, ...customRoles]);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    const role = roles.find((r) => r.id === value);
    if (role) {
      onSelect(role.permissions);
    }
  };

  return (
    <div className={className}>
      <Label className="mb-2 flex items-center gap-2 text-sm">
        <Copy className="size-4" />
        Copy permissions from
      </Label>
      <Select value={selectedValue} onValueChange={handleSelect}>
        <SelectTrigger className="w-full">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span>Loading roles...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select a role to copy from" />
          )}
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              <div className="flex flex-col">
                <span className="font-medium">{role.role}</span>
                {role.id !== "none" && (
                  <span className="text-muted-foreground text-xs">
                    {Object.keys(role.permissions).length} permission categories
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

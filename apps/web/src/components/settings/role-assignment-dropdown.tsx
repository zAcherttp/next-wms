"use client";

import { ChevronDown, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { organization } from "@/lib/auth-client";

interface RoleOption {
  id: string;
  role: string;
  name?: string;
}

interface RoleAssignmentDropdownProps {
  /** Current role value */
  currentRole: string;
  /** Member ID to update */
  memberId: string;
  /** List of available roles */
  roles: RoleOption[];
  /** Called when role is successfully changed */
  onChanged?: () => void;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
}

/**
 * Dropdown for assigning a role to a member.
 * Updates the member's role when a new selection is made.
 */
export function RoleAssignmentDropdown({
  currentRole,
  memberId,
  roles,
  onChanged,
  disabled = false,
}: RoleAssignmentDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentRoleOption = roles.find((r) => r.role === currentRole);
  const displayName = currentRoleOption?.name ?? currentRole;

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return;

    setError(null);
    setIsUpdating(true);

    try {
      const result = await organization.updateMemberRole({
        memberId,
        role: newRole,
      });

      if (result.error) {
        setError(result.error.message ?? "Failed to update role");
        return;
      }

      onChanged?.();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || isUpdating}
            className="w-40 justify-between"
          >
            {isUpdating ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Shield className="mr-2 size-4" />
            )}
            <span className="truncate">{displayName}</span>
            <ChevronDown className="ml-2 size-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuRadioGroup
            value={currentRole}
            onValueChange={handleRoleChange}
          >
            {roles.map((role) => (
              <DropdownMenuRadioItem
                key={role.id}
                value={role.role}
                disabled={role.role === "owner"}
              >
                {role.name ?? role.role}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <p className="absolute top-full mt-1 text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

export type { RoleOption };

"use client";

import { MoreHorizontal, Shield, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHasPermission } from "@/hooks/use-has-permission";
import { organization } from "@/lib/auth-client";
import type { PermissionState } from "./permission-toggle-group";

interface Role {
  id: string;
  role: string;
  name?: string;
  permissions: PermissionState;
  isDefault?: boolean;
}

interface RolesTableProps {
  /** Called when the edit action is triggered */
  onEdit?: (role: Role) => void;
  /** Called when the delete action is triggered */
  onDelete?: (role: Role) => void;
  /** Additional class name */
  className?: string;
}

// Default roles that cannot be deleted
const PROTECTED_ROLES = ["owner", "admin", "member"];

/**
 * Displays a table of all roles in the organization.
 * Shows role name, permission count, and member count.
 */
export function RolesTable({ onEdit, onDelete, className }: RolesTableProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { hasPermission: canUpdateRole } = useHasPermission({
    role: ["update"],
  });
  const { hasPermission: canDeleteRole } = useHasPermission({
    role: ["delete"],
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true);
        const result = await organization.listRoles();
        if (result.data) {
          const roleData: Role[] = result.data.map((r) => ({
            id: r.id,
            role: r.role,
            name: r.role,
            permissions: (r.permission ?? {}) as PermissionState,
            isDefault: PROTECTED_ROLES.includes(r.role),
          }));
          setRoles(roleData);
        } else if (result.error) {
          setError(result.error.message ?? "Failed to fetch roles");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const getPermissionCount = (permissions: PermissionState) => {
    return Object.values(permissions).reduce(
      (sum, actions) => sum + actions.length,
      0,
    );
  };

  const getRoleIcon = (role: Role) => {
    if (role.role === "owner") {
      return <ShieldCheck className="size-4 text-primary" />;
    }
    if (role.isDefault) {
      return <Shield className="size-4 text-muted-foreground" />;
    }
    return <Users className="size-4 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <div className={className}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-destructive/10 p-4 text-destructive">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <Shield className="mx-auto mb-2 size-8 opacity-50" />
          <p className="text-sm">No roles found</p>
          <p className="text-xs">Create a role to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getRoleIcon(role)}
                  <span className="font-medium">{role.name}</span>
                  {role.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getPermissionCount(role.permissions)} permissions
                </Badge>
              </TableCell>
              <TableCell>
                {!role.isDefault && (canUpdateRole || canDeleteRole) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canUpdateRole && (
                        <DropdownMenuItem onClick={() => onEdit?.(role)}>
                          Edit role
                        </DropdownMenuItem>
                      )}
                      {canDeleteRole && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDelete?.(role)}
                        >
                          Delete role
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export type { Role };

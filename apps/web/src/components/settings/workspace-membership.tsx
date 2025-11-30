"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveMemberRole, useActiveOrganization } from "@/lib/auth-client";

interface WorkspaceMembershipProps {
  /** Additional class name */
  className?: string;
}

/**
 * Displays the user's membership in the current workspace,
 * including their role and membership status.
 */
export function WorkspaceMembership({ className }: WorkspaceMembershipProps) {
  const { data: org, isPending: orgLoading } = useActiveOrganization();
  const { data: roleData, isPending: roleLoading } = useActiveMemberRole();

  const isLoading = orgLoading || roleLoading;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!org) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <p className="text-muted-foreground text-sm">
            No active workspace selected
          </p>
        </CardContent>
      </Card>
    );
  }

  const roleName = roleData?.role ?? "member";
  const roleColor = getRoleColor(roleName);

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage src={org.logo ?? undefined} alt={org.name} />
            <AvatarFallback className="text-lg">
              {org.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium">{org.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={roleColor as "default" | "secondary" | "outline"}>
                {formatRoleName(roleName)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Get badge color variant based on role name.
 */
function getRoleColor(role: string): string {
  switch (role.toLowerCase()) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
}

/**
 * Format role name for display.
 */
function formatRoleName(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

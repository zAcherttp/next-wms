"use client";

import { Loader2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { organization } from "@/lib/auth-client";
import {
  RoleAssignmentDropdown,
  type RoleOption,
} from "./role-assignment-dropdown";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

interface RoleAssignmentTableProps {
  /** Additional class name */
  className?: string;
}

/**
 * Table for assigning roles to members.
 * Shows all members with inline role selection dropdown.
 */
export function RoleAssignmentTable({ className }: RoleAssignmentTableProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch members and roles in parallel
      const [membersResult, rolesResult] = await Promise.all([
        organization.listMembers(),
        organization.listRoles(),
      ]);

      if (membersResult.error) {
        setError(membersResult.error.message ?? "Failed to fetch members");
        return;
      }

      if (rolesResult.error) {
        setError(rolesResult.error.message ?? "Failed to fetch roles");
        return;
      }

      if (membersResult.data?.members) {
        setMembers(membersResult.data.members as Member[]);
      }

      if (rolesResult.data) {
        setRoles(
          rolesResult.data.map((r) => ({
            id: r.id,
            role: r.role,
            name: r.role,
          })),
        );
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className={className}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[180px]">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-40" />
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
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <Loader2 className="size-4" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <Users className="mx-auto mb-2 size-8 opacity-50" />
          <p className="text-sm">No members found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-[180px]">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    {member.user.image && (
                      <AvatarImage
                        src={member.user.image}
                        alt={member.user.name}
                      />
                    )}
                    <AvatarFallback>
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.user.name}</p>
                    {member.role === "owner" && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Owner
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {member.user.email}
              </TableCell>
              <TableCell>
                <RoleAssignmentDropdown
                  currentRole={member.role}
                  memberId={member.id}
                  roles={roles}
                  onChanged={fetchData}
                  disabled={member.role === "owner"}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

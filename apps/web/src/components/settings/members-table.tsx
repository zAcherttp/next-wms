"use client";

import { useEffect, useState } from "react";
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
import { useHasPermission } from "@/hooks/use-has-permission";
import { organization } from "@/lib/auth-client";
import { selectUser, useGlobalStore } from "@/stores";
import { MemberActions, type MemberData } from "./member-actions";

interface MembersTableProps {
  /** Called when a member is updated or removed */
  onMemberUpdated?: () => void;
}

/**
 * Table component displaying all members of the organization.
 * Includes actions for managing members based on permissions.
 */
export function MembersTable({ onMemberUpdated }: MembersTableProps) {
  // Use Zustand store instead of Better Auth hook
  const user = useGlobalStore(selectUser);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const { hasPermission: canUpdateRole } = useHasPermission({
    member: ["update"],
  });
  const { hasPermission: canKick } = useHasPermission({
    member: ["kick"],
  });

  useEffect(() => {
    const fetchMembers = async () => {
      setIsPending(true);
      try {
        const result = await organization.listMembers();
        if (result.data?.members) {
          const memberData: MemberData[] = result.data.members.map((m) => ({
            id: m.id,
            userId: m.userId,
            role: m.role,
            user: {
              id: m.user.id,
              name: m.user.name,
              email: m.user.email,
              image: m.user.image ?? null,
            },
          }));
          setMembers(memberData);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setIsPending(false);
      }
    };

    fetchMembers();
  }, [refreshKey]);

  const handleMemberUpdated = () => {
    setRefreshKey((k) => k + 1);
    onMemberUpdated?.();
  };

  if (isPending) {
    return <MembersTableSkeleton />;
  }

  if (!members || members.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No members found</p>
      </div>
    );
  }

  // Transform members data to MemberData format
  const memberData: MemberData[] = members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    user: {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image ?? null,
    },
  }));

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberData.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={member.user.image ?? undefined}
                      alt={member.user.name ?? ""}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.user.name ?? member.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {member.user.name ?? "Unnamed"}
                      {member.userId === user?.id && (
                        <span className="ml-2 text-muted-foreground text-xs">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="truncate text-muted-foreground text-sm">
                      {member.user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(member.role)}>
                  {formatRoleName(member.role)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <MemberActions
                  member={member}
                  currentUserId={user?.id}
                  canChangeRole={canUpdateRole}
                  canKick={canKick}
                  onMemberUpdated={handleMemberUpdated}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MembersTableSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRoleName(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function getRoleBadgeVariant(
  role: string,
): "default" | "secondary" | "outline" {
  switch (role.toLowerCase()) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
}

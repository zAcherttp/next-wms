"use client";

import { MoreHorizontal, Shield, UserX } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangeRoleDialog } from "./change-role-dialog";
import { KickMemberDialog } from "./kick-member-dialog";

export interface MemberData {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface MemberActionsProps {
  /** The member to perform actions on */
  member: MemberData;
  /** Current user's role - to prevent self-actions and check permissions */
  currentUserId?: string;
  /** Whether the current user can change roles */
  canChangeRole?: boolean;
  /** Whether the current user can kick members */
  canKick?: boolean;
  /** Called when member is successfully updated */
  onMemberUpdated?: () => void;
}

/**
 * Dropdown menu with actions for managing a member.
 * Includes change role and kick options with permission checks.
 */
export function MemberActions({
  member,
  currentUserId,
  canChangeRole = true,
  canKick = true,
  onMemberUpdated,
}: MemberActionsProps) {
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [kickOpen, setKickOpen] = useState(false);

  const isSelf = member.userId === currentUserId;
  const isOwner = member.role === "owner";

  // Cannot perform actions on self or owner
  const actionsDisabled = isSelf || isOwner;

  const handleRoleChanged = () => {
    setChangeRoleOpen(false);
    onMemberUpdated?.();
  };

  const handleKicked = () => {
    setKickOpen(false);
    onMemberUpdated?.();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canChangeRole && (
            <DropdownMenuItem
              disabled={actionsDisabled}
              onSelect={() => setChangeRoleOpen(true)}
            >
              <Shield className="mr-2 size-4" />
              Change Role
              {isOwner && (
                <span className="ml-2 text-muted-foreground text-xs">
                  (Owner)
                </span>
              )}
            </DropdownMenuItem>
          )}
          {canKick && canChangeRole && <DropdownMenuSeparator />}
          {canKick && (
            <DropdownMenuItem
              disabled={actionsDisabled}
              onSelect={() => setKickOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <UserX className="mr-2 size-4" />
              Remove from Workspace
              {isSelf && (
                <span className="ml-2 text-muted-foreground text-xs">
                  (You)
                </span>
              )}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangeRoleDialog
        open={changeRoleOpen}
        onOpenChange={setChangeRoleOpen}
        member={member}
        onSuccess={handleRoleChanged}
      />

      <KickMemberDialog
        open={kickOpen}
        onOpenChange={setKickOpen}
        member={member}
        onSuccess={handleKicked}
      />
    </>
  );
}

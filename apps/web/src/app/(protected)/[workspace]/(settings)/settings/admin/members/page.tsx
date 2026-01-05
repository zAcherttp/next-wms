"use client";

import { InviteUserDialog } from "@/components/settings/invite-user-dialog";

export default function MembersPage() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-3xl">Members</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          View and manage workspace members
        </p>
      </div>

      <InviteUserDialog />
    </div>
  );
}

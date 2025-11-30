"use client";

import { Users } from "lucide-react";
import { PermissionGate } from "@/components/permission-gate";
import { InviteUserDialog } from "@/components/settings/invite-user-dialog";
import { MembersTable } from "@/components/settings/members-table";

export default function MembersPage() {
  return (
    <div className="space-y-6 px-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-6 text-primary" />
            <h1 className="font-semibold text-3xl">Members</h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            View and manage workspace members
          </p>
        </div>

        <PermissionGate permissions={{ member: ["invite"] }}>
          <InviteUserDialog />
        </PermissionGate>
      </div>

      <MembersTable />
    </div>
  );
}

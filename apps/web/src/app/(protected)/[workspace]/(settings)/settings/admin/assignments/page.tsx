"use client";

import { UserCog } from "lucide-react";
import { PermissionGate } from "@/components/permission-gate";
import { RoleAssignmentTable } from "@/components/settings/role-assignment-table";

export default function RoleAssignmentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 font-bold text-2xl tracking-tight">
          <UserCog className="size-6" />
          Role Assignments
        </h1>
        <p className="text-muted-foreground">
          Assign roles to workspace members. Each member can have one role.
        </p>
      </div>

      {/* Role Assignment Table */}
      <PermissionGate
        permissions={{ member: ["update"] }}
        fallback={
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <UserCog className="mx-auto mb-2 size-8 opacity-50" />
            <p className="text-sm">
              You don&apos;t have permission to manage role assignments.
            </p>
          </div>
        }
      >
        <RoleAssignmentTable />
      </PermissionGate>
    </div>
  );
}

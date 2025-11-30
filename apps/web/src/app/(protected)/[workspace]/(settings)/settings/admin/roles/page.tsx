"use client";

import { Shield } from "lucide-react";
import { useCallback, useState } from "react";
import { PermissionGate } from "@/components/permission-gate";
import { CreateRoleDialog } from "@/components/settings/create-role-dialog";
import { DeleteRoleDialog } from "@/components/settings/delete-role-dialog";
import { EditRoleDialog } from "@/components/settings/edit-role-dialog";
import { type Role, RolesTable } from "@/components/settings/roles-table";

export default function RolesSettingsPage() {
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleEdit = useCallback((role: Role) => {
    setEditRole(role);
  }, []);

  const handleDelete = useCallback((role: Role) => {
    setDeleteRole(role);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <Shield className="size-6" />
            Roles
          </h1>
          <p className="text-muted-foreground">
            Manage roles and permissions for your organization.
          </p>
        </div>

        <PermissionGate permissions={{ role: ["create"] }}>
          <CreateRoleDialog onCreated={handleRefresh} />
        </PermissionGate>
      </div>

      {/* Roles Table */}
      <PermissionGate
        permissions={{ role: ["read"] }}
        fallback={
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <Shield className="mx-auto mb-2 size-8 opacity-50" />
            <p className="text-sm">You don't have permission to view roles.</p>
          </div>
        }
      >
        <RolesTable
          key={refreshKey}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </PermissionGate>

      {/* Edit Role Dialog */}
      <EditRoleDialog
        role={editRole}
        open={!!editRole}
        onOpenChange={(open) => !open && setEditRole(null)}
        onUpdated={handleRefresh}
      />

      {/* Delete Role Dialog */}
      <DeleteRoleDialog
        role={deleteRole}
        open={!!deleteRole}
        onOpenChange={(open) => !open && setDeleteRole(null)}
        onDeleted={handleRefresh}
      />
    </div>
  );
}

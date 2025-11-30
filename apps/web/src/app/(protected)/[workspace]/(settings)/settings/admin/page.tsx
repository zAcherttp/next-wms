"use client";

import { Shield, UserCog, Users } from "lucide-react";
import Link from "next/link";
import { PermissionGate } from "@/components/permission-gate";
import { InviteUserDialog } from "@/components/settings/invite-user-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="space-y-6 px-4">
      <div>
        <h1 className="font-semibold text-3xl">Administration</h1>
        <p className="text-muted-foreground">
          Manage workspace settings, members, and organization
        </p>
      </div>

      {/* Quick Actions */}
      <PermissionGate permissions={{ member: ["invite"] }}>
        <div className="flex gap-2">
          <InviteUserDialog />
        </div>
      </PermissionGate>

      {/* Admin Sections Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Members Section */}
        <PermissionGate permissions={{ settings: ["members"] }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                <CardTitle className="text-lg">Members</CardTitle>
              </div>
              <CardDescription>
                View and manage workspace members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="admin/members">Manage Members</Link>
              </Button>
            </CardContent>
          </Card>
        </PermissionGate>

        {/* Roles Section */}
        <PermissionGate permissions={{ settings: ["roles"] }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                <CardTitle className="text-lg">Roles</CardTitle>
              </div>
              <CardDescription>
                Create and manage custom roles with permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="admin/roles">Manage Roles</Link>
              </Button>
            </CardContent>
          </Card>
        </PermissionGate>

        {/* Role Assignments Section */}
        <PermissionGate permissions={{ member: ["update"] }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCog className="size-5 text-primary" />
                <CardTitle className="text-lg">Role Assignments</CardTitle>
              </div>
              <CardDescription>
                Assign roles to workspace members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="admin/assignments">Manage Assignments</Link>
              </Button>
            </CardContent>
          </Card>
        </PermissionGate>
      </div>

      {/* Dangerzone Section */}
      <PermissionGate permissions={{ organization: ["delete"] }}>
        <div className="space-y-4">
          <div>
            <h2 className="font-medium text-xl">Danger Zone</h2>
            <p className="text-muted-foreground text-sm">
              Irreversible and destructive actions
            </p>
          </div>
          <Card className="border-destructive/50">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">Delete Workspace</p>
                <p className="text-muted-foreground text-sm">
                  Permanently delete this workspace and all its data
                </p>
              </div>
              <Button variant="destructive" disabled>
                Delete Workspace
              </Button>
            </CardContent>
          </Card>
        </div>
      </PermissionGate>
    </div>
  );
}

"use client";

import { ProfileForm } from "@/components/settings/profile-form";
import { WorkspaceMembership } from "@/components/settings/workspace-membership";

export default function ProfilePage() {
  return (
    <div className="space-y-6 px-4">
      <div>
        <h1 className="font-semibold text-3xl">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Information Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-medium text-xl">Profile Information</h2>
          <p className="text-muted-foreground text-sm">
            Update your profile picture and personal details
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <ProfileForm />
        </div>
      </div>

      {/* Workspace Access Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-medium text-xl">Workspace Access</h2>
          <p className="text-muted-foreground text-sm">
            Your membership in the current workspace
          </p>
        </div>
        <WorkspaceMembership />
      </div>
    </div>
  );
}

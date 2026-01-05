"use client";

import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";

export default function ProfilePage() {
  return (
    <Setting>
      <SettingHeader
        title="Profile"
        description="Manage your personal information and account settings"
      />

      <SettingSection
        title="Profile Information"
        description="Update your profile picture and personal details"
      >
        <div className="rounded-lg border p-6">
          <p className="text-sm">
            Profile information form will be implemented here
          </p>
        </div>
      </SettingSection>

      <SettingSection
        title="Workspace Access"
        description="Your membership in the current workspace"
      >
        <div className="rounded-lg border p-6">
          <p className="text-sm">
            Workspace access details will be implemented here
          </p>
        </div>
      </SettingSection>
    </Setting>
  );
}

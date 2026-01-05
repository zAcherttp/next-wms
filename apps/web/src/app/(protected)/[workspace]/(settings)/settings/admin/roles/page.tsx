"use client";

import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";

export default function RolesSettingsPage() {
  return (
    <Setting>
      <SettingHeader
        title="Roles"
        description="Manage roles and permissions for your organization."
      />

      <SettingSection title="Roles Management">
        <div className="rounded-lg border p-4">
          <p className="text-sm">
            Roles management functionality will be implemented here
          </p>
        </div>
      </SettingSection>
    </Setting>
  );
}

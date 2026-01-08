"use client";

import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";

export default function BranchesPage() {
  return (
    <Setting>
      <SettingHeader
        title="Branches"
        description="View and manage workspace branches."
      />

      <SettingSection title="Branches Management">
        <div className="rounded-lg border p-4">
          <p className="flex items-center justify-between text-sm">
            Branches management functionality will be implemented here
          </p>
        </div>
      </SettingSection>
    </Setting>
  );
}

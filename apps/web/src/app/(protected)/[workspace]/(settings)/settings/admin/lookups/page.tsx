"use client";

import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";

export default function SystemLookupsPage() {
  return (
    <Setting>
      <SettingHeader
        title="System Lookups"
        description="View and manage workspace system lookups."
      />

      <SettingSection title="System Lookups Management">
        <div className="rounded-lg border p-4">
          <p className="flex items-center justify-between text-sm">
            System lookups management functionality will be implemented here
          </p>
        </div>
      </SettingSection>
    </Setting>
  );
}

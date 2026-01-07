"use client";

import { InviteUserDialog } from "@/components/settings/invite-user-dialog";
import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";

export default function MembersPage() {
  return (
    <Setting>
      <SettingHeader
        title="Members"
        description="View and manage workspace members."
      />

      <SettingSection title="Members Management">
        <div className="rounded-lg border p-4">
          <p className="flex items-center justify-between text-sm">
            Members management functionality will be implemented here
            <InviteUserDialog />
          </p>
        </div>
      </SettingSection>
    </Setting>
  );
}

"use client";

import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <Setting>
      <SettingHeader
        title="Workspace"
        description="Manage workspace settings"
      />

      <SettingSection
        title="Danger Zone"
        description="Irreversible and destructive actions"
      >
        <Card className="border-destructive/50">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Workspace</p>
              <p className="text-muted-foreground text-sm">
                Permanently delete this workspace and all its data
              </p>
            </div>
            <Button variant="destructive">Delete Workspace</Button>
          </CardContent>
        </Card>
      </SettingSection>
    </Setting>
  );
}

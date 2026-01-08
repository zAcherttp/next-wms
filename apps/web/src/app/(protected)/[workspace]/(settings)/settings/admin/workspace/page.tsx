"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, useActiveOrganization } from "@/lib/auth/client";

export default function AdminPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const { data } = useActiveOrganization();
  const router = useRouter();

  const organizationName = data?.name;
  const isConfirmationValid = confirmationText === organizationName;

  const handleDeleteOrganization = async () => {
    const { error } = await authClient.organization.delete({
      organizationId: data?.id || "",
    });

    if (error) {
      toast.error(`Failed to delete workspace: ${error.message}`);
      return;
    }

    toast.success("Workspace deleted successfully");
    router.push("/");
  };

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
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
            >
              Delete Workspace
            </Button>
          </CardContent>
        </Card>
      </SettingSection>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              workspace and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type
                <span className="font-semibold">{organizationName}</span>
                to confirm
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={organizationName}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setConfirmationText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrganization}
              disabled={!isConfirmationValid}
            >
              Delete Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Setting>
  );
}

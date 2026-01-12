"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
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
        <Item className="border border-destructive/50">
          <ItemContent>
            <ItemTitle>Delete Workspace</ItemTitle>
            <ItemDescription>
              Permanently delete this workspace and all its data
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
            >
              Delete Workspace
            </Button>
          </ItemActions>
        </Item>
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

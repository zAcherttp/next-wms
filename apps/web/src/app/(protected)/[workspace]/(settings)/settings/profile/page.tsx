"use client";

import { Check, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/hooks/use-current-user";
import { authClient } from "@/lib/auth/client";

export default function ProfilePage() {
  const { user } = useCurrentUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullName, setFullName] = useState("");

  const handleEditName = () => {
    setFullName(user?.fullName || "");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    if (fullName === user?.fullName) {
      toast.info("No changes made to full name");
      setIsEditingName(false);
      return;
    }

    try {
      await authClient.updateUser({
        name: fullName,
      });
      toast.success("Full name updated successfully");
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update name:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setFullName("");
  };

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
        <div className="rounded-lg border">
          <Item>
            <ItemContent>
              <ItemTitle>Profile picture</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Input disabled />
              <Button variant={"ghost"} size={"icon"} disabled>
                <Pencil />
              </Button>
            </ItemActions>
          </Item>
          <Separator />
          {/* <Item>
            <ItemContent>
              <ItemTitle>Username</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Input defaultValue={`${user?.username}`} disabled={true} />
              <Button variant={"ghost"} size={"icon"}>
                <Pencil />
              </Button>
            </ItemActions>
          </Item>
          <Separator /> */}
          <Item>
            <ItemContent>
              <ItemTitle>Fullname</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Input
                value={isEditingName ? fullName : user?.fullName || ""}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditingName}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isEditingName) {
                    handleSaveName();
                  } else if (e.key === "Escape") {
                    handleCancelEdit();
                  }
                }}
              />
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={isEditingName ? handleSaveName : handleEditName}
              >
                {isEditingName ? <Check /> : <Pencil />}
              </Button>
            </ItemActions>
          </Item>
        </div>
      </SettingSection>

      <SettingSection
        title="Workspace Access"
        description="Your membership in the current workspace"
      >
        <div className="rounded-lg border p-6 pl-4">
          <p className="text-sm">
            Workspace access details will be implemented here
          </p>
        </div>
      </SettingSection>
    </Setting>
  );
}

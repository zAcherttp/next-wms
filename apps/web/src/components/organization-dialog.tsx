import { Building2, ChevronRight, QrCode, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "./ui/item";
import { Input } from "./ui/input";
import { Field, FieldLabel, FieldError } from "./ui/field";

interface OrganizationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type DialogView = "selection" | "create" | "join-method" | "join-code";

const ItemStyle =
  "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 cursor-pointer";

export function OrganizationDialog({
  open,
  onOpenChange,
}: OrganizationDialogProps) {
  const [view, setView] = useState<DialogView>("selection");

  // Form states
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgLogo, setOrgLogo] = useState<File | null>(null);
  const [inviteCode, setInviteCode] = useState("");

  const handleClose = () => {
    // Reset state when dialog closes
    setView("selection");
    setOrgName("");
    setOrgSlug("");
    setOrgLogo(null);
    setInviteCode("");
    onOpenChange?.(false);
  };

  const handleBack = () => {
    if (view === "create" || view === "join-method") {
      setView("selection");
    } else if (view === "join-code") {
      setView("join-method");
    }
  };

  const handleCreateOrg = async () => {
    // TODO: Implement organization creation logic
    console.log({ orgName, orgSlug, orgLogo });
    handleClose();
  };

  const handleJoinOrg = async () => {
    // TODO: Implement join organization logic
    console.log({ inviteCode });
    handleClose();
  };

  const dialogConfig = {
    selection: {
      title: "Add Organization",
      description:
        "Choose how you'd like to add an organization to your workspace.",
    },
    create: {
      title: "Create Organization",
      description: "Set up a new organization and invite your team members.",
    },
    "join-method": {
      title: "Join Organization",
      description: "Choose how you'd like to join an existing organization.",
    },
    "join-code": {
      title: "Enter Invite Code",
      description:
        "Enter the invite code provided by your organization administrator.",
    },
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{dialogConfig[view].title}</DialogTitle>
          <DialogDescription>
            {dialogConfig[view].description}
          </DialogDescription>
        </DialogHeader>

        {/* Selection View */}
        {view === "selection" && (
          <div className="flex flex-col gap-2">
            <Item
              variant="outline"
              className={ItemStyle}
              onClick={() => setView("create")}
            >
              <ItemMedia>
                <UserRoundPlus className="size-5" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Create organization</ItemTitle>
                <ItemDescription>
                  Once created, you&apos;ll become organization administrator
                  who can invite members to join.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="size-4" />
              </ItemActions>
            </Item>
            <Item
              variant="outline"
              className={ItemStyle}
              onClick={() => setView("join-method")}
            >
              <ItemMedia>
                <Building2 className="size-5" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Join organization</ItemTitle>
                <ItemDescription>
                  Join organization through Invite QR Code or Invite Code, and
                  start collaborating with others.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="size-4" />
              </ItemActions>
            </Item>
          </div>
        )}

        {/* Create Organization Form */}
        {view === "create" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateOrg();
            }}
            className="flex flex-col gap-4"
          >
            <Field>
              <FieldLabel htmlFor="org-name">Organization Name</FieldLabel>
              <Input
                id="org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Acme Corp"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="org-slug">Organization Slug</FieldLabel>
              <Input
                id="org-slug"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                placeholder="acme-corp"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="org-logo">Logo (Optional)</FieldLabel>
              <Input
                id="org-logo"
                type="file"
                accept="image/*"
                onChange={(e) => setOrgLogo(e.target.files?.[0] || null)}
              />
            </Field>
          </form>
        )}

        {/* Join Method Selection */}
        {view === "join-method" && (
          <div className="flex flex-col gap-2">
            <Item
              variant="outline"
              className={ItemStyle}
              onClick={() => setView("join-code")}
            >
              <ItemMedia>
                <Building2 className="size-5" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Enter Invite Code</ItemTitle>
                <ItemDescription>
                  Manually enter the invite code provided by your administrator.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="size-4" />
              </ItemActions>
            </Item>
            <Item
              variant="outline"
              className={ItemStyle}
              onClick={() => {
                // TODO: Open QR scanner
                setView("join-code");
              }}
            >
              <ItemMedia>
                <QrCode className="size-5" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Scan QR Code</ItemTitle>
                <ItemDescription>
                  Use your camera to scan the invite QR code.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="size-4" />
              </ItemActions>
            </Item>
          </div>
        )}

        {/* Join Code Input */}
        {view === "join-code" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJoinOrg();
            }}
            className="flex flex-col gap-4"
          >
            <Field>
              <FieldLabel htmlFor="invite-code">Invite Code</FieldLabel>
              <Input
                id="invite-code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="ABC-DEF-GHI"
                required
              />
            </Field>
          </form>
        )}

        <DialogFooter className="flex-row gap-2">
          {view !== "selection" && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {view === "create" && (
            <Button onClick={handleCreateOrg} disabled={!orgName || !orgSlug}>
              Create
            </Button>
          )}
          {view === "join-code" && (
            <Button onClick={handleJoinOrg} disabled={!inviteCode}>
              Join
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

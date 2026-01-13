"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateNewButton } from "@/components/ui/create-new-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateRoleDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CreateNewButton label="Create new role" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new role</DialogTitle>
          <DialogDescription>
            Define a name and set base permission set for the new role.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="role-name">Role Name</FieldLabel>
            <Input id="role-name" placeholder="Manager" />
            <FieldLabel htmlFor="base-permissions">Base Permissions</FieldLabel>
            <Select defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder="role" />
              </SelectTrigger>
              <SelectContent>
                {/* TODO: Map Select Item from both role sets */}
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>
              Select a base permission set to copy from.
            </FieldDescription>
          </Field>
        </FieldGroup>
        <DialogFooter>
          {/* <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose> */}
          <Button>Create Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

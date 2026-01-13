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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddMemberDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CreateNewButton label="Add member" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member to role</DialogTitle>
          <DialogDescription>
            Assign a member to the selected role.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="member-select">Select Member</FieldLabel>
            <Select defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder="Choose a member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">John Doe</SelectItem>
                <SelectItem value="2">Jane Smith</SelectItem>
                <SelectItem value="3">Bob Johnson</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>
              Select a member to assign to this role.
            </FieldDescription>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button>Add Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className="overflow-hidden px-2.5 py-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div className="flex items-center">
            <Plus />
            <motion.span
              initial={false}
              animate={isHovered ? "hover" : "initial"}
              variants={{
                initial: { width: 0, opacity: 0, marginLeft: 0 },
                hover: { width: "auto", opacity: 1, marginLeft: 8 },
              }}
              className="overflow-hidden whitespace-nowrap"
            >
              Create new role
            </motion.span>
          </motion.div>
        </Button>
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

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddMemberDialog() {
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
              Add member
            </motion.span>
          </motion.div>
        </Button>
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

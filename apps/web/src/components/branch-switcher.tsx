"use client";

import type { Id } from "@wms/backend/convex/_generated/dataModel";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranches } from "@/hooks/use-branches";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function BranchSwitcher() {
  const { organizationId } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { branches, currentBranch, selectBranch, isLoading } = useBranches({
    organizationId: organizationId as Id<"organizations"> | undefined,
    includeDeleted: false,
  });

  // Filter branches based on search query
  const filteredBranches =
    branches?.filter((branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? [];

  if (isLoading) {
    return <Skeleton className="h-10 w-50" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          size={"sm"}
          className="truncate"
        >
          {currentBranch?.name ?? "Select branch"}
          <ChevronsUpDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-50 p-0" align={"end"}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search branches..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandGroup>
              {filteredBranches.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-sm">
                  No branches found.
                </div>
              ) : (
                filteredBranches.map((branch) => (
                  <CommandItem
                    key={branch._id}
                    value={branch.name}
                    onSelect={() => {
                      selectBranch(branch);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex cursor-pointer items-center justify-between"
                  >
                    <span className="truncate">{branch.name}</span>
                    {currentBranch?._id === branch._id && (
                      <Check className="size-4" />
                    )}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

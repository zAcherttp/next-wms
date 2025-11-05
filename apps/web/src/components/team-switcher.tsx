"use client";

import { Building2, ChevronsUpDown, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  organization,
  useActiveOrganization,
  useListOrganizations,
} from "@/lib/auth-client";
import { Skeleton } from "./ui/skeleton";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { data: organizations, isPending } = useListOrganizations();
  const { data: activeOrganization } = useActiveOrganization();

  const handleOrgSwitch = async (orgId: string) => {
    await organization.setActive({ organizationId: orgId });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {organizations ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {activeOrganization ? (
                  <>
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      {activeOrganization.logo ? (
                        <Avatar className="h-4 w-4 rounded">
                          <AvatarImage
                            src={activeOrganization.logo}
                            alt={activeOrganization.name}
                          />
                          <AvatarFallback>
                            <Building2 className="size-2.5" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Building2 className="size-4" />
                      )}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {activeOrganization.name}
                      </span>
                      <span className="truncate text-xs">
                        {activeOrganization.slug}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Building2 className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium text-muted-foreground">
                        No organization
                      </span>
                      <span className="truncate text-muted-foreground text-xs">
                        Select one
                      </span>
                    </div>
                  </>
                )}

                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((org, index) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleOrgSwitch(org.id)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    {org.logo ? (
                      <Avatar className="h-3.5 w-3.5 shrink-0 rounded">
                        <AvatarImage src={org.logo} alt={org.name} />
                        <AvatarFallback>
                          <Building2 className="size-2.5" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Building2 className="size-3.5 shrink-0" />
                    )}
                  </div>
                  {org.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add organization
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : isPending ? (
          <SidebarMenuButton size="lg" className="pointer-events-none">
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="grid flex-1 gap-0.5 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        ) : null}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

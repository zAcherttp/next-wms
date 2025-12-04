"use client";

import { Building2, ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePrefetchWorkspace } from "@/lib/prefetch";
import {
  selectCurrentTenant,
  selectStatus,
  selectTenants,
  useGlobalStore,
} from "@/stores";
import { OrganizationDialog } from "./organization-dialog";
import { Kbd } from "./ui/kbd";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";

export function NavWorkspace() {
  const router = useRouter();
  const { isMobile } = useSidebar();

  // Use Zustand store instead of Better Auth hooks
  const tenants = useGlobalStore(selectTenants);
  const currentTenant = useGlobalStore(selectCurrentTenant);
  const status = useGlobalStore(selectStatus);
  const prefetch = usePrefetchWorkspace();

  const [open, setOpen] = useState(false);

  const isPending = status === "loading" || status === "idle";
  const hasOrganizations = tenants.length > 0;

  const handleOrgSwitch = (orgSlug: string) => {
    // Just navigate - WorkspaceSync will handle setting active org
    router.push(`/${orgSlug}/dashboard`);
  };

  const handleOrgHover = (orgSlug: string) => {
    // Prefetch workspace data on hover for faster navigation
    prefetch(orgSlug, "low");
  };

  const handleSettingsClick = () => {
    if (currentTenant) {
      router.push(`/${currentTenant.slug}/settings`);
    } else {
      // this should not happen, but just in case
      toast.error("No active organization to view settings for.");
    }
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          {hasOrganizations ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {currentTenant ? (
                    <>
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        {currentTenant.logo ? (
                          <Avatar className="h-4 w-4 rounded">
                            <AvatarImage
                              src={currentTenant.logo}
                              alt={currentTenant.name}
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
                          {currentTenant.name}
                        </span>
                        <span className="truncate text-xs">
                          {currentTenant.slug}
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
                <DropdownMenuItem onClick={handleSettingsClick}>
                  Settings
                  <DropdownMenuShortcut>
                    <Kbd>S</Kbd>
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>Invite and manage members</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Switch organization
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <ScrollArea className="h-32">
                        {tenants.map((tenant, index: number) => (
                          <DropdownMenuItem
                            key={tenant.id}
                            onClick={() => handleOrgSwitch(tenant.slug)}
                            onMouseEnter={() => handleOrgHover(tenant.slug)}
                            className="gap-2 p-2"
                          >
                            <div className="flex size-6 items-center justify-center rounded-md border">
                              {tenant.logo ? (
                                <Avatar className="h-3.5 w-3.5 shrink-0 rounded">
                                  <AvatarImage
                                    src={tenant.logo}
                                    alt={tenant.name}
                                  />
                                  <AvatarFallback>
                                    <Building2 className="size-2.5" />
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <Building2 className="size-3.5 shrink-0" />
                              )}
                            </div>
                            {tenant.name}
                            <DropdownMenuShortcut>
                              <Kbd>{index + 1}</Kbd>
                            </DropdownMenuShortcut>
                          </DropdownMenuItem>
                        ))}
                      </ScrollArea>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setOpen(true);
                        }}
                        className="gap-2 p-2"
                      >
                        <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                          <Plus className="size-4" />
                        </div>
                        <div className="font-medium text-muted-foreground">
                          Add organization
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
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
      <OrganizationDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

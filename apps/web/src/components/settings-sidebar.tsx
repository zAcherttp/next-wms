"use client";

import type { LucideIcon } from "lucide-react";
import {
  Building,
  ChevronLeft,
  CircleUserRound,
  KeyRound,
  Settings2,
  UserCog,
  UserRound,
  Users2,
} from "lucide-react";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { Permissions } from "@/hooks/use-has-permission";
import { selectMembership, selectStatus, useGlobalStore } from "@/stores";
import { SettingsNavMain } from "./settings-nav-main";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";

type SettingNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  permissions: Permissions;
  isAdmin?: boolean;
};

export type SettingNavGroup = {
  title: string;
  showTitle?: boolean;
  items: SettingNavItem[];
};

/**
 * Full settings navigation configuration with permissions.
 */
const settingsNavigation: SettingNavGroup[] = [
  {
    title: "Personal",
    showTitle: true,
    items: [
      {
        title: "Preferences",
        icon: Settings2,
        url: "preferences",
        permissions: { settings: ["profile"] },
      },
      {
        title: "Profile",
        icon: UserRound,
        url: "profile",
        permissions: { settings: ["profile"] },
      },
      {
        title: "Security & Access",
        icon: KeyRound,
        url: "security",
        permissions: { settings: ["security"] },
      },
    ],
  },
  {
    title: "Administration",
    showTitle: true,
    items: [
      {
        title: "Workspace",
        icon: Building,
        url: "admin",
        permissions: { settings: ["admin"] },
        isAdmin: true,
      },
      {
        title: "Members",
        icon: Users2,
        url: "admin/members",
        permissions: { settings: ["members"], member: ["read"] },
        isAdmin: true,
      },
      {
        title: "Roles & Permissions",
        icon: CircleUserRound,
        url: "admin/roles",
        permissions: { settings: ["roles"], role: ["read"] },
        isAdmin: true,
      },
      {
        title: "Role Assignments",
        icon: UserCog,
        url: "admin/assignments",
        permissions: { member: ["update"] },
        isAdmin: true,
      },
    ],
  },
];

/**
 * Check if user has all permissions for an item using O(1) store lookup
 */
function checkItemPermissions(
  item: SettingNavItem,
  hasPermission: (resource: string, action: string) => boolean,
): boolean {
  for (const [resource, actions] of Object.entries(item.permissions)) {
    for (const action of actions) {
      if (!hasPermission(resource, action)) {
        return false;
      }
    }
  }
  return true;
}

export function SettingsSidebar({
  isMobile,
  ...props
}: React.ComponentProps<typeof Sidebar> & { isMobile: boolean }) {
  const params = useParams<{ workspace: string }>();
  const workspace = params.workspace;

  // Use Zustand store instead of Better Auth hook
  const membership = useGlobalStore(selectMembership);
  const status = useGlobalStore(selectStatus);
  const storeHasPermission = useGlobalStore((state) => state.hasPermission);

  const isLoading = status === "loading" || status === "idle";

  // O(1) permission filtering - no async, no API calls
  const filteredNav = useMemo(() => {
    if (!membership?.role) {
      // No role - only show personal settings (everyone has access)
      return settingsNavigation
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => !item.isAdmin),
        }))
        .filter((group) => group.items.length > 0);
    }

    const results: SettingNavGroup[] = [];

    for (const group of settingsNavigation) {
      const allowedItems: SettingNavItem[] = [];

      for (const item of group.items) {
        // O(1) permission check using store
        if (checkItemPermissions(item, storeHasPermission)) {
          allowedItems.push(item);
        }
      }

      if (allowedItems.length > 0) {
        results.push({
          ...group,
          items: allowedItems,
        });
      }
    }

    return results;
  }, [membership?.role, storeHasPermission]);

  // Build full URLs with workspace
  const navWithUrls = filteredNav.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      url: `/${workspace}/settings/${item.url}`,
    })),
  }));

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "none"} {...props}>
      <SidebarHeader>
        <Button variant="ghost" className="w-1/2" asChild>
          <a href={`/${workspace}`}>
            <ChevronLeft />
            Back to app
          </a>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-4 w-20" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ) : (
            <SettingsNavMain items={navWithUrls} />
          )}
        </ScrollArea>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

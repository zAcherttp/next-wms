"use client";

import type { LucideIcon } from "lucide-react";
import {
  Building,
  ChevronLeft,
  CircleUserRound,
  KeyRound,
  Settings2,
  TableProperties,
  UserRound,
  Users2,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SettingsNavMain } from "./settings-nav-main";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

type SettingNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
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
const settingsNavs: SettingNavGroup[] = [
  {
    title: "Personal",
    showTitle: true,
    items: [
      {
        title: "Preferences",
        icon: Settings2,
        url: "preferences",
      },
      {
        title: "Profile",
        icon: UserRound,
        url: "profile",
      },
      {
        title: "Security & Access",
        icon: KeyRound,
        url: "security",
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
        url: "admin/workspace",
        isAdmin: true,
      },
      {
        title: "Members",
        icon: Users2,
        url: "admin/members",
        isAdmin: true,
      },
      {
        title: "Roles & Permissions",
        icon: CircleUserRound,
        url: "admin/roles",
        isAdmin: true,
      },
      {
        title: "Branches",
        icon: Warehouse,
        url: "admin/branches",
        isAdmin: true,
      },
      {
        title: "System Lookups",
        icon: TableProperties,
        url: "admin/lookups",
        isAdmin: true,
      },
    ],
  },
];

type SettingsSidebarProps = React.ComponentProps<typeof Sidebar>;

export function SettingsSidebar({ ...props }: SettingsSidebarProps) {
  const isMobile = useIsMobile();
  const params = useParams<{ workspace: string }>();
  const workspace = params.workspace;

  // Build full URLs with workspace
  const navWithUrls = settingsNavs.map((group) => ({
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
          <Link href={`/${workspace}/dashboard`}>
            <ChevronLeft />
            Back to app
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="overflow-y-auto">
          <SettingsNavMain items={navWithUrls} />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}

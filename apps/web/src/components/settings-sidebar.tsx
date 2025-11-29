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
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SettingsNavMain } from "./settings-nav-main";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

type SettingNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export type SettingNavGroup = {
  title: string;
  showTitle?: boolean;
  items: SettingNavItem[];
};

const data: SettingNavGroup[] = [
  {
    title: "Personal",
    showTitle: true,
    items: [
      {
        title: "Preferences",
        icon: Settings2,
        url: "#",
      },
      {
        title: "Profile",
        icon: UserRound,
        url: "#",
      },
      {
        title: "Security & Access",
        icon: KeyRound,
        url: "#",
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
        url: "#",
      },
      {
        title: "Members",
        icon: Users2,
        url: "#",
      },
      {
        title: "Role & Permissions",
        icon: CircleUserRound,
        url: "#",
      },
      {
        title: "Branches",
        icon: Warehouse,
        url: "#",
      },
      {
        title: "System Lookups",
        icon: TableProperties,
        url: "#",
      },
    ],
  },
];

export function SettingsSidebar({
  isMobile,
  ...props
}: React.ComponentProps<typeof Sidebar> & { isMobile: boolean }) {
  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "none"} {...props}>
      <SidebarHeader>
        <Button variant={"ghost"} className="w-1/2">
          <ChevronLeft />
          Back to app
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <SettingsNavMain items={data} />
        </ScrollArea>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

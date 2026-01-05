"use client";

import {
  ArrowBigDownDash,
  ArrowBigUpDash,
  ChartColumn,
  Database,
  Gauge,
  Package,
  ShieldUser,
  Warehouse,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { NavWorkspace } from "@/components/nav-workspace";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ScrollArea } from "./ui/scroll-area";

const data = {
  navMain: [
    {
      title: "Dashboard",
      icon: Gauge,
      isActive: true,
      items: [
        {
          title: "General",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Inbound",
      icon: ArrowBigDownDash,
      isActive: true,
      items: [
        {
          title: "Purchase Orders",
          url: "#",
        },
        {
          title: "Receiving Sessions",
          url: "#",
        },
        {
          title: "Return Requests",
          url: "#",
        },
      ],
    },
    {
      title: "Outbound",
      icon: ArrowBigUpDash,
      isActive: true,
      items: [
        {
          title: "Orders",
          url: "#",
        },
        {
          title: "Picking Sessions",
          url: "#",
        },
      ],
    },
    {
      title: "Inventory",
      icon: Package,
      isActive: true,
      items: [
        {
          title: "Stock",
          url: "#",
        },
        {
          title: "Batches",
          url: "#",
        },
        {
          title: "Serials",
          url: "#",
        },
        {
          title: "Adjustments",
          url: "#",
        },
        {
          title: "Transfers",
          url: "#",
        },
      ],
    },
    {
      title: "Warehouses Ops",
      icon: Warehouse,
      items: [
        {
          title: "Zones",
          url: "#",
        },
        {
          title: "Work Sessions",
          url: "#",
        },
      ],
    },
    {
      title: "Master Data",
      icon: Database,
      items: [
        {
          title: "Products",
          url: "#",
        },
        {
          title: "SKUs",
          url: "#",
        },
        {
          title: "Categories",
          url: "#",
        },
        {
          title: "UoMs",
          url: "#",
        },
        {
          title: "Brands",
          url: "#",
        },
      ],
    },
    {
      title: "Reports",
      icon: ChartColumn,
      items: [
        {
          title: "Inventory",
          url: "#",
        },
        {
          title: "Inbound",
          url: "#",
        },
        {
          title: "Outbound",
          url: "#",
        },
      ],
    },
    {
      title: "System",
      icon: ShieldUser,
      items: [
        {
          title: "Traceability",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible={"icon"} {...props}>
      <SidebarHeader>
        <NavWorkspace />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain items={data.navMain} />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

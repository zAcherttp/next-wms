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
          url: "/purchase-orders",
        },
        {
          title: "Receiving Sessions",
          url: "/receiving-sessions",
        },
        {
          title: "Return Requests",
          url: "/return-requests",
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
          url: "/orders",
        },
        {
          title: "Picking Sessions",
          url: "/picking-sessions",
        },
      ],
    },
    {
      title: "Inventory",
      icon: Package,
      items: [
        {
          title: "Stock",
          url: "/inventory/stock",
        },
        {
          title: "Batches",
          url: "/inventory/batches",
        },
        {
          title: "Serials",
          url: "/inventory/serials",
        },
        {
          title: "Adjustments",
          url: "/inventory/adjustments",
        },
        {
          title: "Transfers",
          url: "/inventory/transfers",
        },
        {
          title: "Cycle Count",
          url: "/inventory/cycle-count",
        },
      ],
    },
    {
      title: "Warehouses Ops",
      icon: Warehouse,
      items: [
        {
          title: "Zones",
          url: "/warehouses-ops/zones",
        },
        {
          title: "Work Sessions",
          url: "/warehouses-ops/work-sessions",
        },
      ],
    },
    {
      title: "Master Data",
      icon: Database,
      items: [
        {
          title: "Products",
          url: "/master-data/products",
        },
        {
          title: "Categories",
          url: "/master-data/categories",
        },
        {
          title: "Brands",
          url: "/master-data/brands",
        },
        {
          title: "Suppliers",
          url: "/master-data/suppliers",
        },
      ],
    },
    {
      title: "Reports",
      icon: ChartColumn,
      items: [
        {
          title: "Inventory",
          url: "/reports/inventory",
        },
        {
          title: "Inbound",
          url: "/reports/inbound",
        },
        {
          title: "Outbound",
          url: "/reports/outbound",
        },
      ],
    },
    {
      title: "System",
      icon: ShieldUser,
      items: [
        {
          title: "Traceability",
          url: "/system/traceability",
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

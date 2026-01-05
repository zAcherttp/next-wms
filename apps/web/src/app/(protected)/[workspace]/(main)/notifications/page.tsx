"use client";

import { Bell } from "lucide-react";
import { motion } from "motion/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import NotificationsItem from "@/app/(protected)/[workspace]/(main)/notifications/notification-item";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { NotificationItem } from "@/lib/auth/types";

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    actionUrl: "/workspace/inventory/item/123",
    title: "Low Stock Alert",
    message:
      "Item 'Laptop Stand' is running low on stock. Current quantity: 5 units",
    category: "inventory",
    type: "alert",
    priority: "high",
    dismissed: false,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    title: "New Order Received",
    message: "Order #ORD-2024-001 has been placed by Customer ABC Corp",
    category: "orders",
    type: "info",
    priority: "medium",
    dismissed: false,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "3",
    actionUrl: "/workspace/shipments/456",
    title: "Shipment Delayed",
    message: "Shipment #SHP-456 is delayed by 2 days due to weather conditions",
    category: "shipments",
    type: "warning",
    priority: "high",
    dismissed: false,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 61).toISOString(),
  },
  {
    id: "4",
    title: "Inventory Report Ready",
    message: "Your monthly inventory report for January 2024 is now available",
    category: "reports",
    type: "info",
    priority: "low",
    dismissed: true,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "5",
    actionUrl: "/workspace/inventory/item/789",
    title: "Stock Threshold Reached",
    message:
      "Item 'USB-C Cable' has reached minimum stock threshold of 10 units Item 'USB-C Cable' has reached minimum stock threshold of 10 units Item 'USB-C Cable' has reached minimum stock threshold of 10 units Item 'USB-C Cable' has reached minimum stock threshold of 10 units Item 'USB-C Cable' has reached minimum stock threshold of 10 units ",
    category: "inventory",
    type: "warning",
    priority: "medium",
    dismissed: false,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export default function NotificationsPage() {
  const params = useParams();
  const workspace = params.workspace as string;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-[calc(100vh-4rem)] py-4">
      <div className="flex h-full gap-0 rounded-sm border">
        {/* Notification List */}
        <div className="flex w-full flex-col border-r md:w-[400px]">
          <div className="flex h-12 items-center px-4">
            <span className="font-semibold">Notifications</span>
          </div>
          <Separator />
          <ScrollArea className="flex-1 py-1">
            {NOTIFICATIONS.map((notification) => (
              <NotificationsItem
                key={notification.id}
                notification={notification}
                href={`/${workspace}/notifications/${notification.id}`}
              />
            ))}
          </ScrollArea>
        </div>

        {/* Details Panel - Empty state */}
        <div className="hidden flex-1 flex-col md:flex">
          <div className="flex h-12 items-center gap-2 px-4" />
          <Separator />
          <div className="flex flex-1 items-center justify-center p-4">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Bell />
                </EmptyMedia>
                <EmptyTitle>No notification selected</EmptyTitle>
                <EmptyDescription>
                  Select a notification from the list to view its details
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        </div>
      </div>
    </div>
  );
}

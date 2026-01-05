import Link from "next/link";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import type { NotificationItem } from "@/lib/auth/types";
import { formatRelativeTime } from "@/lib/format-date";

export default function NotificationsItem({
  notification,
  href,
}: {
  notification: NotificationItem;
  href: string;
}) {
  return (
    <Item asChild className="mx-2 my-1 px-2 py-1">
      <Link href={href}>
        <ItemContent
          className={`${notification.dismissed ? "text-muted-foreground/70" : ""}`}
        >
          <ItemTitle className="w-full">
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-blue-500" />
            )}
            <span className="text-sm">{notification.title}</span>
            <span className="ml-auto text-muted-foreground text-xs">
              {formatRelativeTime(new Date(notification.createdAt))}
            </span>
          </ItemTitle>
          <ItemDescription className="max-w-xs truncate text-sm">
            {notification.message}
          </ItemDescription>
        </ItemContent>
      </Link>
    </Item>
  );
}

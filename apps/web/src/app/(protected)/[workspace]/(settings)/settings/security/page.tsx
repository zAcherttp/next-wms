"use client";

import { formatDistanceToNow } from "date-fns";
import { MonitorSmartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment } from "react/jsx-runtime";
import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { useListSessions } from "@/hooks/use-list-sessions";
import { authClient } from "@/lib/auth/client";
import { parseUserAgent } from "@/lib/user-agent";

export default function SecurityPage() {
  const router = useRouter();
  const { data: activeSession } = authClient.useSession();
  const { sessions, isLoading } = useListSessions();

  return (
    <Setting>
      <SettingHeader
        title="Security & Access"
        description="Manage your security settings and active sessions"
      />

      <SettingSection
        title="Sessions"
        description="Device logged into your account"
      >
        <ItemGroup className="rounded-md border border-primary/10 dark:bg-primary/5">
          {sessions.map((session, index) => (
            <Fragment key={session.id}>
              <Item className="group">
                <ItemMedia variant={"icon"}>
                  <MonitorSmartphone />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {parseUserAgent(session.userAgent || "")}
                  </ItemTitle>
                  <ItemDescription>
                    {session.id === activeSession?.session.id && (
                      <>
                        <span className="inline-flex items-center text-green-500">
                          Current session
                        </span>{" "}
                        &middot;{" "}
                      </>
                    )}
                    {formatDistanceToNow(new Date(session.createdAt), {
                      addSuffix: true,
                    })}
                  </ItemDescription>
                </ItemContent>
                <ItemActions className="opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await session.revoke();
                      // If this is the current session, refresh to trigger middleware
                      if (session.id === activeSession?.session.id) {
                        router.refresh();
                      }
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging out..." : "Log out"}
                  </Button>
                </ItemActions>
              </Item>
              {index < sessions.length - 1 && <ItemSeparator />}
            </Fragment>
          ))}
        </ItemGroup>
      </SettingSection>
    </Setting>
  );
}

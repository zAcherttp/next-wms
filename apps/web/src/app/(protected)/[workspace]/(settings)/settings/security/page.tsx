import { auth } from "@wms/backend/auth";
import { formatDistanceToNow } from "date-fns";
import { MonitorSmartphone } from "lucide-react";
import { headers } from "next/headers";
import { Fragment } from "react/jsx-runtime";
import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";
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
import { parseUserAgent } from "@/lib/user-agent";
import { RevokeSessionButton } from "./revoke-session-button";

export default async function SecurityPage() {
  const [session, activeSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
      headers: await headers(),
    }),
  ]);

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
          {activeSessions.map((activeSession, index) => (
            <Fragment key={activeSession.id}>
              <Item className="group">
                <ItemMedia variant={"icon"}>
                  <MonitorSmartphone />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {parseUserAgent(activeSession.userAgent || "")}
                  </ItemTitle>
                  <ItemDescription>
                    {activeSession.id === session?.session.id && (
                      <>
                        <span className="inline-flex items-center text-green-500">
                          Current session
                        </span>{" "}
                        &middot;{" "}
                      </>
                    )}
                    {formatDistanceToNow(new Date(activeSession.createdAt), {
                      addSuffix: true,
                    })}
                  </ItemDescription>
                </ItemContent>
                <ItemActions className="opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <RevokeSessionButton token={activeSession.token} />
                </ItemActions>
              </Item>
              {index < activeSessions.length - 1 && <ItemSeparator />}
            </Fragment>
          ))}
        </ItemGroup>
      </SettingSection>
    </Setting>
  );
}

import { getServerActiveOrganization } from "@/lib/auth-server";
import { SettingsShell } from "./settings-shell";

interface SettingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}

/**
 * Settings layout - server component that fetches auth data once.
 * Data is passed to client shell for rendering.
 */
export default async function SettingsLayout({
  children,
  params,
}: SettingsLayoutProps) {
  const { workspace } = await params;

  // Fetch organization and permissions server-side (single request)
  const activeOrg = await getServerActiveOrganization();
  const membership = activeOrg?.activeMember;
  const permissions = membership?.role?.permissions ?? {};
  const hasMembership = !!membership;

  return (
    <SettingsShell
      workspace={workspace}
      permissions={permissions}
      hasMembership={hasMembership}
      routeAllowed={true}
    >
      {children}
    </SettingsShell>
  );
}

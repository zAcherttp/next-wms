"use client";

import { useMemo } from "react";
import { SettingsSidebar } from "@/components/settings-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { RouteGuard } from "./route-guard";

interface SettingsShellProps {
  children: React.ReactNode;
  workspace: string;
  /** Permissions from server (serializable) */
  permissions: Record<string, string[]>;
  /** Whether user has membership */
  hasMembership: boolean;
  /** Whether current route is allowed */
  routeAllowed: boolean;
}

/**
 * Build permission set for O(1) lookup
 */
function buildPermissionSet(
  permissions: Record<string, string[]>,
): Set<string> {
  const set = new Set<string>();
  for (const [resource, actions] of Object.entries(permissions)) {
    for (const action of actions) {
      set.add(`${resource}:${action}`);
    }
  }
  return set;
}

/**
 * Client shell for settings layout.
 * Handles mobile detection and interactive sidebar.
 */
export function SettingsShell({
  children,
  workspace,
  permissions,
  hasMembership,
  routeAllowed,
}: SettingsShellProps) {
  const isMobile = useIsMobile();

  // Build permission set and checker on client (memoized)
  const permissionSet = useMemo(
    () => buildPermissionSet(permissions),
    [permissions],
  );
  const hasPermission = useMemo(
    () => (resource: string, action: string) =>
      permissionSet.has(`${resource}:${action}`),
    [permissionSet],
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <SettingsSidebar
        isMobile={isMobile}
        hasPermission={hasPermission}
        isLoading={false}
        hasMembership={hasMembership}
      />
      <SidebarInset className="max-h-screen overflow-y-scroll">
        <header className="flex h-16 shrink-0 items-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full flex-row items-center justify-between px-4 transition-[padding] group-has-data-[collapsible=icon]/sidebar-wrapper:px-2">
            {isMobile && <SidebarTrigger className="size-8" />}
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 py-4 md:gap-6 md:py-6">
              <RouteGuard allowed={routeAllowed} workspace={workspace}>
                {children}
              </RouteGuard>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

"use client";

import { AlertTriangle, Loader2, ShieldX } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { SettingsSidebar } from "@/components/settings-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { type Permissions, useHasPermission } from "@/hooks/use-has-permission";
import { useIsMobile } from "@/hooks/use-mobile";
import { getRoutePermissions } from "@/lib/settings-permissions";

/**
 * Get the settings-relative path from the full pathname.
 * Extracts the path after `/[workspace]/settings/`
 */
function getSettingsPath(pathname: string): string {
  const match = pathname.match(/\/[^/]+\/settings\/(.+)?$/);
  return match?.[1] ?? "";
}

// Empty permissions object for routes that don't require permissions
const EMPTY_PERMISSIONS: Permissions = {};

/**
 * Route guard component that checks permissions and renders content or access denied.
 */
function RouteGuard({
  children,
  permissions,
}: {
  children: React.ReactNode;
  permissions: Permissions | null;
}) {
  const router = useRouter();
  const params = useParams<{ workspace: string }>();
  const workspace = params?.workspace;

  // Determine if we need to check permissions
  const hasRequiredPermissions = permissions !== null;
  const permissionsToCheck = permissions ?? EMPTY_PERMISSIONS;

  // Always call the hook (React rules), but only enable it when needed
  const { hasPermission, isLoading, error } = useHasPermission(
    permissionsToCheck,
    { enabled: hasRequiredPermissions },
  );

  // If no permissions required, allow access
  if (!hasRequiredPermissions) {
    return <>{children}</>;
  }

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show error state if permission check failed
  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-destructive">
          <AlertTriangle className="size-12" />
          <h2 className="font-semibold text-xl">Error Checking Permissions</h2>
          <p className="max-w-md text-center text-muted-foreground">
            We couldn't verify your access to this page. Please try refreshing.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have permission
  if (!hasPermission) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <ShieldX className="size-12 text-destructive" />
          <h2 className="font-semibold text-foreground text-xl">
            Access Denied
          </h2>
          <p className="max-w-md text-center">
            You don't have permission to access this settings page.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/${workspace}/settings/profile`)}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  // Extract the settings-relative path and get required permissions
  const settingsPath = useMemo(() => getSettingsPath(pathname), [pathname]);
  const requiredPermissions = useMemo(
    () => getRoutePermissions(settingsPath),
    [settingsPath],
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <SettingsSidebar isMobile={isMobile} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full flex-row items-center justify-between px-4 transition-[padding] group-has-data-[collapsible=icon]/sidebar-wrapper:px-2">
            {isMobile && <SidebarTrigger className="size-8" />}
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <RouteGuard permissions={requiredPermissions}>
                {children}
              </RouteGuard>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

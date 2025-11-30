"use client";

import type { ReactNode } from "react";
import { type Permissions, useHasPermission } from "@/hooks/use-has-permission";

/**
 * Props for the PermissionGate component.
 */
export interface PermissionGateProps {
  /** Required permissions to render children */
  permissions: Permissions;
  /** Content to render when user has permission */
  children: ReactNode;
  /** Optional fallback when user doesn't have permission */
  fallback?: ReactNode;
  /** Optional loading state component */
  loading?: ReactNode;
  /**
   * Behavior when permission is denied:
   * - "hide" (default): Render nothing or fallback
   * - "disable": Render children but disabled (wraps in div with pointer-events: none)
   */
  behavior?: "hide" | "disable";
}

/**
 * Component for conditional rendering based on user permissions.
 *
 * Wraps content that should only be visible/accessible to users with
 * specific permissions. Uses Better Auth's hasPermission API.
 *
 * @example
 * ```tsx
 * // Hide invite button for users without permission
 * <PermissionGate permissions={{ member: ["invite"] }}>
 *   <Button onClick={handleInvite}>Invite Member</Button>
 * </PermissionGate>
 *
 * // Show a message for unauthorized users
 * <PermissionGate
 *   permissions={{ role: ["create"] }}
 *   fallback={<p>You don't have permission to create roles.</p>}
 * >
 *   <CreateRoleButton />
 * </PermissionGate>
 *
 * // Disable content instead of hiding
 * <PermissionGate
 *   permissions={{ member: ["kick"] }}
 *   behavior="disable"
 * >
 *   <KickMemberButton />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permissions,
  children,
  fallback = null,
  loading = null,
  behavior = "hide",
}: PermissionGateProps) {
  const { hasPermission, isLoading } = useHasPermission(permissions);

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!hasPermission) {
    if (behavior === "disable") {
      return (
        <div className="pointer-events-none opacity-50" aria-disabled="true">
          {children}
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Props for the RequirePermission component (page-level).
 */
export interface RequirePermissionProps {
  /** Required permissions to access the page */
  permissions: Permissions;
  /** Content to render when user has permission */
  children: ReactNode;
  /** Component to render when permission is denied (e.g., redirect or error page) */
  denied?: ReactNode;
  /** Component to render while checking permissions */
  loading?: ReactNode;
}

/**
 * Page-level permission guard component.
 *
 * Use this at the top of protected pages to ensure only authorized
 * users can access the content. Unlike PermissionGate, this component
 * is designed for full-page protection.
 *
 * @example
 * ```tsx
 * // In a settings page
 * export default function AdminSettingsPage() {
 *   return (
 *     <RequirePermission
 *       permissions={{ settings: ["admin"] }}
 *       denied={<AccessDeniedPage />}
 *       loading={<PageSkeleton />}
 *     >
 *       <AdminSettings />
 *     </RequirePermission>
 *   );
 * }
 * ```
 */
export function RequirePermission({
  permissions,
  children,
  denied = <DefaultAccessDenied />,
  loading = <DefaultLoading />,
}: RequirePermissionProps) {
  const { hasPermission, isLoading } = useHasPermission(permissions);

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!hasPermission) {
    return <>{denied}</>;
  }

  return <>{children}</>;
}

/**
 * Default access denied component.
 */
function DefaultAccessDenied() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h2 className="font-semibold text-2xl">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          You don&apos;t have permission to access this page.
        </p>
      </div>
    </div>
  );
}

/**
 * Default loading component.
 */
function DefaultLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}

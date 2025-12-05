/**
 * Server-side auth utilities
 *
 * These utilities can be used in server components and API routes
 * to get the current session and user without making HTTP calls.
 */

import { auth } from "@wms/backend/auth";
import { headers } from "next/headers";

/**
 * Get the current session from server-side
 * Uses the auth instance directly for better performance
 */
export async function getServerSession() {
  try {
    const headersList = await headers();

    const session = await auth.api.getSession({
      headers: headersList,
    });

    return session;
  } catch (error) {
    console.error("[Auth] Failed to get server session:", error);
    return null;
  }
}

/**
 * Get the full auth state including organizations
 * This is useful for initializing the global state provider
 */
export async function getFullAuthState() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return null;
    }

    // Get organizations for the user
    const headersList = await headers();
    const organizations = await auth.api.listOrganizations({
      headers: headersList,
    });

    // Get active organization from session
    const activeOrg = session.session?.activeOrganizationId
      ? (organizations?.find(
          (org) => org.id === session.session.activeOrganizationId,
        ) ?? null)
      : (organizations?.[0] ?? null);

    // Get member role if we have an active org
    let memberRole = null;
    if (activeOrg) {
      try {
        const fullOrg = await auth.api.getFullOrganization({
          headers: headersList,
          query: { organizationId: activeOrg.id },
        });

        // Find current user's membership
        const membership = fullOrg?.members?.find(
          (m) => m.userId === session.user.id,
        );

        if (membership) {
          memberRole = {
            role: membership.role,
            permissions: {}, // Permissions loaded separately
          };
        }
      } catch {
        // Ignore errors getting full org
      }
    }

    return {
      authenticated: true,
      session: session,
      organizations: organizations ?? [],
      activeOrg,
      memberRole,
    };
  } catch (error) {
    console.error("[Auth] Failed to get full auth state:", error);
    return null;
  }
}

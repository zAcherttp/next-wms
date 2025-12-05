import { headers } from "next/headers";

/**
 * Server-side function to fetch complete auth state
 * Should be called from layout or server component
 *
 * Fetches:
 * - Current user session
 * - User's organizations
 * - Active organization
 * - Current member role and permissions
 *
 * @returns Auth state object or null if not authenticated
 */
export async function fetchAuthState() {
  try {
    const headersList = await headers();

    // Build base URL from request headers (fallback to env/localhost)
    const host = headersList.get("host") ?? "localhost:3000";
    const proto = headersList.get("x-forwarded-proto") ?? "http";
    const origin = `${proto}://${host}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

    const cookie = headersList.get("cookie") || "";

    // Fetch session from Better Auth API
    // Prefer get-session; fall back to session for compatibility
    let sessionResponse = await fetch(`${baseUrl}/api/auth/get-session`, {
      headers: { cookie },
      cache: "no-store",
    });

    if (sessionResponse.status === 404) {
      sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
        headers: { cookie },
        cache: "no-store",
      });
    }

    if (!sessionResponse.ok) {
      return null;
    }

    const session = await sessionResponse.json();

    // If not authenticated, return null
    if (!session || !session.user) {
      return null;
    }

    // Fetch organizations list (best-effort)
    let organizations: unknown = [];
    try {
      const orgRes = await fetch(`${baseUrl}/api/auth/organization/list`, {
        headers: { cookie },
        cache: "no-store",
      });
      if (orgRes.ok) {
        organizations = await orgRes.json();
      }
    } catch (error) {
      console.error("[Auth] Failed to fetch organizations:", error);
    }

    // Attempt to derive active organization from session or org list
    const sessionActiveOrg =
      typeof session === "object" && session && "activeOrganization" in session
        ? (session as { activeOrganization?: unknown }).activeOrganization
        : undefined;

    const activeOrg =
      sessionActiveOrg ??
      (Array.isArray(organizations) && organizations.length > 0
        ? organizations[0]
        : null);

    // Member role not yet available via these endpoints; keep null for now
    const memberRole = null;

    return {
      authenticated: true,
      session,
      organizations,
      activeOrg,
      memberRole,
    };
  } catch (error) {
    console.error("[Auth] Failed to fetch auth state:", error);
    return null;
  }
}

/**
 * Server action to refresh auth state
 * Can be called from client components when needed
 *
 * Usage:
 * "use client";
 * import { refreshAuthState } from "@/lib/auth-server";
 *
 * const result = await refreshAuthState();
 */
export async function refreshAuthState() {
  "use server";

  return fetchAuthState();
}

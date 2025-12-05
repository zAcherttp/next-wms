import { cookies } from "next/headers";

// ============================================================================
// TYPES
// ============================================================================

export interface ServerSession {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface ServerOrganization {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  createdAt: string;
  metadata: unknown;
}

export interface ServerMember {
  id: string;
  userId: string;
  organizationId: string;
  role: {
    role: string;
    permissions: Record<string, string[]>;
  };
}

export interface ServerActiveOrganization extends ServerOrganization {
  activeMember: ServerMember;
}

// ============================================================================
// SERVER-SIDE AUTH FUNCTIONS
// ============================================================================

const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

/**
 * Get session from server-side
 */
export async function getServerSession(): Promise<ServerSession | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const response = await fetch(`${SITE_URL}/api/auth/get-session`, {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data?.user ? data : null;
  } catch (error) {
    console.error("Failed to get server session:", error);
    return null;
  }
}

/**
 * Get active organization with member details from server-side
 */
export async function getServerActiveOrganization(): Promise<ServerActiveOrganization | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const response = await fetch(
      `${SITE_URL}/api/auth/organization/get-full-organization`,
      {
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to get server active organization:", error);
    return null;
  }
}

/**
 * Build permission set for O(1) lookup
 */
export function buildPermissionSet(
  permissions: Record<string, string[]> | undefined,
): Set<string> {
  const set = new Set<string>();
  if (!permissions) return set;
  for (const [resource, actions] of Object.entries(permissions)) {
    for (const action of actions) {
      set.add(`${resource}:${action}`);
    }
  }
  return set;
}

/**
 * Check if user has permission
 */
export function hasPermission(
  permissionSet: Set<string>,
  resource: string,
  action: string,
): boolean {
  return permissionSet.has(`${resource}:${action}`);
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(
  permissionSet: Set<string>,
  permissions: Record<string, string[]>,
): boolean {
  for (const [resource, actions] of Object.entries(permissions)) {
    for (const action of actions) {
      if (!permissionSet.has(`${resource}:${action}`)) {
        return false;
      }
    }
  }
  return true;
}

"use client";

import { useEffect } from "react";
import type {
  ActiveOrganization,
  Organization,
  Session,
} from "@/lib/auth-types";
import { useGlobalStore } from "@/stores/global-store";
import type {
  MemberRole,
  Membership,
  Tenant,
  User,
  Warehouse,
} from "@/stores/types";

// ============================================================================
// DATA MAPPING FUNCTIONS
// ============================================================================

/**
 * Map Better Auth session to store User type
 */
function mapSessionToUser(session: Session): User {
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
    emailVerified: session.user.emailVerified,
  };
}

/**
 * Map Better Auth organizations to store Tenant type
 * Note: Warehouses will be populated separately from Convex if needed
 */
function mapOrganizationsToTenants(organizations: Organization[]): Tenant[] {
  return organizations.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    logo: org.logo ?? null,
    // Initial empty warehouses - will be populated from Convex subscription
    warehouses: [] as Warehouse[],
  }));
}

/**
 * Map Better Auth member role to store MemberRole type
 */
function mapMemberRole(
  role: string,
  permissions: Record<string, string[]> = {},
): MemberRole {
  return {
    id: "", // Role ID not directly available from Better Auth hooks
    role,
    permissions,
  };
}

/**
 * Create Membership from member role data
 */
function createMembership(
  memberId: string,
  memberRole: MemberRole,
  createdAt?: Date,
): Membership {
  return {
    memberId,
    role: memberRole,
    joinedAt: createdAt ?? new Date(),
  };
}

// ============================================================================
// GLOBAL STATE PROVIDER
// ============================================================================

export interface InitialAuthState {
  authenticated: boolean;
  session: Session;
  organizations: Organization[];
  activeOrg: ActiveOrganization | null;
  memberRole: {
    role: string;
    permissions?: Record<string, string[]>;
  } | null;
}

interface GlobalStateProviderProps {
  children: React.ReactNode;
  /**  Pre-fetched auth state from server */
  initialAuthState?: InitialAuthState | null;
}

/**
 * GlobalStateProvider - Single source of truth for auth data
 *
 * Changes from previous implementation:
 * 1. Receives pre-fetched auth state from server (no hooks!)
 * 2. Initializes store with atomic data
 * 3. Simplified to <50 lines
 *
 * For real-time updates, use useAuthSubscriptions() hook in child components
 */
export function GlobalStateProvider({
  children,
  initialAuthState,
}: GlobalStateProviderProps) {
  // -------------------------------------------------------------------------
  // STORE ACTIONS
  // -------------------------------------------------------------------------
  const initialize = useGlobalStore((state) => state.initialize);
  const reset = useGlobalStore((state) => state.reset);
  const setStatus = useGlobalStore((state) => state._setStatus);

  // -------------------------------------------------------------------------
  // INITIALIZATION EFFECT - Initialize store with pre-fetched auth state
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!initialAuthState) {
      reset();
      setStatus("ready", null);
      return;
    }

    if (!initialAuthState.authenticated) {
      reset();
      setStatus("ready", null);
      return;
    }

    const { session, organizations, activeOrg, memberRole } = initialAuthState;
    const orgList = Array.isArray(organizations) ? organizations : [];

    // Map data to store types
    const user = mapSessionToUser(session);
    const tenants =
      orgList.length > 0 ? mapOrganizationsToTenants(orgList) : [];

    // Build membership if we have active org and member role
    let membership: Membership | undefined;
    if (activeOrg && memberRole) {
      const permissions = memberRole.permissions ?? {};
      const memberId = session.user.id;

      const role = mapMemberRole(memberRole.role, permissions);
      membership = createMembership(memberId, role);
    }

    // Initialize store with pre-fetched data
    initialize({
      user,
      tenants,
      currentTenantId: activeOrg?.id,
      membership,
    });
  }, [initialAuthState, initialize, reset, setStatus]);

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return <>{children}</>;
}

// ============================================================================
// LOADING STATE COMPONENT (optional use)
// ============================================================================

interface GlobalStateLoadingGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Optional guard component to show loading state while store initializes
 */
export function GlobalStateLoadingGuard({
  children,
  fallback,
}: GlobalStateLoadingGuardProps) {
  const status = useGlobalStore((state) => state.status);

  if (status === "loading" || status === "idle") {
    return fallback ?? null;
  }

  return <>{children}</>;
}

// ============================================================================
// HOOKS FOR ACCESSING GLOBAL STATE (convenience wrappers)
// ============================================================================

/**
 * Hook to check if the global state is ready
 */
export function useGlobalStateReady(): boolean {
  const status = useGlobalStore((state) => state.status);
  return status === "ready";
}

/**
 * Hook to get the current auth error (if any)
 */
export function useGlobalStateError(): string | null {
  return useGlobalStore((state) => state.error);
}

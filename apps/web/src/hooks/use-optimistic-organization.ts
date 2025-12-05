"use client";

/**
 * Optimistic Organization Hook
 *
 * Provides optimistic UI updates for organization switching, allowing
 * instant visual feedback while the API call completes in the background.
 *
 * State Transitions:
 * IDLE -> SWITCHING -> CONFIRMED (success)
 *              |
 *           ERROR -> IDLE (rollback)
 */

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { organization } from "@/lib/auth-client";
import { useActiveOrganization, useAuthActions } from "@/lib/auth-queries";
import type { Organization } from "@/lib/auth-types";

/**
 * State for tracking optimistic updates
 */
interface OptimisticState {
  /** The organization we are optimistically switching to */
  pendingOrg: Organization | null;
  /** The previous organization for rollback */
  previousOrg: Organization | null;
  /** Whether we are in the middle of a switch */
  isSwitching: boolean;
}

/**
 * Return type for the useOptimisticOrganization hook
 */
export interface UseOptimisticOrganizationReturn {
  /** Current organization (may be optimistic) */
  organization: Organization | null;

  /** Whether the current value is an optimistic update (not yet confirmed) */
  isOptimistic: boolean;

  /** Whether a switch operation is in progress */
  isSwitching: boolean;

  /** Switch organization with optimistic update */
  switchOrganization: (org: Organization) => Promise<void>;

  /** Manually rollback to previous organization (usually called on error) */
  rollback: () => void;
}

/**
 * Hook for optimistic organization switching
 *
 * Provides instant UI updates when switching organizations, with automatic
 * rollback on error. The hook combines the server state from Better Auth
 * with local optimistic state.
 */
export function useOptimisticOrganization(): UseOptimisticOrganizationReturn {
  // Use React Query hooks instead of Zustand store
  const { data: activeOrgData, isPending } = useActiveOrganization();
  const { invalidateAll } = useAuthActions();

  // Convert full org data to Organization type for compatibility
  const activeOrganization: Organization | null = activeOrgData
    ? {
        id: activeOrgData.id,
        name: activeOrgData.name,
        slug: activeOrgData.slug ?? null,
        logo: activeOrgData.logo ?? null,
        createdAt: new Date(activeOrgData.createdAt),
        metadata: activeOrgData.metadata ?? null,
      }
    : null;

  // Local optimistic state
  const [optimisticState, setOptimisticState] = useState<OptimisticState>({
    pendingOrg: null,
    previousOrg: null,
    isSwitching: false,
  });

  // Ref to prevent duplicate switches
  const switchInProgressRef = useRef(false);

  /**
   * Rollback to the previous organization state
   */
  const rollback = useCallback(() => {
    setOptimisticState({
      pendingOrg: null,
      previousOrg: null,
      isSwitching: false,
    });
  }, []);

  /**
   * Switch organization with optimistic update
   */
  const switchOrganization = useCallback(
    async (org: Organization): Promise<void> => {
      // Prevent duplicate switches
      if (switchInProgressRef.current) {
        return;
      }

      // Do not switch if already on this org
      if (activeOrganization?.id === org.id && !optimisticState.pendingOrg) {
        return;
      }

      switchInProgressRef.current = true;

      // Capture previous state for rollback
      const previousOrg = activeOrganization ?? null;

      // Immediately update to optimistic state
      setOptimisticState({
        pendingOrg: org,
        previousOrg,
        isSwitching: true,
      });

      try {
        // Make the actual API call
        const { error } = await organization.setActive({
          organizationId: org.id,
        });

        if (error) {
          // Rollback on error
          setOptimisticState({
            pendingOrg: null,
            previousOrg: null,
            isSwitching: false,
          });
          toast.error(error.message || "Failed to switch workspace");
          return;
        }

        // Success - trigger React Query refetch to get new membership/permissions
        await invalidateAll();

        // Clear optimistic state (server state will take over after refetch)
        setOptimisticState({
          pendingOrg: null,
          previousOrg: null,
          isSwitching: false,
        });

        toast.success(`Switched to ${org.name}`);
      } catch (err) {
        // Rollback on exception
        setOptimisticState({
          pendingOrg: null,
          previousOrg: null,
          isSwitching: false,
        });
        console.error("Organization switch error:", err);
        toast.error("Failed to switch workspace");
      } finally {
        switchInProgressRef.current = false;
      }
    },
    [activeOrganization, optimisticState.pendingOrg, invalidateAll],
  );

  // Determine the current organization to display
  // Prefer optimistic state if we are in a switching operation
  const currentOrganization =
    optimisticState.pendingOrg ?? activeOrganization ?? null;

  // We are optimistic if we have a pending org that differs from server state
  const isOptimistic =
    optimisticState.pendingOrg !== null &&
    optimisticState.pendingOrg.id !== activeOrganization?.id;

  return {
    organization: currentOrganization,
    isOptimistic,
    isSwitching: optimisticState.isSwitching || isPending,
    switchOrganization,
    rollback,
  };
}

"use client";

/**
 * Optimistic Organization Hook
 *
 * Provides optimistic UI updates for organization switching, allowing
 * instant visual feedback while the API call completes in the background.
 *
 * State Transitions:
 * IDLE → SWITCHING → CONFIRMED (success)
 *              ↓
 *           ERROR → IDLE (rollback)
 */

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { organization } from "@/lib/auth-client";
import type { Organization } from "@/lib/auth-types";
import { selectCurrentTenant, selectStatus, useGlobalStore } from "@/stores";

/**
 * State for tracking optimistic updates
 */
interface OptimisticState {
  /** The organization we're optimistically switching to */
  pendingOrg: Organization | null;
  /** The previous organization for rollback */
  previousOrg: Organization | null;
  /** Whether we're in the middle of a switch */
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
 *
 * @example
 * ```tsx
 * function WorkspaceSwitcher() {
 *   const { organization, isOptimistic, switchOrganization } = useOptimisticOrganization();
 *
 *   const handleSwitch = async (org: Organization) => {
 *     await switchOrganization(org);
 *     // UI already updated optimistically
 *   };
 *
 *   return (
 *     <div className={isOptimistic ? "opacity-75" : ""}>
 *       {organization?.name}
 *     </div>
 *   );
 * }
 * ```
 */
export function useOptimisticOrganization(): UseOptimisticOrganizationReturn {
  // Use Zustand store instead of Better Auth hook
  const currentTenant = useGlobalStore(selectCurrentTenant);
  const status = useGlobalStore(selectStatus);
  const isPending = status === "loading" || status === "idle";

  // Convert Tenant to Organization for compatibility
  const activeOrganization: Organization | null = currentTenant
    ? {
        id: currentTenant.id,
        name: currentTenant.name,
        slug: currentTenant.slug,
        logo: currentTenant.logo ?? null,
        createdAt: new Date(), // Placeholder
        metadata: null,
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

      // Don't switch if already on this org
      if (activeOrganization?.id === org.id && !optimisticState.pendingOrg) {
        return;
      }

      switchInProgressRef.current = true;

      // Get store's requestRefetch action for triggering data refresh
      const { requestRefetch } = useGlobalStore.getState();

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

        // Success - trigger store refetch to get new membership/permissions
        requestRefetch();

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
    [activeOrganization, optimisticState.pendingOrg],
  ); // Determine the current organization to display
  // Prefer optimistic state if we're in a switching operation
  const currentOrganization =
    optimisticState.pendingOrg ?? activeOrganization ?? null;

  // We're optimistic if we have a pending org that differs from server state
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

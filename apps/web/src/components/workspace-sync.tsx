"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  organization,
  useActiveOrganization,
  useListOrganizations,
} from "@/lib/auth-client";

/**
 * Syncs the active organization based on the current workspace URL.
 * Handles all navigation scenarios: team switcher, join, create org, direct URL, browser controls.
 */
export function WorkspaceSync() {
  const params = useParams();
  const workspace = params.workspace as string;
  const { data: organizations, isPending: orgsLoading } =
    useListOrganizations();
  const { data: activeOrganization, isPending: activeLoading } =
    useActiveOrganization();

  const isSettingActive = useRef(false);
  const lastWorkspace = useRef<string | null>(null);
  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    // Wait for data to load
    if (orgsLoading || activeLoading || !organizations || !workspace) return;

    const org = organizations.find((o) => o.slug === workspace);

    // If workspace org doesn't exist, do nothing (proxy should handle this)
    if (!org) return;

    // Check if we need to sync
    const needsSync = !activeOrganization || activeOrganization.id !== org.id;
    const workspaceChanged = lastWorkspace.current !== workspace;

    // Only sync if needed and not already in progress
    if (needsSync && workspaceChanged && !isSettingActive.current) {
      isSettingActive.current = true;
      lastWorkspace.current = workspace;

      // Show loading toast with spinner
      toastIdRef.current = toast.loading("Switching workspace...");

      organization
        .setActive({ organizationId: org.id })
        .then(({ error }) => {
          if (error) {
            toast.error(error.message || "Failed to set active organization", {
              id: toastIdRef.current ?? undefined,
            });
          } else {
            toast.success(`Switched to ${org.name}`, {
              id: toastIdRef.current ?? undefined,
            });
          }
        })
        .catch((err) => {
          console.error("WorkspaceSync error:", err);
          toast.error("Failed to sync workspace", {
            id: toastIdRef.current ?? undefined,
          });
        })
        .finally(() => {
          isSettingActive.current = false;
          toastIdRef.current = null;
        });
    }
  }, [
    workspace,
    organizations,
    activeOrganization,
    orgsLoading,
    activeLoading,
  ]);

  return null;
}

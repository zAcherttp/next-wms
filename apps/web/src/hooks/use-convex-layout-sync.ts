/**
 * useConvexSync - Bridge Convex real-time queries to Zustand store
 * Handles initial load, live updates, and optimistic mutations
 */

import type { Id } from "@wms/backend/convex/_generated/dataModel";
import { useCallback, useEffect, useRef } from "react";
import type { StorageZone } from "@/lib/types";
import { useLayoutStore } from "@/store/layout-editor-store";
import type { StorageEntity } from "../store/slices/entitiesSlice";

// ============================================================================
// Types
// ============================================================================

/**
 * Convex entity document (as returned from queries)
 * This matches the storage_zones table structure
 */

interface UseConvexLayoutSyncOptions {
  /** Called when an entity is created locally */
  onMutateCreate?: (entity: StorageEntity) => Promise<string>;
  /** Called when an entity is updated locally */
  onMutateUpdate?: (
    id: Id<"storage_zones">,
    updates: Record<string, unknown>,
  ) => Promise<void>;
  /** Called when an entity is deleted locally */
  onMutateDelete?: (id: Id<"storage_zones">) => Promise<void>;
}

interface UseConvexLayoutSyncReturn {
  /** Whether initial load is in progress */
  isLoading: boolean;
  /** Whether connected to Convex */
  isConnected: boolean;
  /** Sync an entity to Convex (optimistic) */
  syncEntity: (id: Id<"storage_zones">) => Promise<void>;
  /** Force reload from Convex */
  reload: () => void;
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform Convex document to StorageEntity
 */
function convexToEntity(doc: StorageZone): StorageEntity {
  return {
    id: doc._id,
    parentId: doc.parentId ?? null,
    branchId: doc.branchId,
    name: doc.name,
    path: doc.path,
    storageBlockType: doc.storageBlockType as StorageEntity["storageBlockType"],
    zoneAttributes: doc.zoneAttributes as Record<string, unknown>,
    isDeleted: doc.isDeleted,
    deletedAt: doc.deletedAt,
  };
}

/**
 * Transform StorageEntity to Convex mutation args
 */
function entityToConvex(
  entity: StorageEntity,
): Omit<StorageZone, "_id" | "_creationTime"> {
  return {
    name: entity.name,
    branchId: entity.branchId,
    parentId: entity.parentId ?? undefined,
    path: entity.path,
    storageBlockType: entity.storageBlockType,
    zoneAttributes: entity.zoneAttributes,
    isDeleted: entity.isDeleted,
    deletedAt: entity.deletedAt,
  };
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to sync Zustand store with Convex real-time database
 *
 * @param branchId - The branch to load entities for
 * @param convexData - Data from Convex useQuery (externally managed)
 * @param options - Mutation callbacks
 *
 * @example
 * ```tsx
 * function EditorWithConvex({ branchId }) {
 *   const data = useQuery(api.storage.getByBranch, { branchId });
 *   const { isLoading, syncEntity } = useConvexLayoutSync(branchId, data, {
 *     onMutateCreate: (entity) => createZone({ ...entityToConvex(entity) }),
 *     onMutateUpdate: (id, updates) => updateZone({ id, updates }),
 *     onMutateDelete: (id) => deleteZone({ id }),
 *   });
 *   // ...
 * }
 * ```
 */
export function useConvexLayoutSync(
  branchId: string | null,
  convexData: StorageZone[] | undefined,
  options: UseConvexLayoutSyncOptions = {},
): UseConvexLayoutSyncReturn {
  const { onMutateCreate, onMutateUpdate, onMutateDelete } = options;

  // Store actions
  const loadEntities = useLayoutStore((s) => s.loadEntities);
  const getEntity = useLayoutStore((s) => s.getEntity);
  const connect = useLayoutStore((s) => s.connect);
  const disconnect = useLayoutStore((s) => s.disconnect);
  const markSynced = useLayoutStore((s) => s.markSynced);
  const isConnected = useLayoutStore((s) => s.isConnected);
  const addPendingMutation = useLayoutStore((s) => s.addPendingMutation);
  const removePendingMutation = useLayoutStore((s) => s.removePendingMutation);
  const addSyncError = useLayoutStore((s) => s.addSyncError);

  // Track if initial load happened
  const hasLoadedRef = useRef(false);
  const isLoading = convexData === undefined;

  // Connect/disconnect on mount/unmount
  useEffect(() => {
    if (branchId) {
      connect(branchId);
    }
    return () => {
      disconnect();
      hasLoadedRef.current = false;
    };
  }, [branchId, connect, disconnect]);

  // Sync Convex data to store when it changes
  useEffect(() => {
    if (!convexData || !branchId) return;

    // Transform and load entities
    const entities = convexData.map(convexToEntity);
    loadEntities(entities);
    markSynced();
    hasLoadedRef.current = true;
  }, [convexData, branchId, loadEntities, markSynced]);

  // Sync a single entity to Convex
  const syncEntity = useCallback(
    async (id: Id<"storage_zones">) => {
      const entity = getEntity(id);
      if (!entity) {
        console.warn(`syncEntity: entity ${id} not found`);
        return;
      }

      const mutationId = crypto.randomUUID();

      try {
        // Add pending mutation for UI feedback
        addPendingMutation({
          id: mutationId,
          entityId: id,
          type: entity.isDeleted ? "delete" : "update",
          previousValue: entity.zoneAttributes,
        });

        if (entity.isDeleted) {
          // Delete mutation
          if (onMutateDelete) {
            await onMutateDelete(id);
          }
        } else if (!hasLoadedRef.current) {
          // Create mutation (new entity)
          if (onMutateCreate) {
            await onMutateCreate(entity);
          }
        } else {
          // Update mutation
          if (onMutateUpdate) {
            await onMutateUpdate(id, entity.zoneAttributes);
          }
        }

        removePendingMutation(mutationId);
      } catch (error) {
        addSyncError(`Failed to sync entity ${id}: ${String(error)}`);
        removePendingMutation(mutationId);
        throw error;
      }
    },
    [
      getEntity,
      onMutateCreate,
      onMutateUpdate,
      onMutateDelete,
      addPendingMutation,
      removePendingMutation,
      addSyncError,
    ],
  );

  // Force reload
  const reload = useCallback(() => {
    hasLoadedRef.current = false;
    // The Convex query will refetch automatically
  }, []);

  return {
    isLoading,
    isConnected,
    syncEntity,
    reload,
  };
}

// ============================================================================
// Export transform functions for use in components
// ============================================================================

export { convexToEntity, entityToConvex };

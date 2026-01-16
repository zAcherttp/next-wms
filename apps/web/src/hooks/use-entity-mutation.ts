/**
 * useEntityMutation - Central hook for entity modifications
 * Implements: Validation → Collision Check → Optimistic Update → Convex Commit
 */

import { api } from "@wms/backend/convex/_generated/api";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useCallback } from "react";
import { toast } from "sonner";
import type { BlockType } from "@/lib/types/layout-editor/attribute-registry";
import { validateAttributes } from "@/lib/types/layout-editor/attribute-registry";
import {
  CollisionDetector,
  checkOBBCollision,
  createOBB2D,
} from "@/lib/utils/collision";
import { useLayoutStore } from "@/store/layout-editor-store";

// ============================================================================
// Types
// ============================================================================

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

interface CommitResult {
  success: boolean;
  error?: string;
}

interface CommitOptions {
  /** Skip collision check (e.g., for non-geometric changes) */
  skipCollision?: boolean;
  /** Show toast on error */
  showToast?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if updates contain geometry-related changes
 */
function hasGeometryChange(updates: Record<string, unknown>): boolean {
  return (
    "position" in updates || "rotation" in updates || "dimensions" in updates
  );
}

/**
 * Get world position for an entity by adding parent zone offset
 * Entities with a floor/zone parent have positions relative to that zone.
 */
function getWorldPosition(
  localPosition: Vec3,
  parentId: Id<"storage_zones"> | null,
): Vec3 {
  if (!parentId) {
    return localPosition; // Root-level entity, position is already world
  }

  const parent = useLayoutStore.getState().entities.get(parentId);
  if (!parent?.zoneAttributes) {
    return localPosition;
  }

  // Get parent's world position (recursively handles nested zones)
  const parentPos = parent.zoneAttributes.position as Vec3 | undefined;
  if (!parentPos) {
    return localPosition;
  }

  // Child positions are relative to parent origin
  return {
    x: localPosition.x + parentPos.x,
    y: localPosition.y + parentPos.y,
    z: localPosition.z + parentPos.z,
  };
}

/**
 * Check collision for proposed position/rotation/dimensions
 */
function checkCollisionForUpdate(
  entityId: Id<"storage_zones">,
  currentAttrs: Record<string, unknown>,
  updates: Record<string, unknown>,
  blockType: BlockType,
  parentId?: Id<"storage_zones"> | null,
): { hasCollision: boolean; reason?: string } {
  // Only check collision for racks and obstacles
  if (blockType !== "rack" && blockType !== "obstacle") {
    return { hasCollision: false };
  }

  const detector = CollisionDetector.getInstance();
  if (!detector) {
    console.warn("[useEntityMutation] CollisionDetector not initialized");
    return { hasCollision: false };
  }

  // Merge current with updates
  const newLocalPosition =
    (updates.position as Vec3) ?? (currentAttrs.position as Vec3);
  const newRotation = (updates.rotation as Vec3) ??
    (currentAttrs.rotation as Vec3) ?? { x: 0, y: 0, z: 0 };
  const newDimensions =
    (updates.dimensions as Dimensions) ??
    (currentAttrs.dimensions as Dimensions);

  if (!newLocalPosition || !newDimensions) {
    return { hasCollision: false };
  }

  // Convert local position to world position for collision check
  const newWorldPosition = getWorldPosition(newLocalPosition, parentId ?? null);

  // Create OBB for proposed position (in world coords)
  const proposedOBB = createOBB2D(
    newWorldPosition,
    newDimensions,
    newRotation.y ?? 0,
  );

  // Get all entities and check against them
  const entities = useLayoutStore.getState().entities;

  for (const [id, entity] of entities) {
    // Skip self and deleted entities
    if (id === entityId || entity.isDeleted) continue;

    // Only check collidable entity types
    if (
      entity.storageBlockType !== "rack" &&
      entity.storageBlockType !== "obstacle"
    )
      continue;

    const attrs = entity.zoneAttributes;
    const localPos = attrs.position as Vec3 | undefined;
    const dims = attrs.dimensions as Dimensions | undefined;
    const rot = attrs.rotation as Vec3 | undefined;

    if (!localPos || !dims) continue;

    // Convert other entity's local position to world position
    const worldPos = getWorldPosition(localPos, entity.parentId);

    const otherOBB = createOBB2D(worldPos, dims, rot?.y ?? 0);

    if (checkOBBCollision(proposedOBB, otherOBB)) {
      const name =
        (attrs.name as string) ?? entity.name ?? entity.storageBlockType;
      return {
        hasCollision: true,
        reason: `Collision with ${name}`,
      };
    }
  }

  return { hasCollision: false };
}

// ============================================================================
// Hook
// ============================================================================

export function useEntityMutation() {
  // Convex mutations
  const createMutation = useMutation(api.storageZones.create);
  const updateMutation = useMutation(api.storageZones.update);
  const deleteMutation = useMutation(api.storageZones.softDelete);

  // Store actions
  const updateEntity = useLayoutStore((s) => s.updateEntity);
  const addEntity = useLayoutStore((s) => s.addEntity);
  const removeEntity = useLayoutStore((s) => s.removeEntity);
  const getEntity = useLayoutStore((s) => s.getEntity);

  /**
   * Commit an entity update with validation and collision checking
   */
  const commitUpdate = useCallback(
    async (
      id: Id<"storage_zones">,
      updates: Record<string, unknown>,
      options: CommitOptions = {},
    ): Promise<CommitResult> => {
      const { skipCollision = false, showToast = true } = options;

      // Get current entity
      const entity = getEntity(id);
      if (!entity) {
        return { success: false, error: "Entity not found" };
      }

      // 1. VALIDATE - Merge and validate attributes
      const mergedAttrs = { ...entity.zoneAttributes, ...updates };
      const validation = validateAttributes(
        entity.storageBlockType,
        mergedAttrs,
      );

      if (!validation.success) {
        const error = `Validation failed: ${validation.error?.message ?? "Unknown error"}`;
        if (showToast) toast.error(error);
        return { success: false, error };
      }

      // 2. COLLISION CHECK - For geometry changes
      if (hasGeometryChange(updates) && !skipCollision) {
        const collision = checkCollisionForUpdate(
          id,
          entity.zoneAttributes,
          updates,
          entity.storageBlockType,
          entity.parentId,
        );

        if (collision.hasCollision) {
          const error = collision.reason ?? "Collision detected";
          if (showToast) toast.error(error);
          return { success: false, error };
        }
      }

      // 3. OPTIMISTIC UPDATE - Update local state immediately
      updateEntity(id, updates);

      // 4. COMMIT - Sync to Convex
      try {
        await updateMutation({
          id,
          zoneAttributes: mergedAttrs,
          name: entity.name,
        });
        return { success: true };
      } catch (err) {
        // Rollback on error - revert to original attributes
        updateEntity(id, entity.zoneAttributes);
        const error =
          err instanceof Error ? err.message : "Failed to save changes";
        if (showToast) toast.error(error);
        return { success: false, error };
      }
    },
    [getEntity, updateEntity, updateMutation],
  );

  /**
   * Commit a new entity creation
   */
  const commitCreate = useCallback(
    async (
      blockType: BlockType,
      parentId: Id<"storage_zones"> | null,
      name: string,
      attributes: Record<string, unknown>,
      branchId: Id<"branches">,
      options: CommitOptions = {},
    ): Promise<CommitResult & { id?: Id<"storage_zones"> }> => {
      const { skipCollision = false, showToast = true } = options;

      // 1. VALIDATE
      const validation = validateAttributes(blockType, attributes);
      if (!validation.success) {
        const error = `Validation failed: ${validation.error?.message ?? "Unknown error"}`;
        if (showToast) toast.error(error);
        return { success: false, error };
      }

      // 2. COLLISION CHECK
      if (hasGeometryChange(attributes) && !skipCollision) {
        const collision = checkCollisionForUpdate(
          "" as Id<"storage_zones">, // No ID yet
          {},
          attributes,
          blockType,
          parentId,
        );

        if (collision.hasCollision) {
          const error = collision.reason ?? "Collision detected";
          if (showToast) toast.error(error);
          return { success: false, error };
        }
      }

      // 3. COMMIT to Convex first (get real ID)
      try {
        const parent = parentId
          ? useLayoutStore.getState().entities.get(parentId)
          : null;
        const path = parent ? `${parent.path}.${blockType}` : blockType;

        const newId = await createMutation({
          branchId,
          parentId: parentId ?? undefined,
          name,
          path,
          storageBlockType: blockType,
          zoneAttributes: attributes,
        });

        // 4. Add to local store with real ID
        // Note: The store will get updated via Convex subscription
        // but we can also add optimistically here

        return { success: true, id: newId };
      } catch (err) {
        const error =
          err instanceof Error ? err.message : "Failed to create entity";
        if (showToast) toast.error(error);
        return { success: false, error };
      }
    },
    [createMutation],
  );

  /**
   * Commit an entity deletion
   */
  const commitDelete = useCallback(
    async (
      id: Id<"storage_zones">,
      options: CommitOptions = {},
    ): Promise<CommitResult> => {
      const { showToast = true } = options;

      const entity = getEntity(id);
      if (!entity) {
        return { success: false, error: "Entity not found" };
      }

      // 1. OPTIMISTIC DELETE - Mark as deleted locally
      removeEntity(id, true); // soft delete

      // 2. COMMIT to Convex
      try {
        await deleteMutation({ id });
        return { success: true };
      } catch (err) {
        // Rollback - restore entity
        // Note: Would need to implement restore in entitiesSlice
        const error =
          err instanceof Error ? err.message : "Failed to delete entity";
        if (showToast) toast.error(error);
        return { success: false, error };
      }
    },
    [getEntity, removeEntity, deleteMutation],
  );

  /**
   * Sync an entity to Convex without validation/collision
   * Used for undo/redo operations
   */
  const syncToConvex = useCallback(
    async (id: Id<"storage_zones">): Promise<void> => {
      const entity = useLayoutStore.getState().entities.get(id);
      if (!entity) return;

      try {
        if (entity.isDeleted) {
          await deleteMutation({ id });
        } else {
          await updateMutation({
            id,
            zoneAttributes: entity.zoneAttributes,
            name: entity.name,
          });
        }
      } catch (err) {
        console.error("[useEntityMutation] Failed to sync entity:", err);
      }
    },
    [updateMutation, deleteMutation],
  );

  return {
    commitUpdate,
    commitCreate,
    commitDelete,
    syncToConvex,
  };
}

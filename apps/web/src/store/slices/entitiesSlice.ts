/**
 * Entities Slice - Normalized entity maps with CRUD operations
 * Part of the SmartStore state management system
 */

import type { StateCreator } from "zustand";
import type { BlockType } from "@/lib/types/layout-editor/attribute-registry";
import {
  getDefaultAttributes,
  validateAttributes,
} from "@/lib/types/layout-editor/attribute-registry";
import { getCollisionDetector } from "@/lib/utils/collision";

// ============================================================================
// Types
// ============================================================================

export interface StorageEntity {
  id: string;
  parentId: string | null;
  branchId: string;
  path: string;
  blockType: BlockType;
  attributes: Record<string, unknown>;
  isDeleted: boolean;
  deletedAt?: number;
}

export interface EntitiesState {
  // Normalized entity map - single source of truth
  entities: Map<string, StorageEntity>;

  // Indices for fast lookups
  entitiesByType: Map<BlockType, Set<string>>;
  entitiesByParent: Map<string, Set<string>>;
  entitiesByPath: Map<string, Set<string>>;

  // Dirty tracking for sync
  isDirty: boolean;
  pendingChanges: Set<string>;
}

export interface EntitiesActions {
  // CRUD operations
  addEntity: (
    blockType: BlockType,
    parentId: string | null,
    attributes?: Partial<Record<string, unknown>>,
  ) => string;
  updateEntity: (id: string, updates: Partial<Record<string, unknown>>) => void;
  removeEntity: (id: string, soft?: boolean) => void;

  // Batch operations
  addEntityBatch: (entities: Omit<StorageEntity, "id">[]) => string[];

  // Queries
  getEntity: (id: string) => StorageEntity | undefined;
  getEntitiesByType: (blockType: BlockType) => StorageEntity[];
  getEntitiesByParent: (parentId: string) => StorageEntity[];
  getEntitiesByPath: (path: string) => StorageEntity[];
  getChildren: (parentId: string, blockType?: BlockType) => StorageEntity[];

  // Sync helpers
  markClean: () => void;
  setDirty: (dirty: boolean) => void;

  // State management
  loadEntities: (entities: StorageEntity[]) => void;
  clearEntities: () => void;
}

export type EntitiesSlice = EntitiesState & EntitiesActions;

// ============================================================================
// Path Helpers
// ============================================================================

function getPathForBlockType(
  parentPath: string | null,
  blockType: BlockType,
): string {
  if (!parentPath) return blockType;
  return `${parentPath}.${blockType}`;
}

function getParentPath(path: string): string | null {
  const lastDot = path.lastIndexOf(".");
  return lastDot === -1 ? null : path.substring(0, lastDot);
}

// ============================================================================
// Slice Creator
// ============================================================================

export const createEntitiesSlice: StateCreator<
  EntitiesSlice,
  [["zustand/immer", never]],
  [],
  EntitiesSlice
> = (set, get) => ({
  // Initial state
  entities: new Map(),
  entitiesByType: new Map(),
  entitiesByParent: new Map(),
  entitiesByPath: new Map(),
  isDirty: false,
  pendingChanges: new Set(),

  // ========================================================================
  // CRUD Operations
  // ========================================================================

  addEntity: (blockType, parentId, attributes = {}) => {
    const id = crypto.randomUUID();
    const parent = parentId ? get().entities.get(parentId) : undefined;
    const parentPath = parent?.path ?? null;
    const path = getPathForBlockType(parentPath, blockType);
    const branchId = parent?.branchId ?? "";

    // Merge with defaults and validate
    const defaultAttrs = getDefaultAttributes(blockType);
    const mergedAttrs = { ...defaultAttrs, ...attributes };
    const validation = validateAttributes(blockType, mergedAttrs);

    if (!validation.success) {
      console.error(`Invalid attributes for ${blockType}:`, validation.error);
    }

    const entity: StorageEntity = {
      id,
      parentId,
      branchId,
      path,
      blockType,
      attributes: mergedAttrs,
      isDeleted: false,
    };

    set((state) => {
      // Add to main map
      state.entities.set(id, entity);

      // Update type index
      if (!state.entitiesByType.has(blockType)) {
        state.entitiesByType.set(blockType, new Set());
      }
      state.entitiesByType.get(blockType)?.add(id);

      // Update parent index
      if (parentId) {
        if (!state.entitiesByParent.has(parentId)) {
          state.entitiesByParent.set(parentId, new Set());
        }
        state.entitiesByParent.get(parentId)?.add(id);
      }

      // Update path index
      if (!state.entitiesByPath.has(path)) {
        state.entitiesByPath.set(path, new Set());
      }
      state.entitiesByPath.get(path)?.add(id);

      state.isDirty = true;
      state.pendingChanges.add(id);
    });

    // Update collision detection for collidable entities
    if (blockType === "rack" || blockType === "obstacle") {
      const detector = getCollisionDetector();
      const newEntity = get().entities.get(id);
      if (detector && newEntity) {
        const collidable = {
          id,
          position: mergedAttrs.position as { x: number; y: number; z: number },
          rotation: mergedAttrs.rotation as { x: number; y: number; z: number },
          dimensions: mergedAttrs.dimensions as {
            width: number;
            height: number;
            depth: number;
          },
        };
        detector.addEntity(collidable, blockType);
      }
    }

    return id;
  },

  updateEntity: (id, updates) => {
    const entity = get().entities.get(id);
    if (!entity) return;

    // Validate merged attributes
    const mergedAttrs = { ...entity.attributes, ...updates };
    const validation = validateAttributes(entity.blockType, mergedAttrs);
    if (!validation.success) {
      console.error(
        `Invalid update for ${entity.blockType}:`,
        validation.error,
      );
    }

    set((state) => {
      const e = state.entities.get(id);
      if (e) {
        e.attributes = { ...e.attributes, ...updates };
        state.isDirty = true;
        state.pendingChanges.add(id);
      }
    });

    // Update collision for position/dimension changes
    if (entity.blockType === "rack" || entity.blockType === "obstacle") {
      const posOrDimChanged =
        "position" in updates ||
        "dimensions" in updates ||
        "rotation" in updates;
      if (posOrDimChanged) {
        const detector = getCollisionDetector();
        const updated = get().entities.get(id);
        if (detector && updated) {
          const attrs = updated.attributes;
          const collidable = {
            id,
            position: attrs.position as { x: number; y: number; z: number },
            rotation: attrs.rotation as { x: number; y: number; z: number },
            dimensions: attrs.dimensions as {
              width: number;
              height: number;
              depth: number;
            },
          };
          detector.updateEntity(
            collidable,
            entity.blockType as "rack" | "obstacle",
          );
        }
      }
    }
  },

  removeEntity: (id, soft = true) => {
    const entity = get().entities.get(id);
    if (!entity) return;

    // Remove from collision detection
    if (entity.blockType === "rack" || entity.blockType === "obstacle") {
      const detector = getCollisionDetector();
      detector?.removeEntity(id);
    }

    set((state) => {
      if (soft) {
        const e = state.entities.get(id);
        if (e) {
          e.isDeleted = true;
          e.deletedAt = Date.now();
        }
      } else {
        state.entities.delete(id);

        // Remove from indices
        state.entitiesByType.get(entity.blockType)?.delete(id);
        if (entity.parentId) {
          state.entitiesByParent.get(entity.parentId)?.delete(id);
        }
        state.entitiesByPath.get(entity.path)?.delete(id);
      }

      state.isDirty = true;
      state.pendingChanges.add(id);
    });

    // Recursively soft-delete children
    const children = get().getEntitiesByParent(id);
    children.forEach((child) => {
      get().removeEntity(child.id, soft);
    });
  },

  addEntityBatch: (entities) => {
    const ids: string[] = [];
    entities.forEach((e) => {
      const id = get().addEntity(e.blockType, e.parentId, e.attributes);
      ids.push(id);
    });
    return ids;
  },

  // ========================================================================
  // Queries
  // ========================================================================

  getEntity: (id) => get().entities.get(id),

  getEntitiesByType: (blockType) => {
    const ids = get().entitiesByType.get(blockType);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => get().entities.get(id))
      .filter((e): e is StorageEntity => e !== undefined && !e.isDeleted);
  },

  getEntitiesByParent: (parentId) => {
    const ids = get().entitiesByParent.get(parentId);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => get().entities.get(id))
      .filter((e): e is StorageEntity => e !== undefined && !e.isDeleted);
  },

  getEntitiesByPath: (path) => {
    const ids = get().entitiesByPath.get(path);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => get().entities.get(id))
      .filter((e): e is StorageEntity => e !== undefined && !e.isDeleted);
  },

  getChildren: (parentId, blockType) => {
    const children = get().getEntitiesByParent(parentId);
    if (!blockType) return children;
    return children.filter((c) => c.blockType === blockType);
  },

  // ========================================================================
  // Sync Helpers
  // ========================================================================

  markClean: () => {
    set((state) => {
      state.isDirty = false;
      state.pendingChanges.clear();
    });
  },

  setDirty: (dirty) => {
    set((state) => {
      state.isDirty = dirty;
    });
  },

  // ========================================================================
  // State Management
  // ========================================================================

  loadEntities: (entities) => {
    set((state) => {
      // Clear existing
      state.entities.clear();
      state.entitiesByType.clear();
      state.entitiesByParent.clear();
      state.entitiesByPath.clear();

      // Load new entities
      entities.forEach((entity) => {
        state.entities.set(entity.id, entity);

        // Type index
        if (!state.entitiesByType.has(entity.blockType)) {
          state.entitiesByType.set(entity.blockType, new Set());
        }
        state.entitiesByType.get(entity.blockType)?.add(entity.id);

        // Parent index
        if (entity.parentId) {
          if (!state.entitiesByParent.has(entity.parentId)) {
            state.entitiesByParent.set(entity.parentId, new Set());
          }
          state.entitiesByParent.get(entity.parentId)?.add(entity.id);
        }

        // Path index
        if (!state.entitiesByPath.has(entity.path)) {
          state.entitiesByPath.set(entity.path, new Set());
        }
        state.entitiesByPath.get(entity.path)?.add(entity.id);
      });

      state.isDirty = false;
      state.pendingChanges.clear();
    });
  },

  clearEntities: () => {
    set((state) => {
      state.entities.clear();
      state.entitiesByType.clear();
      state.entitiesByParent.clear();
      state.entitiesByPath.clear();
      state.isDirty = false;
      state.pendingChanges.clear();
    });
  },
});

/**
 * Store Selectors
 * Memoized selectors for efficient state access
 */

import type { BlockType } from "@/lib/types/layout-editor/attribute-registry";
import type { LayoutStoreState } from "./layout-editor-store";

// ============================================================================
// Entity Selectors
// ============================================================================

/** Get all entities (excluding deleted) */
export const selectAllEntities = (state: LayoutStoreState) =>
  Array.from(state.entities.values()).filter((e) => !e.isDeleted);

/** Get entity by ID */
export const selectEntityById = (id: string) => (state: LayoutStoreState) =>
  state.entities.get(id);

/** Get entities by block type */
export const selectEntitiesByType =
  (blockType: BlockType) => (state: LayoutStoreState) =>
    state.getEntitiesByType(blockType);

/** Get entities by path */
export const selectEntitiesByPath =
  (path: string) => (state: LayoutStoreState) =>
    state.getEntitiesByPath(path);

/** Get child entities */
export const selectChildren =
  (parentId: string, blockType?: BlockType) => (state: LayoutStoreState) =>
    state.getChildren(parentId, blockType);

// ============================================================================
// Rack Selectors (Backward Compatibility)
// ============================================================================

/** Get all racks */
export const selectAllRacks = (state: LayoutStoreState) =>
  state.getEntitiesByType("rack");

/** Get rack by ID */
export const selectRackById = (rackId: string) => (state: LayoutStoreState) =>
  state.entities.get(rackId);

/** Get racks by parent floor */
export const selectRacksByFloor =
  (floorId: string) => (state: LayoutStoreState) =>
    state.getChildren(floorId, "rack");

/** Count of locked racks */
export const selectLockedRackCount = (state: LayoutStoreState) => {
  const racks = state.getEntitiesByType("rack");
  return racks.filter((r) => r.attributes.isLocked === true).length;
};

/** Count of inaccessible racks */
export const selectInaccessibleRackCount = (state: LayoutStoreState) => {
  const racks = state.getEntitiesByType("rack");
  return racks.filter((r) => r.attributes.isAccessible === false).length;
};

/** Total rack count */
export const selectTotalRackCount = (state: LayoutStoreState) =>
  state.getEntitiesByType("rack").length;

/** Check if rack is locked */
export const selectIsRackLocked =
  (rackId: string) => (state: LayoutStoreState) => {
    const rack = state.entities.get(rackId);
    return rack?.attributes.isLocked === true;
  };

/** Check if rack is inaccessible */
export const selectIsRackInaccessible =
  (rackId: string) => (state: LayoutStoreState) => {
    const rack = state.entities.get(rackId);
    return rack?.attributes.isAccessible === false;
  };

// ============================================================================
// Selection Selectors
// ============================================================================

/** Get selected entity */
export const selectSelectedEntity = (state: LayoutStoreState) => {
  if (!state.selectedEntityId) return null;
  return state.entities.get(state.selectedEntityId) ?? null;
};

/** Get selected entity's block type */
export const selectSelectedBlockType = (state: LayoutStoreState) => {
  const entity = selectSelectedEntity(state);
  return entity?.blockType ?? null;
};

// ============================================================================
// Sync Selectors
// ============================================================================

/** Check if there are pending changes */
export const selectHasPendingChanges = (state: LayoutStoreState) =>
  state.pendingChanges.size > 0;

/** Get sync status */
export const selectSyncStatus = (state: LayoutStoreState) => ({
  isConnected: state.isConnected,
  isSyncing: state.isSyncing,
  hasPendingChanges: state.pendingChanges.size > 0,
  lastSyncAt: state.lastSyncAt,
});

// ============================================================================
// Hierarchy Selectors
// ============================================================================

/** Get breadcrumb path for entity */
export const selectEntityBreadcrumb =
  (entityId: string) => (state: LayoutStoreState) => {
    const breadcrumb: { id: string; name: string; blockType: BlockType }[] = [];
    let current = state.entities.get(entityId);

    while (current) {
      breadcrumb.unshift({
        id: current.id,
        name: (current.attributes.name as string) || current.blockType,
        blockType: current.blockType,
      });
      current = current.parentId
        ? state.entities.get(current.parentId)
        : undefined;
    }

    return breadcrumb;
  };

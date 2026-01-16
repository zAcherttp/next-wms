// API Types for Warehouse Layout Editor
// Component ref handle and external data interfaces

import type { Id } from "@wms/backend/convex/_generated/dataModel";
import type { EditorState } from "./editor";
import type { ValidationResult } from "./validation";

// ============================================================================
// Component Ref API
// ============================================================================

export interface WarehouseEditorHandle {
  // Core camera/view operations
  validateLayout: () => ValidationResult;
  resetCamera: () => void;
  zoomToRack: (rackId: Id<"storage_zones">) => void;
  zoomToZone: (zoneId: Id<"storage_zones">) => void;

  // Entity operations (now via storage_zone table)
  addRack: (rackData: {
    position: object;
    dimensions: object;
    rotation?: object;
  }) => Id<"storage_zones"> | undefined;
  removeRack: (rackId: Id<"storage_zones">) => boolean;
  getState: () => EditorState;
  captureScreenshot: () => Promise<Blob>;

  // SmartStore API
  getEntities: () => unknown[];
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// ============================================================================
// External Data Interfaces
// ============================================================================

export interface InventoryData {
  sku: string;
  qty: number;
  unit?: string;
  reserved?: number;
}

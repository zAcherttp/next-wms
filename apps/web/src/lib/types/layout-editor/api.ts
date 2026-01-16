// API Types for Warehouse Layout Editor
// Component ref handle and external data interfaces

import type { EditorState } from "./editor";
import type { Rack } from "./entities";
import type { WarehouseLayout } from "./layout";
import type { ValidationResult } from "./validation";

// ============================================================================
// Component Ref API
// ============================================================================

export interface WarehouseEditorHandle {
  exportLayout: () => WarehouseLayout;
  validateLayout: () => ValidationResult;
  resetCamera: () => void;
  zoomToRack: (rackId: string) => void;
  zoomToZone: (zoneId: string) => void;
  addRack: (rack: Omit<Rack, "id">) => string;
  removeRack: (rackId: string) => boolean;
  getState: () => EditorState;
  captureScreenshot: () => Promise<Blob>;
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

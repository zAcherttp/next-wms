// Collision Detection Utility using Separating Axis Theorem (SAT)
// Phase 4: US2 - T036
// Unified entity-based OBB collision detection for Y-axis rotated placements
// With spatial grid partitioning for O(1) culling optimization

import type {
  CollidableEntity,
  CollisionCheckOptions,
  CollisionInfo,
  CollisionResult,
  Dimension,
  Entity,
  EntityType,
  OBB2D,
  Obstacle,
  Rack,
  SpatialGridEntry,
  Vec2,
  Vector3,
  ZoneBounds,
} from "@/lib/types/layout-editor";
import { getEntityDisplayName } from "./typeUtils";

// ============================================================================
// Debug callback for visual collision debugging
// ============================================================================

type CollisionDebugCallback = (
  obbA: OBB2D,
  obbB: OBB2D,
  heightA: number,
  heightB: number,
) => void;

let collisionDebugCallback: CollisionDebugCallback | null = null;

/**
 * Register a callback to be called when collisions are detected
 * Used by CollisionDebugOverlay to visualize collision boxes
 */
export function setCollisionDebugCallback(
  callback: CollisionDebugCallback | null,
) {
  collisionDebugCallback = callback;
}

/**
 * Trigger the debug callback if registered
 */
function triggerCollisionDebug(
  obbA: OBB2D,
  obbB: OBB2D,
  heightA: number,
  heightB: number,
) {
  if (collisionDebugCallback) {
    collisionDebugCallback(obbA, obbB, heightA, heightB);
  }
}

/**
 * Creates an OBB2D from position, dimensions, and rotation
 * Pre-computes sin/cos for optimal performance
 */
export function createOBB2D(
  position: Vector3,
  dimensions: Dimension,
  rotationY: number,
): OBB2D {
  return {
    centerX: position.x,
    centerZ: position.z,
    halfWidth: dimensions.width / 2,
    halfDepth: dimensions.depth / 2,
    cos: Math.cos(rotationY),
    sin: Math.sin(rotationY),
  };
}

/**
 * Creates an OBB2D from a CollidableEntity
 */
export function createOBBFromEntity(entity: CollidableEntity): OBB2D {
  const rotationY = entity.rotation?.y ?? 0;
  return createOBB2D(entity.position, entity.dimensions, rotationY);
}

/**
 * Gets the 4 corners of an OBB in world space (XZ plane)
 * Returns corners in order: bottom-left, bottom-right, top-right, top-left
 * (relative to local orientation)
 */
function getOBBCornersInline(obb: OBB2D): [Vec2, Vec2, Vec2, Vec2] {
  const { centerX, centerZ, halfWidth, halfDepth, cos, sin } = obb;

  // Y-axis rotation matrix (rotating around Y, affecting X and Z):
  // worldX = localX * cos + localZ * sin + centerX
  // worldZ = -localX * sin + localZ * cos + centerZ

  return [
    {
      x: -halfWidth * cos + -halfDepth * sin + centerX,
      z: -(-halfWidth) * sin + -halfDepth * cos + centerZ,
    },
    {
      x: halfWidth * cos + -halfDepth * sin + centerX,
      z: -halfWidth * sin + -halfDepth * cos + centerZ,
    },
    {
      x: halfWidth * cos + halfDepth * sin + centerX,
      z: -halfWidth * sin + halfDepth * cos + centerZ,
    },
    {
      x: -halfWidth * cos + halfDepth * sin + centerX,
      z: -(-halfWidth) * sin + halfDepth * cos + centerZ,
    },
  ];
}

/**
 * Projects corners onto an axis and returns min/max projection values
 */
function projectCornersOntoAxis(
  corners: [Vec2, Vec2, Vec2, Vec2],
  axisX: number,
  axisZ: number,
): { min: number; max: number } {
  const p0 = corners[0].x * axisX + corners[0].z * axisZ;
  const p1 = corners[1].x * axisX + corners[1].z * axisZ;
  const p2 = corners[2].x * axisX + corners[2].z * axisZ;
  const p3 = corners[3].x * axisX + corners[3].z * axisZ;

  return {
    min: Math.min(p0, p1, p2, p3),
    max: Math.max(p0, p1, p2, p3),
  };
}

/**
 * Check if two projection intervals overlap
 * Returns true if they DO NOT overlap (separating axis found)
 */
function isSeparatingAxis(
  projA: { min: number; max: number },
  projB: { min: number; max: number },
  epsilon = 0.0001,
): boolean {
  return projA.max < projB.min - epsilon || projB.max < projA.min - epsilon;
}

/**
 * Quick circle-based pre-check for OBB collision
 * Returns false if OBBs are definitely not colliding
 */
function quickCircleCheck(a: OBB2D, b: OBB2D): boolean {
  // Bounding circle radius
  const radiusA = Math.sqrt(a.halfWidth ** 2 + a.halfDepth ** 2);
  const radiusB = Math.sqrt(b.halfWidth ** 2 + b.halfDepth ** 2);

  const dx = b.centerX - a.centerX;
  const dz = b.centerZ - a.centerZ;
  const distSq = dx * dx + dz * dz;
  const radiusSum = radiusA + radiusB;

  // If circles don't overlap, OBBs can't either
  return distSq <= radiusSum * radiusSum;
}

/**
 * SAT collision detection for Y-axis rotated OBBs
 * Only tests 4 axes (2 per box) since Y-axis is shared
 * Returns true if the OBBs are colliding (overlapping)
 */
export function checkOBBCollision(a: OBB2D, b: OBB2D): boolean {
  // OPTIMIZATION 1: Quick AABB rejection test (axis-aligned bounds)
  const aabbMargin =
    Math.max(a.halfWidth, a.halfDepth) + Math.max(b.halfWidth, b.halfDepth);
  const dx = Math.abs(b.centerX - a.centerX);
  const dz = Math.abs(b.centerZ - a.centerZ);

  if (dx > aabbMargin || dz > aabbMargin) {
    return false; // Too far apart
  }

  // OPTIMIZATION 2: Circle bounding check
  if (!quickCircleCheck(a, b)) {
    return false;
  }

  // Guard against NaN values
  if (
    !Number.isFinite(a.cos) ||
    !Number.isFinite(a.sin) ||
    !Number.isFinite(b.cos) ||
    !Number.isFinite(b.sin)
  ) {
    console.warn("[COLLISION] Invalid OBB values detected, skipping check");
    return false;
  }

  const cornersA = getOBBCornersInline(a);
  const cornersB = getOBBCornersInline(b);

  // Test 4 separating axes: 2 from box A, 2 from box B

  // Axis 1: A's local X direction
  let axisX = a.cos;
  let axisZ = a.sin;
  let projA = projectCornersOntoAxis(cornersA, axisX, axisZ);
  let projB = projectCornersOntoAxis(cornersB, axisX, axisZ);
  if (isSeparatingAxis(projA, projB)) return false;

  // Axis 2: A's local Z direction
  axisX = -a.sin;
  axisZ = a.cos;
  projA = projectCornersOntoAxis(cornersA, axisX, axisZ);
  projB = projectCornersOntoAxis(cornersB, axisX, axisZ);
  if (isSeparatingAxis(projA, projB)) return false;

  // Axis 3: B's local X direction
  axisX = b.cos;
  axisZ = b.sin;
  projA = projectCornersOntoAxis(cornersA, axisX, axisZ);
  projB = projectCornersOntoAxis(cornersB, axisX, axisZ);
  if (isSeparatingAxis(projA, projB)) return false;

  // Axis 4: B's local Z direction
  axisX = -b.sin;
  axisZ = b.cos;
  projA = projectCornersOntoAxis(cornersA, axisX, axisZ);
  projB = projectCornersOntoAxis(cornersB, axisX, axisZ);
  if (isSeparatingAxis(projA, projB)) return false;

  // No separating axis found - objects are colliding
  return true;
}

/**
 * Gets the 4 corners of an OBB in world space
 * Used for bounds checking
 */
export function getOBBCorners(obb: OBB2D): Vec2[] {
  return getOBBCornersInline(obb);
}

// ============================================================================
// Unified Entity Collision System
// ============================================================================

/**
 * Checks if a rotated object is within zone bounds
 * Uses OBB corners to ensure all parts are within bounds
 */
export function isWithinBounds(
  position: Vector3,
  dimensions: Dimension,
  bounds: { x: number; z: number; width: number; length: number },
  rotationY = 0,
): boolean {
  const obb = createOBB2D(position, dimensions, rotationY);
  const corners = getOBBCorners(obb);

  for (const corner of corners) {
    if (
      corner.x < bounds.x ||
      corner.x > bounds.x + bounds.width ||
      corner.z < bounds.z ||
      corner.z > bounds.z + bounds.length
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Brute force collision check against all collidable entities
 * Used as fallback when spatial grid is not initialized
 * @internal
 */
function checkCollisionsBruteForce(
  options: CollisionCheckOptions,
  racks: Map<string, Rack>,
  obstacles: Map<string, Obstacle>,
): CollisionResult {
  const {
    position,
    dimensions,
    rotationY,
    bounds,
    excludeEntityId,
    enableDebug = true,
  } = options;

  // Validate inputs
  if (
    !Number.isFinite(position.x) ||
    !Number.isFinite(position.z) ||
    !Number.isFinite(rotationY)
  ) {
    console.warn("[COLLISION] Invalid position or rotation");
    return {
      hasCollision: true,
      collidingEntities: [],
      outOfBounds: true,
      reason: "Invalid position",
    };
  }

  // Create OBB for the entity being checked (with the NEW rotation)
  const entityOBB = createOBB2D(position, dimensions, rotationY);
  const collidingEntities: CollisionInfo[] = [];

  // Check against all racks
  for (const [rackId, rack] of racks) {
    if (excludeEntityId && rackId === excludeEntityId) continue;

    const rackRotationY = Number.isFinite(rack.rotation?.y)
      ? rack.rotation.y
      : 0;
    const rackOBB = createOBB2D(rack.position, rack.dimensions, rackRotationY);

    if (checkOBBCollision(entityOBB, rackOBB)) {
      if (enableDebug) {
        triggerCollisionDebug(
          entityOBB,
          rackOBB,
          dimensions.height,
          rack.dimensions.height,
        );
      }

      collidingEntities.push({
        entityId: rackId,
        entityType: "rack",
        displayName: getEntityDisplayName(rack),
      });
      break; // Early exit - one collision is enough
    }
  }

  // Check against all obstacles (only if no rack collision yet)
  if (collidingEntities.length === 0) {
    for (const [obstacleId, obstacle] of obstacles) {
      if (excludeEntityId && obstacleId === excludeEntityId) continue;

      const obstacleRotationY = Number.isFinite(obstacle.rotation?.y)
        ? obstacle.rotation.y
        : 0;
      const obstacleOBB = createOBB2D(
        obstacle.position,
        obstacle.dimensions,
        obstacleRotationY,
      );

      if (checkOBBCollision(entityOBB, obstacleOBB)) {
        if (enableDebug) {
          triggerCollisionDebug(
            entityOBB,
            obstacleOBB,
            dimensions.height,
            obstacle.dimensions.height,
          );
        }

        collidingEntities.push({
          entityId: obstacleId,
          entityType: "obstacle",
          displayName: getEntityDisplayName(obstacle),
        });
        break; // Early exit
      }
    }
  }

  // Check bounds
  const outOfBounds = !isWithinBounds(position, dimensions, bounds, rotationY);

  // Build reason string with informative entity names
  let reason: string | null = null;
  if (outOfBounds) {
    reason = "Out of bounds";
  } else if (collidingEntities.length > 0) {
    const entity = collidingEntities[0];
    reason = entity
      ? `Colliding with ${entity.displayName}`
      : "Collision detected";
  }

  return {
    hasCollision: collidingEntities.length > 0 || outOfBounds,
    collidingEntities,
    outOfBounds,
    reason,
  };
}

// ============================================================================
// Spatial Grid for Collision Culling Optimization
// ============================================================================

/**
 * Spatial hash grid for O(1) entity lookup
 * Divides the zone into cells and stores entity IDs in each cell they occupy
 */
export class SpatialGrid {
  private cells: Map<string, Set<string>> = new Map();
  private entityCells: Map<string, Set<string>> = new Map(); // Track which cells each entity is in
  private entities: Map<string, SpatialGridEntry> = new Map();
  private readonly cellSize: number;
  private readonly bounds: ZoneBounds;

  constructor(bounds: ZoneBounds, cellSize = 5) {
    this.bounds = bounds;
    this.cellSize = cellSize;
  }

  /**
   * Get all cell keys that an entity occupies (including rotation)
   */
  private getEntityCellKeys(
    position: Vector3,
    dimensions: Dimension,
    rotationY: number,
  ): string[] {
    const obb = createOBB2D(position, dimensions, rotationY);
    const corners = getOBBCorners(obb);

    // Find AABB of rotated entity
    const xs = corners.map((c) => c.x);
    const zs = corners.map((c) => c.z);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);

    // Get all cells the AABB overlaps
    const keys: string[] = [];
    const startCellX = Math.floor((minX - this.bounds.x) / this.cellSize);
    const endCellX = Math.floor((maxX - this.bounds.x) / this.cellSize);
    const startCellZ = Math.floor((minZ - this.bounds.z) / this.cellSize);
    const endCellZ = Math.floor((maxZ - this.bounds.z) / this.cellSize);

    for (let cx = startCellX; cx <= endCellX; cx++) {
      for (let cz = startCellZ; cz <= endCellZ; cz++) {
        keys.push(`${cx},${cz}`);
      }
    }

    return keys;
  }

  /**
   * Insert an entity into the spatial grid
   */
  insert(
    entityId: string,
    entityType: EntityType,
    position: Vector3,
    dimensions: Dimension,
    rotationY = 0,
  ): void {
    // Store entity data
    this.entities.set(entityId, {
      entityId,
      entityType,
      position,
      dimensions,
      rotationY,
    });

    // Get cells and insert
    const cellKeys = this.getEntityCellKeys(position, dimensions, rotationY);
    this.entityCells.set(entityId, new Set(cellKeys));

    for (const key of cellKeys) {
      let cell = this.cells.get(key);
      if (!cell) {
        cell = new Set();
        this.cells.set(key, cell);
      }
      cell.add(entityId);
    }
  }

  /**
   * Remove an entity from the spatial grid
   */
  remove(entityId: string): void {
    const cellKeys = this.entityCells.get(entityId);
    if (cellKeys) {
      for (const key of cellKeys) {
        this.cells.get(key)?.delete(entityId);
      }
      this.entityCells.delete(entityId);
    }
    this.entities.delete(entityId);
  }

  /**
   * Update an entity's position/dimensions in the grid
   */
  update(
    entityId: string,
    entityType: EntityType,
    position: Vector3,
    dimensions: Dimension,
    rotationY = 0,
  ): void {
    this.remove(entityId);
    this.insert(entityId, entityType, position, dimensions, rotationY);
  }

  /**
   * Get all entity IDs that might collide with a query region
   * Returns a Set for efficient exclusion checks
   */
  getNearbyEntities(
    position: Vector3,
    dimensions: Dimension,
    rotationY = 0,
  ): Set<string> {
    const cellKeys = this.getEntityCellKeys(position, dimensions, rotationY);
    const nearby = new Set<string>();

    for (const key of cellKeys) {
      const cell = this.cells.get(key);
      if (cell) {
        for (const entityId of cell) {
          nearby.add(entityId);
        }
      }
    }

    return nearby;
  }

  /**
   * Clear all entities from the grid
   */
  clear(): void {
    this.cells.clear();
    this.entityCells.clear();
    this.entities.clear();
  }

  /**
   * Get grid statistics for debugging
   */
  getStats(): {
    totalEntities: number;
    totalCells: number;
    avgEntitiesPerCell: number;
  } {
    let totalInCells = 0;
    for (const cell of this.cells.values()) {
      totalInCells += cell.size;
    }

    return {
      totalEntities: this.entities.size,
      totalCells: this.cells.size,
      avgEntitiesPerCell:
        this.cells.size > 0 ? totalInCells / this.cells.size : 0,
    };
  }
}

// ============================================================================
// Collision Detector Singleton
// ============================================================================

/**
 * Unified collision detection with spatial partitioning
 * Singleton instance initialized per layout load
 */
export class CollisionDetector {
  private static instance: CollisionDetector | null = null;
  private spatialGrid: SpatialGrid;
  private bounds: ZoneBounds;

  private constructor(bounds: ZoneBounds, cellSize = 5) {
    this.bounds = bounds;
    this.spatialGrid = new SpatialGrid(bounds, cellSize);
  }

  /**
   * Initialize or reinitialize the singleton with new bounds
   * Should be called when a layout is loaded/hydrated
   */
  static initialize(bounds: ZoneBounds, cellSize = 5): CollisionDetector {
    CollisionDetector.instance = new CollisionDetector(bounds, cellSize);
    return CollisionDetector.instance;
  }

  /**
   * Get the singleton instance
   * Returns null if not initialized
   */
  static getInstance(): CollisionDetector | null {
    return CollisionDetector.instance;
  }

  /**
   * Check if detector is initialized
   */
  static isInitialized(): boolean {
    return CollisionDetector.instance !== null;
  }

  /**
   * Destroy the singleton instance
   */
  static destroy(): void {
    if (CollisionDetector.instance) {
      CollisionDetector.instance.spatialGrid.clear();
      CollisionDetector.instance = null;
    }
  }

  /**
   * Get the spatial grid for direct manipulation
   */
  getSpatialGrid(): SpatialGrid {
    return this.spatialGrid;
  }

  /**
   * Get current bounds
   */
  getBounds(): ZoneBounds {
    return this.bounds;
  }

  /**
   * Add an entity to the spatial grid
   */
  addEntity(entity: Entity, entityType: EntityType): void {
    const rotationY = entity.rotation?.y ?? 0;
    this.spatialGrid.insert(
      entity.id,
      entityType,
      entity.position,
      entity.dimensions,
      rotationY,
    );
  }

  /**
   * Remove an entity from the spatial grid
   */
  removeEntity(entityId: string): void {
    this.spatialGrid.remove(entityId);
  }

  /**
   * Update an entity in the spatial grid
   */
  updateEntity(entity: Entity, entityType: EntityType): void {
    const rotationY = entity.rotation?.y ?? 0;
    this.spatialGrid.update(
      entity.id,
      entityType,
      entity.position,
      entity.dimensions,
      rotationY,
    );
  }

  /**
   * Rebuild the spatial grid from scratch
   * Use after bulk operations or layout reload
   */
  rebuildGrid(
    racks: Map<string, Rack>,
    obstacles: Map<string, Obstacle>,
  ): void {
    this.spatialGrid.clear();

    for (const rack of racks.values()) {
      this.addEntity(rack, "rack");
    }

    for (const obstacle of obstacles.values()) {
      this.addEntity(obstacle, "obstacle");
    }
  }

  /**
   * Optimized collision check using spatial grid for culling
   */
  checkCollisions(
    options: CollisionCheckOptions,
    racks: Map<string, Rack>,
    obstacles: Map<string, Obstacle>,
  ): CollisionResult {
    const {
      position,
      dimensions,
      rotationY,
      bounds,
      excludeEntityId,
      enableDebug = true,
    } = options;

    // Validate inputs
    if (
      !Number.isFinite(position.x) ||
      !Number.isFinite(position.z) ||
      !Number.isFinite(rotationY)
    ) {
      console.warn("[COLLISION] Invalid position or rotation");
      return {
        hasCollision: true,
        collidingEntities: [],
        outOfBounds: true,
        reason: "Invalid position",
      };
    }

    // Create OBB for the entity being checked
    const entityOBB = createOBB2D(position, dimensions, rotationY);
    const collidingEntities: CollisionInfo[] = [];

    // Get only nearby entities from spatial grid (HUGE performance boost)
    const nearbyIds = this.spatialGrid.getNearbyEntities(
      position,
      dimensions,
      rotationY,
    );

    // Check against nearby racks only
    for (const entityId of nearbyIds) {
      if (excludeEntityId && entityId === excludeEntityId) continue;

      // Try rack first
      const rack = racks.get(entityId);
      if (rack) {
        const rackRotationY = Number.isFinite(rack.rotation?.y)
          ? rack.rotation.y
          : 0;
        const rackOBB = createOBB2D(
          rack.position,
          rack.dimensions,
          rackRotationY,
        );

        if (checkOBBCollision(entityOBB, rackOBB)) {
          if (enableDebug) {
            triggerCollisionDebug(
              entityOBB,
              rackOBB,
              dimensions.height,
              rack.dimensions.height,
            );
          }

          collidingEntities.push({
            entityId,
            entityType: "rack",
            displayName: getEntityDisplayName(rack),
          });
          break; // Early exit - one collision is enough
        }
        continue;
      }

      // Try obstacle
      const obstacle = obstacles.get(entityId);
      if (obstacle) {
        const obstacleRotationY = Number.isFinite(obstacle.rotation?.y)
          ? obstacle.rotation.y
          : 0;
        const obstacleOBB = createOBB2D(
          obstacle.position,
          obstacle.dimensions,
          obstacleRotationY,
        );

        if (checkOBBCollision(entityOBB, obstacleOBB)) {
          if (enableDebug) {
            triggerCollisionDebug(
              entityOBB,
              obstacleOBB,
              dimensions.height,
              obstacle.dimensions.height,
            );
          }

          collidingEntities.push({
            entityId,
            entityType: "obstacle",
            displayName: getEntityDisplayName(obstacle),
          });
          break; // Early exit
        }
      }
    }

    // Check bounds
    const outOfBounds = !isWithinBounds(
      position,
      dimensions,
      bounds,
      rotationY,
    );

    // Build reason string with informative entity names
    let reason: string | null = null;
    if (outOfBounds) {
      reason = "Out of bounds";
    } else if (collidingEntities.length > 0) {
      const entity = collidingEntities[0];
      reason = entity
        ? `Colliding with ${entity.displayName}`
        : "Collision detected";
    }

    return {
      hasCollision: collidingEntities.length > 0 || outOfBounds,
      collidingEntities,
      outOfBounds,
      reason,
    };
  }
}

// ============================================================================
// Convenience Functions for Singleton Access
// ============================================================================

/**
 * Initialize the collision detector singleton
 * Call this when loading/hydrating a layout
 */
export function initializeCollisionDetector(
  bounds: ZoneBounds,
  racks: Map<string, Rack>,
  obstacles: Map<string, Obstacle>,
  cellSize = 5,
): CollisionDetector {
  const detector = CollisionDetector.initialize(bounds, cellSize);
  detector.rebuildGrid(racks, obstacles);
  return detector;
}

/**
 * Get the collision detector singleton
 */
export function getCollisionDetector(): CollisionDetector | null {
  return CollisionDetector.getInstance();
}

/**
 * Unified collision check against all collidable entities
 * Uses spatial grid for O(1) culling when available, falls back to brute force
 * This is the main API for collision detection
 */
export function checkCollisions(
  options: CollisionCheckOptions,
  racks: Map<string, Rack>,
  obstacles: Map<string, Obstacle>,
): CollisionResult {
  const detector = CollisionDetector.getInstance();

  if (detector) {
    return detector.checkCollisions(options, racks, obstacles);
  }

  // Fallback to brute force if detector not initialized
  return checkCollisionsBruteForce(options, racks, obstacles);
}

// Zone/Floor component - renders floor bounds and child entities
// Migrated to use new SmartStore with StorageEntity

import { Plane, Text, Wireframe } from "@react-three/drei";
import { useTheme } from "next-themes";
import type React from "react";
import { useMemo } from "react";
import * as THREE from "three";
import { Obstacle } from "@/components/zones/obstacle";
import { Rack } from "@/components/zones/rack";
import { useLayoutStore } from "@/store/layout-editor-store";

// ============================================================================
// Types for zone/floor attributes
// ============================================================================

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Dimensions {
  width: number;
  height?: number;
  length: number;
}

// ============================================================================
// Zone Component
// ============================================================================

export const Zone: React.FC<{ zoneId: string }> = ({ zoneId }) => {
  const { resolvedTheme } = useTheme();

  // Get entity from new store (zoneId is now tempId)
  const entity = useLayoutStore((s) => s.entities.get(zoneId));
  const getChildren = useLayoutStore((s) => s.getChildren);

  // Get child entities (racks and obstacles) - use tempId
  const childRacks = useMemo(() => {
    return getChildren(zoneId, "rack");
  }, [getChildren, zoneId]);

  const childObstacles = useMemo(() => {
    return getChildren(zoneId, "obstacle");
  }, [getChildren, zoneId]);

  // Extract attributes from entity
  const { position, dimensions, color, name } = useMemo(() => {
    if (!entity?.zoneAttributes) {
      return {
        position: { x: 0, y: 0, z: 0 },
        dimensions: { width: 10, length: 10 },
        color: "#4A5568",
        name: "Zone",
      };
    }
    const attrs = entity.zoneAttributes;
    return {
      position: (attrs.position as Vec3) ?? { x: 0, y: 0, z: 0 },
      dimensions: (attrs.dimensions as Dimensions) ?? { width: 10, length: 10 },
      color: (attrs.color as string) ?? "#4A5568",
      name: (attrs.name as string) ?? entity.name ?? "Zone",
    };
  }, [entity]);

  if (!entity || entity.isDeleted) return null;

  const width = dimensions.width;
  const length = dimensions.length;

  return (
    // Zone group - positioned at zone origin. Children use positions relative to this.
    <group position={[position.x, position.y, position.z]}>
      {/* Zone floor - positioned at zone center (relative to zone origin) */}
      <Plane
        args={[width, length]}
        position={[width / 2, 0.1, length / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          opacity={0.4}
          transparent
          side={THREE.DoubleSide}
        />
        <Wireframe simplify stroke={color} fillOpacity={1} thickness={0.02} />
      </Plane>
      <Text
        position={[0, 0.2, 0]}
        color={resolvedTheme === "dark" ? "white" : "black"}
        anchorX={"left"}
        anchorY={"bottom-baseline"}
      >
        {name}
      </Text>

      {/* Racks - child entities (positions are zone-relative) */}
      {childRacks.map((rack) => (
        <Rack key={rack.tempId} rackId={rack.tempId} />
      ))}

      {/* Obstacles - child entities (positions are zone-relative) */}
      {childObstacles.map((obstacle) => (
        <Obstacle key={obstacle.tempId} obstacleId={obstacle.tempId} />
      ))}
    </group>
  );
};

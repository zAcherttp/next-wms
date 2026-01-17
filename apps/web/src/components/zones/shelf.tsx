// ShelfGeometry Component
// Phase 2: 3D Rendering - Wireframe shelf visualization with auto-positioned levels

import { Line } from "@react-three/drei";
import type React from "react";
import { useMemo } from "react";
import type { Dimension, Shelf } from "@/lib/types/layout-editor";

interface ShelfGeometryProps {
  rackDimensions: Dimension;
  shelves: Shelf[];
  frameColor?: string;
  binEmptyColor?: string;
  binPartialColor?: string;
  binFullColor?: string;
}

/**
 * Renders wireframe shelves inside a rack with auto-positioned levels.
 * Shelves are rendered as horizontal planes with bin dividers.
 */
export const ShelfGeometry: React.FC<ShelfGeometryProps> = ({
  rackDimensions,
  shelves,
  frameColor = "#888888",
  binEmptyColor = "#666666",
  binPartialColor = "#F59E0B",
  binFullColor = "#22C55E",
}) => {
  const { width, height, depth } = rackDimensions;
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const halfHeight = height / 2;

  // Memoize shelf geometry calculations
  const shelfElements = useMemo(() => {
    // Sort shelves by height for spacing calculation
    const sortedShelves = [...shelves].sort(
      (a, b) => a.heightFromGround - b.heightFromGround,
    );

    return sortedShelves.map((shelf, index) => {
      // Y position relative to rack center (rack is centered at y=0)
      const shelfY = shelf.heightFromGround - halfHeight;
      const binCount = shelf.bins.length;
      const binWidth = binCount > 0 ? width / binCount : width;

      // Calculate shelf spacing (distance to next shelf or rack top)
      const nextShelf = sortedShelves[index + 1];
      const nextShelfHeight = nextShelf ? nextShelf.heightFromGround : height; // Use rack height for topmost shelf
      const shelfSpacing = nextShelfHeight - shelf.heightFromGround;

      // Calculate bin data based on fill ratio
      const binData = shelf.bins.map((bin) => {
        const fillRatio = bin.capacity > 0 ? bin.currentLoad / bin.capacity : 0;
        let color = binPartialColor;
        if (fillRatio === 0) color = binEmptyColor;
        else if (fillRatio >= 1) color = binFullColor;
        else color = binPartialColor;
        return { id: bin._id, color };
      });

      // Create shelf plane outline points
      const shelfOutline: [number, number, number][] = [
        [-halfWidth, shelfY, -halfDepth],
        [halfWidth, shelfY, -halfDepth],
        [halfWidth, shelfY, halfDepth],
        [-halfWidth, shelfY, halfDepth],
        [-halfWidth, shelfY, -halfDepth], // Close the loop
      ];

      // Create bin divider lines
      const binDividers: [number, number, number][][] = [];
      if (binCount > 1) {
        for (let i = 1; i < binCount; i++) {
          const dividerX = -halfWidth + i * binWidth;
          binDividers.push([
            [dividerX, shelfY, -halfDepth],
            [dividerX, shelfY, halfDepth],
          ]);
        }
      }

      return {
        id: shelf._id,
        shelfY,
        shelfOutline,
        binDividers,
        binData,
        binCount,
        binWidth,
        shelfSpacing,
      };
    });
  }, [
    shelves,
    halfWidth,
    halfDepth,
    halfHeight,
    width,
    height,
    binEmptyColor,
    binPartialColor,
    binFullColor,
  ]);

  return (
    <group>
      {shelfElements.map((shelf) => (
        <group key={shelf.id}>
          {/* Shelf outline */}
          <Line
            points={shelf.shelfOutline}
            color={frameColor}
            lineWidth={1.5}
            transparent
            opacity={0.8}
          />

          {/* Bin dividers */}
          {shelf.binDividers.map((divider, idx) => (
            <Line
              key={`divider-${shelf.id}-${idx}`}
              points={divider}
              color={frameColor}
              lineWidth={1}
              transparent
              opacity={0.5}
              dashed
              dashSize={0.1}
              gapSize={0.05}
            />
          ))}

          {/* Bin fill indicators (colored boxes 80% of shelf height) */}
          {shelf.binData.map((bin, binIdx) => {
            const binCenterX =
              -halfWidth + binIdx * shelf.binWidth + shelf.binWidth / 2;
            const indicatorHeight = shelf.shelfSpacing * 0.8;

            return (
              <mesh
                key={`bin-indicator-${bin.id}`}
                position={[binCenterX, shelf.shelfY + indicatorHeight / 2, 0]}
              >
                <boxGeometry
                  args={[shelf.binWidth * 0.8, indicatorHeight, depth * 0.8]}
                />
                <meshBasicMaterial
                  color={bin.color}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};

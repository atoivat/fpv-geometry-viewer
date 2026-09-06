import * as THREE from 'three';

export interface OffsetMetadata {
  x: number;
  y: number;
  z: number;
}

/**
 * Computes geometry bounding box centroid, translates all vertices to origin (0, 0, 0),
 * and returns the original centroid offset metadata vector.
 */
export function centerGeometry(geometry: THREE.BufferGeometry): OffsetMetadata {
  geometry.computeBoundingBox();

  const boundingBox = geometry.boundingBox;
  if (!boundingBox) {
    return { x: 0, y: 0, z: 0 };
  }

  const centroid = new THREE.Vector3();
  boundingBox.getCenter(centroid);

  // Translate all vertices by -centroid
  geometry.translate(-centroid.x, -centroid.y, -centroid.z);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return {
    x: centroid.x,
    y: centroid.y,
    z: centroid.z,
  };
}

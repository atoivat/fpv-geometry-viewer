import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { centerGeometry } from '../coordinateCentering';

describe('coordinateCentering', () => {
  it('should center geometry around (0,0,0) and return the offset centroid vector', () => {
    // Create box geometry offset far away at (350000, 6200000, 100)
    const positions = new Float32Array([
      350000, 6200000, 100,
      350010, 6200010, 110,
    ]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const offset = centerGeometry(geometry);

    // Expected centroid: (350005, 6200005, 105)
    expect(offset.x).toBeCloseTo(350005);
    expect(offset.y).toBeCloseTo(6200005);
    expect(offset.z).toBeCloseTo(105);

    // Geometry position attribute should now be centered at origin
    geometry.computeBoundingBox();
    const centerAfter = new THREE.Vector3();
    geometry.boundingBox?.getCenter(centerAfter);

    expect(centerAfter.x).toBeCloseTo(0);
    expect(centerAfter.y).toBeCloseTo(0);
    expect(centerAfter.z).toBeCloseTo(0);
  });
});

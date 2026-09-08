import { describe, it, expect } from 'vitest';
import { PLYLoaderService } from '../PLYLoaderService';

describe('High Precision 64-bit PLY Loading', () => {
  it('should preserve sub-centimeter delta between UTM coordinates by pre-centering in 64-bit precision', () => {
    // Two points 5mm apart in UTM coordinates (500000m scale)
    // Point 1: (500000.1234, 4000000.5678, 100.1111)
    // Point 2: (500000.1284, 4000000.5728, 100.1161)
    const plyAscii = `ply
format ascii 1.0
element vertex 2
property float x
property float y
property float z
end_header
500000.1234 4000000.5678 100.1111
500000.1284 4000000.5728 100.1161
`;

    const encoder = new TextEncoder();
    const buffer = encoder.encode(plyAscii).buffer;

    const loaderService = new PLYLoaderService();
    const model = loaderService.parse(buffer);

    const pointsObj = model.object as import('three').Points;
    const posAttr = pointsObj.geometry.attributes.position;

    // Relative distance between point 0 and point 1 should be approx sqrt(0.005^2 * 3) = ~0.00866025m
    const dx = posAttr.getX(1) - posAttr.getX(0);
    const dy = posAttr.getY(1) - posAttr.getY(0);
    const dz = posAttr.getZ(1) - posAttr.getZ(0);

    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const expectedDist = Math.sqrt(0.005 * 0.005 * 3); // 0.008660254m

    // High precision expectation: distance between points should match true distance within 0.0001m (0.1mm)
    expect(dist).toBeCloseTo(expectedDist, 4);

    // Bounding box centroid offset metadata should preserve absolute coordinates
    expect(model.offset.x).toBeCloseTo(500000.1259, 2);
    expect(model.offset.y).toBeCloseTo(4000000.5703, 2);
    expect(model.offset.z).toBeCloseTo(100.1136, 2);
  });
});

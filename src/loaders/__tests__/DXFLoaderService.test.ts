import { describe, it, expect } from 'vitest';
import { DXFLoaderService } from '../DXFLoaderService';

describe('DXFLoaderService', () => {
  it('should parse minimal DXF string into Three.js line objects with metadata', () => {
    const loader = new DXFLoaderService();

    // Minimal valid DXF text with a single LINE entity
    const sampleDxf = `0
SECTION
2
ENTITIES
0
LINE
8
0
62
1
10
10.0
20
20.0
30
0.0
11
30.0
21
40.0
31
0.0
0
ENDSEC
0
EOF`;

    const result = loader.parse(sampleDxf);
    expect(result.object).toBeDefined();
    expect(result.object.children.length).toBeGreaterThan(0);
    expect(result.offset).toBeDefined();
  });
});

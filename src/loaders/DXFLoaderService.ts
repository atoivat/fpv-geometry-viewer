import * as THREE from 'three';
import DxfParser from 'dxf-parser';
import { centerGeometry, OffsetMetadata } from './coordinateCentering';

export interface LoadedDxf {
  object: THREE.Group;
  dxfPoints: THREE.Points[];
  dxfLines: THREE.Object3D[];
  offset: OffsetMetadata;
}

const AUTO_CAD_COLORS: { [key: number]: number } = {
  1: 0xff0000,
  2: 0xffff00,
  3: 0x00ff00,
  4: 0x00ffff,
  5: 0x0000ff,
  6: 0xff00ff,
  7: 0xffffff,
};

export function dxfColorToHex(colorNumber?: number): number {
  if (colorNumber && AUTO_CAD_COLORS[colorNumber]) {
    return AUTO_CAD_COLORS[colorNumber];
  }
  return 0xffffff;
}

export class DXFLoaderService {
  private parser: DxfParser;

  constructor() {
    this.parser = new DxfParser();
  }

  public parse(dxfText: string): LoadedDxf {
    const parsed = this.parser.parseSync(dxfText);
    const group = new THREE.Group();
    const dxfPoints: THREE.Points[] = [];
    const dxfLines: THREE.Object3D[] = [];

    if (!parsed || !parsed.entities) {
      return {
        object: group,
        dxfPoints: [],
        dxfLines: [],
        offset: { x: 0, y: 0, z: 0 },
      };
    }

    const allPositions: number[] = [];

    parsed.entities.forEach((entity: any) => {
      const color = dxfColorToHex(entity.color);

      if (entity.type === 'LINE' && entity.vertices && entity.vertices.length >= 2) {
        const p1 = entity.vertices[0];
        const p2 = entity.vertices[1];
        allPositions.push(p1.x, p1.y, p1.z || 0, p2.x, p2.y, p2.z || 0);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute([p1.x, p1.y, p1.z || 0, p2.x, p2.y, p2.z || 0], 3)
        );

        const material = new THREE.LineBasicMaterial({ color });
        const line = new THREE.Line(geometry, material);
        group.add(line);
        dxfLines.push(line);
      } else if (
        (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') &&
        entity.vertices
      ) {
        const positions: number[] = [];
        entity.vertices.forEach((v: any) => {
          positions.push(v.x, v.y, v.z || 0);
          allPositions.push(v.x, v.y, v.z || 0);
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const material = new THREE.LineBasicMaterial({ color });
        const line = new THREE.LineLoop(geometry, material);
        group.add(line);
        dxfLines.push(line);
      } else if (entity.type === 'POINT' && entity.position) {
        const p = entity.position;
        allPositions.push(p.x, p.y, p.z || 0);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute([p.x, p.y, p.z || 0], 3));

        const material = new THREE.PointsMaterial({ color, size: 0.1 });
        const points = new THREE.Points(geometry, material);
        group.add(points);
        dxfPoints.push(points);
      }
    });

    // Auto-center overall group
    const combinedGeometry = new THREE.BufferGeometry();
    combinedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(allPositions, 3));
    const offset = centerGeometry(combinedGeometry);

    // Apply negative centroid translation to all children
    group.children.forEach((child) => {
      if ('geometry' in child && (child as any).geometry) {
        (child as any).geometry.translate(-offset.x, -offset.y, -offset.z);
      }
    });

    return {
      object: group,
      dxfPoints,
      dxfLines,
      offset,
    };
  }
}

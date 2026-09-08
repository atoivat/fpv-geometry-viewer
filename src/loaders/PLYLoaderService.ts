import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { centerGeometry, OffsetMetadata } from './coordinateCentering';
import { parsePLYHighPrecision } from './highPrecisionPLYParser';

export interface LoadedModel {
  object: THREE.Object3D;
  isPointCloud: boolean;
  isMesh: boolean;
  offset: OffsetMetadata;
}

export class PLYLoaderService {
  private loader: PLYLoader;

  constructor() {
    this.loader = new PLYLoader();
  }

  public parse(buffer: ArrayBuffer): LoadedModel {
    try {
      const highPrec = parsePLYHighPrecision(buffer);
      const hasColor = highPrec.geometry.attributes.color !== undefined;

      if (highPrec.isMesh) {
        const material = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          roughness: 0.5,
          side: THREE.DoubleSide,
          vertexColors: hasColor,
        });
        const mesh = new THREE.Mesh(highPrec.geometry, material);
        return {
          object: mesh,
          isPointCloud: false,
          isMesh: true,
          offset: highPrec.offset,
        };
      } else {
        const material = new THREE.PointsMaterial({
          size: 0.1,
          vertexColors: hasColor,
          color: hasColor ? 0xffffff : 0x00ff88,
        });
        const points = new THREE.Points(highPrec.geometry, material);
        return {
          object: points,
          isPointCloud: true,
          isMesh: false,
          offset: highPrec.offset,
        };
      }
    } catch {
      // Fallback to standard Three.js loader if custom high-precision parser cannot handle format
      const geometry = this.loader.parse(buffer);
      const offset = centerGeometry(geometry);
      const hasIndex = geometry.index !== null && geometry.index.count > 0;

      if (hasIndex) {
        const material = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          roughness: 0.5,
          side: THREE.DoubleSide,
          vertexColors: geometry.attributes.color !== undefined,
        });
        const mesh = new THREE.Mesh(geometry, material);
        return {
          object: mesh,
          isPointCloud: false,
          isMesh: true,
          offset,
        };
      } else {
        const material = new THREE.PointsMaterial({
          size: 0.1,
          vertexColors: geometry.attributes.color !== undefined,
          color: geometry.attributes.color ? 0xffffff : 0x00ff88,
        });
        const points = new THREE.Points(geometry, material);
        return {
          object: points,
          isPointCloud: true,
          isMesh: false,
          offset,
        };
      }
    }
  }
}

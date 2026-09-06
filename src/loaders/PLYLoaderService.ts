import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { centerGeometry, OffsetMetadata } from './coordinateCentering';

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
    const geometry = this.loader.parse(buffer);

    // Auto-center geometry to prevent WebGL floating-point precision jitter
    const offset = centerGeometry(geometry);

    const hasIndex = geometry.index !== null && geometry.index.count > 0;
    
    if (hasIndex) {
      // Mesh model
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
      // Point Cloud model
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

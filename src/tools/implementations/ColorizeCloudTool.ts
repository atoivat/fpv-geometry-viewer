import * as THREE from 'three';
import { ITool, SceneContext } from '../ITool';

export class ColorizeCloudTool implements ITool {
  public readonly id = 'colorize-cloud';
  public readonly name = 'Colorize Cloud (3D Gradient)';
  public readonly icon = '🎨';

  private gradientMode: number = 0; // 0: Z-Height, 1: 3D Spatial (XYZ->RGB), 2: Rainbow Spectrum

  public activate(_context: SceneContext): void {}
  public deactivate(_context: SceneContext): void {}

  public onPrimaryAction(context: SceneContext): void {
    const pointsList = [...context.plyPoints, ...context.dxfPoints];

    pointsList.forEach((points) => {
      const geometry = points.geometry;
      const posAttr = geometry.getAttribute('position');
      if (!posAttr) return;

      // Save original color attribute if not already saved
      if (!points.userData.originalColorAttrSaved) {
        points.userData.originalColorAttr = geometry.getAttribute('color') ? geometry.getAttribute('color').clone() : null;
        points.userData.originalColorAttrSaved = true;
      }

      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox || new THREE.Box3();
      const min = bbox.min;
      const max = bbox.max;

      const dx = Math.max(0.001, max.x - min.x);
      const dy = Math.max(0.001, max.y - min.y);
      const dz = Math.max(0.001, max.z - min.z);

      const count = posAttr.count;
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = posAttr.getZ(i);

        const normX = Math.max(0, Math.min(1, (x - min.x) / dx));
        const normY = Math.max(0, Math.min(1, (y - min.y) / dy));
        const normZ = Math.max(0, Math.min(1, (z - min.z) / dz));

        let r = 1, g = 1, b = 1;

        if (this.gradientMode === 0) {
          // Z-Height Gradient (Purple -> Blue -> Green -> Yellow)
          const color = new THREE.Color().setHSL(0.7 - normZ * 0.7, 0.9, 0.5);
          r = color.r;
          g = color.g;
          b = color.b;
        } else if (this.gradientMode === 1) {
          // 3D Spatial Gradient (X->Red, Y->Green, Z->Blue)
          r = 0.2 + 0.8 * normX;
          g = 0.2 + 0.8 * normY;
          b = 0.2 + 0.8 * normZ;
        } else if (this.gradientMode === 2) {
          // Rainbow Spectrum by Z
          const color = new THREE.Color().setHSL(normZ, 1.0, 0.5);
          r = color.r;
          g = color.g;
          b = color.b;
        }

        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
      }

      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.attributes.color.needsUpdate = true;

      if (points.material instanceof THREE.PointsMaterial) {
        points.material.vertexColors = true;
        points.material.color.setHex(0xffffff);
        points.material.needsUpdate = true;
      }
    });

    // Cycle gradient mode for next click
    this.gradientMode = (this.gradientMode + 1) % 3;
  }

  public onSecondaryAction(context: SceneContext): void {
    const pointsList = [...context.plyPoints, ...context.dxfPoints];

    pointsList.forEach((points) => {
      const geometry = points.geometry;

      if (points.userData.originalColorAttrSaved) {
        if (points.userData.originalColorAttr) {
          geometry.setAttribute('color', points.userData.originalColorAttr.clone());
          if (points.material instanceof THREE.PointsMaterial) {
            points.material.vertexColors = true;
            points.material.needsUpdate = true;
          }
        } else {
          geometry.deleteAttribute('color');
          if (points.material instanceof THREE.PointsMaterial) {
            points.material.vertexColors = false;
            points.material.color.setHex(0x00ff88);
            points.material.needsUpdate = true;
          }
        }
      }
    });
  }
}

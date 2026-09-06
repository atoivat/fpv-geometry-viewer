import * as THREE from 'three';
import { ITool, SceneContext } from '../ITool';

export class DxfPointSizeTool implements ITool {
  public readonly id = 'dxf-point-size';
  public readonly name = 'DXF Point Size';
  public readonly icon = '🟡';

  public activate(_context: SceneContext): void {}
  public deactivate(_context: SceneContext): void {}

  public onPrimaryAction(context: SceneContext): void {
    context.dxfPoints.forEach((points) => {
      if (points.material instanceof THREE.PointsMaterial) {
        points.material.size += 0.02;
        points.material.needsUpdate = true;
      }
    });
  }

  public onSecondaryAction(context: SceneContext): void {
    context.dxfPoints.forEach((points) => {
      if (points.material instanceof THREE.PointsMaterial) {
        points.material.size = Math.max(0.005, points.material.size - 0.02);
        points.material.needsUpdate = true;
      }
    });
  }
}

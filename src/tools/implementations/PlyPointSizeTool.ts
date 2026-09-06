import * as THREE from 'three';
import { ITool, SceneContext } from '../ITool';

export class PlyPointSizeTool implements ITool {
  public readonly id = 'ply-point-size';
  public readonly name = 'PLY Point Size';
  public readonly icon = '🟢';

  public activate(_context: SceneContext): void {}
  public deactivate(_context: SceneContext): void {}

  public onPrimaryAction(context: SceneContext): void {
    context.plyPoints.forEach((points) => {
      if (points.material instanceof THREE.PointsMaterial) {
        points.material.size += 0.02;
        points.material.needsUpdate = true;
      }
    });
  }

  public onSecondaryAction(context: SceneContext): void {
    context.plyPoints.forEach((points) => {
      if (points.material instanceof THREE.PointsMaterial) {
        points.material.size = Math.max(0.005, points.material.size - 0.02);
        points.material.needsUpdate = true;
      }
    });
  }
}

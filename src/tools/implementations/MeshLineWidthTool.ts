import * as THREE from 'three';
import { ITool, SceneContext } from '../ITool';

export class MeshLineWidthTool implements ITool {
  public readonly id = 'mesh-line-width';
  public readonly name = 'Mesh Wireframe Width';
  public readonly icon = '🕸️';

  public activate(_context: SceneContext): void {}
  public deactivate(_context: SceneContext): void {}

  public onPrimaryAction(context: SceneContext): void {
    context.meshLines.forEach((obj) => {
      obj.traverse((child) => {
        if (child instanceof THREE.Line || (child as any).isLine2) {
          const mat = (child as any).material;
          if (mat && 'linewidth' in mat) {
            mat.linewidth += 1.0;
            mat.needsUpdate = true;
          }
        }
      });
    });
  }

  public onSecondaryAction(context: SceneContext): void {
    context.meshLines.forEach((obj) => {
      obj.traverse((child) => {
        if (child instanceof THREE.Line || (child as any).isLine2) {
          const mat = (child as any).material;
          if (mat && 'linewidth' in mat) {
            mat.linewidth = Math.max(1.0, mat.linewidth - 1.0);
            mat.needsUpdate = true;
          }
        }
      });
    });
  }
}

import { ITool, SceneContext } from '../ITool';

export class CameraSpeedTool implements ITool {
  public readonly id = 'camera-speed';
  public readonly name = 'Flight Speed';
  public readonly icon = '⚡';

  public activate(_context: SceneContext): void {}
  public deactivate(_context: SceneContext): void {}

  public onPrimaryAction(context: SceneContext): void {
    if (context.cameraControls) {
      context.cameraControls.moveSpeed += 2.0;
    }
  }

  public onSecondaryAction(context: SceneContext): void {
    if (context.cameraControls) {
      context.cameraControls.moveSpeed = Math.max(1.0, context.cameraControls.moveSpeed - 2.0);
    }
  }
}

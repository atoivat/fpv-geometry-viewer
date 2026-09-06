import * as THREE from 'three';
import type { CameraControls } from '../core/CameraControls';

export interface SceneContext {
  scene: THREE.Scene;
  cameraControls: CameraControls;
  plyPoints: THREE.Points[];
  dxfPoints: THREE.Points[];
  dxfLines: THREE.Object3D[];
  meshLines: THREE.Object3D[];
}

export interface ITool {
  id: string;
  name: string;
  icon: string;
  activate(context: SceneContext): void;
  deactivate(context: SceneContext): void;
  onPrimaryAction(context: SceneContext): void;   // Left Click (Increase)
  onSecondaryAction(context: SceneContext): void; // Right Click (Decrease)
}

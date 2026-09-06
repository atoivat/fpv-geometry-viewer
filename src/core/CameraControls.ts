import * as THREE from 'three';
import { calculateMovementVector, KeyState } from '../math/cameraMath';

export class CameraControls {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  public moveSpeed: number = 10.0;
  public mouseSensitivity: number = 0.002;

  public pitch: number = 0; // Look up/down radians
  public yaw: number = 0;   // Look left/right radians

  private keyState: KeyState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  };

  private isLocked: boolean = false;
  private onLockChangeCallback?: (locked: boolean) => void;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.initEventListeners();
  }

  public setOnLockChange(callback: (locked: boolean) => void): void {
    this.onLockChangeCallback = callback;
  }

  public requestPointerLock(): void {
    this.domElement.requestPointerLock();
  }

  public exitPointerLock(): void {
    if (document.pointerLockElement === this.domElement) {
      document.exitPointerLock();
    }
  }

  public isPointerLocked(): boolean {
    return this.isLocked;
  }

  private initEventListeners(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('pointerlockchange', () => {
        this.isLocked = document.pointerLockElement === this.domElement;
        if (!this.isLocked) {
          this.resetKeys();
        }
        if (this.onLockChangeCallback) {
          this.onLockChangeCallback(this.isLocked);
        }
      });

      document.addEventListener('mousemove', (e: MouseEvent) => {
        if (!this.isLocked) return;

        this.yaw -= e.movementX * this.mouseSensitivity;
        this.pitch -= e.movementY * this.mouseSensitivity;

        // Clamp pitch to avoid gimbal flip (-89 to +89 deg)
        const maxPitch = Math.PI / 2 - 0.01;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

        this.updateCameraRotation();
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e: KeyboardEvent) => {
        if (!this.isLocked) return;
        this.handleKey(e.code, true);
      });

      window.addEventListener('keyup', (e: KeyboardEvent) => {
        this.handleKey(e.code, false);
      });
    }
  }

  private handleKey(code: string, isDown: boolean): void {
    switch (code) {
      case 'KeyW':
        this.keyState.forward = isDown;
        break;
      case 'KeyS':
        this.keyState.backward = isDown;
        break;
      case 'KeyA':
        this.keyState.left = isDown;
        break;
      case 'KeyD':
        this.keyState.right = isDown;
        break;
      case 'Space':
        this.keyState.up = isDown;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keyState.down = isDown;
        break;
    }
  }

  private resetKeys(): void {
    this.keyState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
    };
  }

  private updateCameraRotation(): void {
    // Pitch rotates around X, Yaw rotates around Z (Z-Up space)
    const euler = new THREE.Euler(0, 0, 0, 'ZXY');
    euler.set(Math.PI / 2 + this.pitch, 0, this.yaw, 'ZXY');
    this.camera.quaternion.setFromEuler(euler);
  }

  public update(deltaTime: number): void {
    if (!this.isLocked) return;

    const moveVector = calculateMovementVector(this.keyState, this.yaw, this.pitch);

    this.camera.position.x += moveVector.x * this.moveSpeed * deltaTime;
    this.camera.position.y += moveVector.y * this.moveSpeed * deltaTime;
    this.camera.position.z += moveVector.z * this.moveSpeed * deltaTime;
  }
}

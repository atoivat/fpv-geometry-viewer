export interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculates normalized camera velocity vector in Z-Up coordinate space.
 * W moves forward along camera orientation, S moves backward.
 * D moves right, A moves left.
 * Horizontal movement (WASD) is constrained to the XY plane regardless of camera pitch.
 * Vertical translation (Space/Shift) operates along the Z axis.
 */
export function calculateMovementVector(keys: KeyState, yaw: number, _pitch: number): Vector3D {
  let vx = 0;
  let vy = 0;
  let vz = 0;

  // Forward unit vector in XY plane (+Y when yaw=0)
  const fx = -Math.sin(yaw);
  const fy = Math.cos(yaw);

  // Right unit vector in XY plane (+X when yaw=0)
  const rx = Math.cos(yaw);
  const ry = Math.sin(yaw);

  if (keys.forward) {
    vx += fx;
    vy += fy;
  }
  if (keys.backward) {
    vx -= fx;
    vy -= fy;
  }
  if (keys.right) {
    vx += rx;
    vy += ry;
  }
  if (keys.left) {
    vx -= rx;
    vy -= ry;
  }

  if (keys.up) {
    vz += 1;
  }
  if (keys.down) {
    vz -= 1;
  }

  const length = Math.sqrt(vx * vx + vy * vy + vz * vz);

  if (length > 0) {
    return {
      x: vx / length,
      y: vy / length,
      z: vz / length,
    };
  }

  return { x: 0, y: 0, z: 0 };
}

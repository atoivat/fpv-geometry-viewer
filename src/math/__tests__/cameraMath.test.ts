import { describe, it, expect } from 'vitest';
import { calculateMovementVector } from '../cameraMath';

describe('cameraMath - WASD Horizontal & Elevation Movement in Z-Up', () => {
  it('should move forward along +Y when yaw is 0', () => {
    const keys = { forward: true, backward: false, left: false, right: false, up: false, down: false };
    const yaw = 0;
    const pitch = Math.PI / 4; // Looking up 45 degrees

    const moveVec = calculateMovementVector(keys, yaw, pitch);

    expect(moveVec.x).toBeCloseTo(0);
    expect(moveVec.y).toBeCloseTo(1);
    expect(moveVec.z).toBeCloseTo(0); // Pitch must NOT alter horizontal movement Z
  });

  it('should move right along +X when pressing D (right key) at yaw 0', () => {
    const keys = { forward: false, backward: false, left: false, right: true, up: false, down: false };
    const yaw = 0;

    const moveVec = calculateMovementVector(keys, yaw, 0);

    expect(moveVec.x).toBeCloseTo(1);
    expect(moveVec.y).toBeCloseTo(0);
    expect(moveVec.z).toBeCloseTo(0);
  });

  it('should move left along -X when pressing A (left key) at yaw 0', () => {
    const keys = { forward: false, backward: false, left: true, right: false, up: false, down: false };
    const yaw = 0;

    const moveVec = calculateMovementVector(keys, yaw, 0);

    expect(moveVec.x).toBeCloseTo(-1);
    expect(moveVec.y).toBeCloseTo(0);
    expect(moveVec.z).toBeCloseTo(0);
  });

  it('should move backward along -Y when pressing S at yaw 0', () => {
    const keys = { forward: false, backward: true, left: false, right: false, up: false, down: false };
    const yaw = 0;

    const moveVec = calculateMovementVector(keys, yaw, 0);

    expect(moveVec.x).toBeCloseTo(0);
    expect(moveVec.y).toBeCloseTo(-1);
    expect(moveVec.z).toBeCloseTo(0);
  });

  it('should rotate forward vector along -X when yaw is +90 degrees (PI / 2)', () => {
    const keys = { forward: true, backward: false, left: false, right: false, up: false, down: false };
    const yaw = Math.PI / 2;

    const moveVec = calculateMovementVector(keys, yaw, 0);

    expect(moveVec.x).toBeCloseTo(-1);
    expect(moveVec.y).toBeCloseTo(0);
    expect(moveVec.z).toBeCloseTo(0);
  });

  it('should translate strictly on Z axis when pressing Space or Shift', () => {
    const spaceKeys = { forward: false, backward: false, left: false, right: false, up: true, down: false };
    const shiftKeys = { forward: false, backward: false, left: false, right: false, up: false, down: true };

    const upVec = calculateMovementVector(spaceKeys, 0, 0);
    const downVec = calculateMovementVector(shiftKeys, 0, 0);

    expect(upVec).toEqual({ x: 0, y: 0, z: 1 });
    expect(downVec).toEqual({ x: 0, y: 0, z: -1 });
  });

  it('should normalize diagonal WASD movement vectors', () => {
    const keys = { forward: true, backward: false, left: false, right: true, up: false, down: false };
    const yaw = 0;

    const moveVec = calculateMovementVector(keys, yaw, 0);
    const length = Math.sqrt(moveVec.x ** 2 + moveVec.y ** 2 + moveVec.z ** 2);

    expect(length).toBeCloseTo(1);
  });
});

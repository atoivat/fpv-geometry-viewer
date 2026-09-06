import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HotbarManager } from '../HotbarManager';
import { ITool, SceneContext } from '../ITool';
import * as THREE from 'three';

describe('HotbarManager', () => {
  let hotbar: HotbarManager;
  let mockSceneContext: SceneContext;
  let mockTool: ITool;

  beforeEach(() => {
    hotbar = new HotbarManager();
    mockSceneContext = {
      scene: new THREE.Scene(),
      cameraControls: {} as any,
      plyPoints: [],
      dxfPoints: [],
      dxfLines: [],
      meshLines: [],
    };
    mockTool = {
      id: 'test-tool',
      name: 'Test Tool',
      icon: '🔧',
      activate: vi.fn(),
      deactivate: vi.fn(),
      onPrimaryAction: vi.fn(),
      onSecondaryAction: vi.fn(),
    };
  });

  it('should initialize with 10 empty slots and active index 0', () => {
    expect(hotbar.getSlots().length).toBe(10);
    expect(hotbar.getActiveSlotIndex()).toBe(0);
    expect(hotbar.getActiveTool()).toBeNull();
  });

  it('should register a tool into a slot and activate it if slot is active', () => {
    hotbar.registerTool(0, mockTool, mockSceneContext);
    expect(hotbar.getToolAt(0)).toBe(mockTool);
    expect(mockTool.activate).toHaveBeenCalledWith(mockSceneContext);
  });

  it('should switch active slot on selectSlot(index)', () => {
    hotbar.registerTool(0, mockTool, mockSceneContext);
    hotbar.selectSlot(3, mockSceneContext);

    expect(hotbar.getActiveSlotIndex()).toBe(3);
    expect(mockTool.deactivate).toHaveBeenCalledWith(mockSceneContext);
  });

  it('should wrap around correctly on selectNextSlot and selectPrevSlot', () => {
    hotbar.selectSlot(9, mockSceneContext);
    hotbar.selectNextSlot(mockSceneContext);
    expect(hotbar.getActiveSlotIndex()).toBe(0);

    hotbar.selectPrevSlot(mockSceneContext);
    expect(hotbar.getActiveSlotIndex()).toBe(9);
  });

  it('should delegate primary and secondary actions to the active tool', () => {
    hotbar.registerTool(0, mockTool, mockSceneContext);
    hotbar.triggerPrimaryAction(mockSceneContext);
    expect(mockTool.onPrimaryAction).toHaveBeenCalledWith(mockSceneContext);

    hotbar.triggerSecondaryAction(mockSceneContext);
    expect(mockTool.onSecondaryAction).toHaveBeenCalledWith(mockSceneContext);
  });
});

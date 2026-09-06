import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { PlyPointSizeTool } from '../PlyPointSizeTool';
import { DxfPointSizeTool } from '../DxfPointSizeTool';
import { DxfLineWidthTool } from '../DxfLineWidthTool';
import { MeshLineWidthTool } from '../MeshLineWidthTool';
import { CameraSpeedTool } from '../CameraSpeedTool';
import { ColorizeCloudTool } from '../ColorizeCloudTool';
import { SceneContext } from '../../ITool';
import { CameraControls } from '../../../core/CameraControls';

describe('Hotbar Tools Implementations', () => {
  let mockContext: SceneContext;
  let plyPoints: THREE.Points;
  let dxfPoints: THREE.Points;
  let dxfLine: THREE.Line;
  let meshLine: THREE.Line;
  let cameraControls: CameraControls;

  beforeEach(() => {
    const positions = new Float32Array([0, 0, 0, 10, 20, 30]);

    const plyGeo = new THREE.BufferGeometry();
    plyGeo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
    plyPoints = new THREE.Points(plyGeo, new THREE.PointsMaterial({ size: 0.1 }));

    const dxfGeo = new THREE.BufferGeometry();
    dxfGeo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
    dxfPoints = new THREE.Points(dxfGeo, new THREE.PointsMaterial({ size: 0.1 }));

    const lineGeo = new THREE.BufferGeometry();
    dxfLine = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ linewidth: 1.0 } as any));
    meshLine = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ linewidth: 1.0 } as any));

    const camera = new THREE.PerspectiveCamera();
    const mockDom = {
      addEventListener: () => {},
      requestPointerLock: () => {},
    } as any;
    cameraControls = new CameraControls(camera, mockDom);
    cameraControls.moveSpeed = 10.0;

    mockContext = {
      scene: new THREE.Scene(),
      cameraControls,
      plyPoints: [plyPoints],
      dxfPoints: [dxfPoints],
      dxfLines: [dxfLine],
      meshLines: [meshLine],
    };
  });

  it('PlyPointSizeTool should increase and decrease PLY points material size with small delta', () => {
    const tool = new PlyPointSizeTool();
    tool.onPrimaryAction(mockContext);
    expect((plyPoints.material as THREE.PointsMaterial).size).toBeCloseTo(0.12);

    tool.onSecondaryAction(mockContext);
    expect((plyPoints.material as THREE.PointsMaterial).size).toBeCloseTo(0.1);
  });

  it('DxfPointSizeTool should increase and decrease DXF points material size with small delta', () => {
    const tool = new DxfPointSizeTool();
    tool.onPrimaryAction(mockContext);
    expect((dxfPoints.material as THREE.PointsMaterial).size).toBeCloseTo(0.12);

    tool.onSecondaryAction(mockContext);
    expect((dxfPoints.material as THREE.PointsMaterial).size).toBeCloseTo(0.1);
  });

  it('DxfLineWidthTool should adjust DXF line width', () => {
    const tool = new DxfLineWidthTool();
    tool.onPrimaryAction(mockContext);
    expect((dxfLine.material as any).linewidth).toBe(2.0);

    tool.onSecondaryAction(mockContext);
    expect((dxfLine.material as any).linewidth).toBe(1.0);
  });

  it('MeshLineWidthTool should adjust Mesh line width', () => {
    const tool = new MeshLineWidthTool();
    tool.onPrimaryAction(mockContext);
    expect((meshLine.material as any).linewidth).toBe(2.0);

    tool.onSecondaryAction(mockContext);
    expect((meshLine.material as any).linewidth).toBe(1.0);
  });

  it('ColorizeCloudTool should apply 3D gradient on left click and restore original color on right click', () => {
    const tool = new ColorizeCloudTool();
    
    // Left click applies gradient colors attribute
    tool.onPrimaryAction(mockContext);
    expect(plyPoints.geometry.getAttribute('color')).toBeDefined();
    expect(plyPoints.geometry.getAttribute('color')?.count).toBe(2);

    // Right click restores original color
    tool.onSecondaryAction(mockContext);
    expect(plyPoints.geometry.getAttribute('color')).toBeUndefined();
  });

  it('CameraSpeedTool should increase and decrease camera movement speed', () => {
    const tool = new CameraSpeedTool();
    tool.onPrimaryAction(mockContext);
    expect(cameraControls.moveSpeed).toBe(12.0);

    tool.onSecondaryAction(mockContext);
    expect(cameraControls.moveSpeed).toBe(10.0);
  });
});

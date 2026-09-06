import './style.css';
import { SceneManager } from './core/SceneManager';
import { CameraControls } from './core/CameraControls';
import { MenuStateMachine, MenuState } from './ui/menuStateMachine';
import { HotbarManager } from './tools/HotbarManager';
import { MinecraftUIOverlay } from './ui/MinecraftUIOverlay';
import { PLYLoaderService } from './loaders/PLYLoaderService';
import { DXFLoaderService } from './loaders/DXFLoaderService';

import { PlyPointSizeTool } from './tools/implementations/PlyPointSizeTool';
import { DxfPointSizeTool } from './tools/implementations/DxfPointSizeTool';
import { DxfLineWidthTool } from './tools/implementations/DxfLineWidthTool';
import { MeshLineWidthTool } from './tools/implementations/MeshLineWidthTool';
import { CameraSpeedTool } from './tools/implementations/CameraSpeedTool';
import { ColorizeCloudTool } from './tools/implementations/ColorizeCloudTool';

class App {
  private sceneManager: SceneManager;
  private cameraControls: CameraControls;
  private menuManager: MenuStateMachine;
  private hotbarManager: HotbarManager;

  private plyLoader: PLYLoaderService;
  private dxfLoader: DXFLoaderService;

  private lastTime: number = performance.now();

  constructor() {
    const appContainer = document.getElementById('app-container')!;
    const canvasContainer = document.getElementById('canvas-container')!;

    this.sceneManager = new SceneManager(canvasContainer);
    this.cameraControls = new CameraControls(
      this.sceneManager.camera,
      this.sceneManager.renderer.domElement
    );

    this.menuManager = new MenuStateMachine();
    this.hotbarManager = new HotbarManager();

    this.plyLoader = new PLYLoaderService();
    this.dxfLoader = new DXFLoaderService();

    // Register initial tools into hotbar
    const sceneContext = this.sceneManager.getSceneContext(this.cameraControls);
    this.hotbarManager.registerTool(0, new ColorizeCloudTool(), sceneContext);
    this.hotbarManager.registerTool(1, new PlyPointSizeTool(), sceneContext);
    this.hotbarManager.registerTool(2, new DxfPointSizeTool(), sceneContext);
    this.hotbarManager.registerTool(3, new DxfLineWidthTool(), sceneContext);
    this.hotbarManager.registerTool(4, new MeshLineWidthTool(), sceneContext);
    this.hotbarManager.registerTool(5, new CameraSpeedTool(), sceneContext);

    // Initialize UI Overlay
    new MinecraftUIOverlay(
      appContainer,
      this.menuManager,
      this.hotbarManager,
      {
        onLoadFiles: (files) => this.loadFiles(files),
        onStart: () => this.enterVisualizer(),
        onResume: () => this.enterVisualizer(),
        onExitToStart: () => this.exitToStart(),
        onToggleEDL: () => {
          const enabled = this.sceneManager.toggleEDL();
          this.updateStatus(enabled ? 'Eye-Dome Lighting (EDL): Enabled' : 'Eye-Dome Lighting (EDL): Disabled');
        },
      }
    );

    this.initControlsAndEvents();
    this.animate();
  }

  private initControlsAndEvents(): void {
    // Sync Pointer Lock changes with Menu State
    this.cameraControls.setOnLockChange((locked) => {
      if (!locked && this.menuManager.getState() === MenuState.VISUALIZING) {
        this.menuManager.pauseVisualizer();
      }
    });

    // Handle tool mouse actions during VISUALIZING
    const canvasElem = this.sceneManager.renderer.domElement;

    canvasElem.addEventListener('mousedown', (e: MouseEvent) => {
      if (this.menuManager.getState() !== MenuState.VISUALIZING) return;

      const context = this.sceneManager.getSceneContext(this.cameraControls);
      if (e.button === 0) {
        // Left click
        this.hotbarManager.triggerPrimaryAction(context);
      } else if (e.button === 2) {
        // Right click
        this.hotbarManager.triggerSecondaryAction(context);
      }
    });

    // Prevent context menu on right click
    canvasElem.addEventListener('contextmenu', (e) => e.preventDefault());

    // Mouse scroll hotbar slot cycling
    window.addEventListener('wheel', (e: WheelEvent) => {
      if (this.menuManager.getState() !== MenuState.VISUALIZING) return;
      const context = this.sceneManager.getSceneContext(this.cameraControls);
      if (e.deltaY > 0) {
        this.hotbarManager.selectNextSlot(context);
      } else {
        this.hotbarManager.selectPrevSlot(context);
      }
    });

    // Hotbar number key selection (1-9, 0)
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.menuManager.getState() !== MenuState.VISUALIZING) return;

      const key = e.key;
      if (key >= '1' && key <= '9') {
        const slotIdx = parseInt(key, 10) - 1;
        this.hotbarManager.selectSlot(slotIdx, this.sceneManager.getSceneContext(this.cameraControls));
      } else if (key === '0') {
        this.hotbarManager.selectSlot(9, this.sceneManager.getSceneContext(this.cameraControls));
      }
    });
  }

  private enterVisualizer(): void {
    this.menuManager.startVisualizer();
    this.cameraControls.requestPointerLock();
  }

  private exitToStart(): void {
    this.cameraControls.exitPointerLock();
    this.menuManager.exitToStartMenu();
  }

  private async loadFiles(files: FileList): Promise<void> {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase();

      try {
        if (ext === 'ply') {
          const buffer = await file.arrayBuffer();
          const model = this.plyLoader.parse(buffer);
          this.sceneManager.addPlyModel(model);
          this.updateStatus(`Loaded PLY: ${file.name} (Offset: X=${model.offset.x.toFixed(1)}, Y=${model.offset.y.toFixed(1)}, Z=${model.offset.z.toFixed(1)})`);
        } else if (ext === 'dxf') {
          const text = await file.text();
          const model = this.dxfLoader.parse(text);
          this.sceneManager.addDxfModel(model);
          this.updateStatus(`Loaded DXF: ${file.name} (Offset: X=${model.offset.x.toFixed(1)}, Y=${model.offset.y.toFixed(1)}, Z=${model.offset.z.toFixed(1)})`);
        }
      } catch (err) {
        console.error(`Failed to load file ${file.name}:`, err);
        this.updateStatus(`Error loading ${file.name}`);
      }
    }
  }

  private updateStatus(msg: string): void {
    const statusHud = document.getElementById('status-hud');
    if (statusHud) {
      statusHud.textContent = msg;
      setTimeout(() => {
        if (statusHud.textContent === msg) {
          statusHud.textContent = '';
        }
      }, 5000);
    }
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    const now = performance.now();
    const deltaTime = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.cameraControls.update(deltaTime);
    this.sceneManager.render();
  };
}

// Initialize Application
new App();

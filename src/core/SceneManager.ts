import * as THREE from 'three';
import { SceneContext } from '../tools/ITool';
import { LoadedModel } from '../loaders/PLYLoaderService';
import { LoadedDxf } from '../loaders/DXFLoaderService';
import type { CameraControls } from './CameraControls';
import { EDLShader } from '../rendering/EDLPass';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  public plyPoints: THREE.Points[] = [];
  public dxfPoints: THREE.Points[] = [];
  public dxfLines: THREE.Object3D[] = [];
  public meshLines: THREE.Object3D[] = [];

  private gridHelper: THREE.GridHelper | null = null;
  private currentMinZ: number = 0;
  private container: HTMLElement;

  // Eye-Dome Lighting (EDL) post-processing setup
  private edlEnabled: boolean = false;
  private renderTarget: THREE.WebGLRenderTarget | null = null;
  private edlMaterial: THREE.ShaderMaterial | null = null;
  private edlScene: THREE.Scene | null = null;
  private edlCamera: THREE.OrthographicCamera | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // Enforce Z-Up globally in Three.js
    THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a24);

    // Enable Depth Fog by default
    this.scene.fog = new THREE.FogExp2(0x1a1a24, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    // Default initial camera position looking along +Y in Z-Up
    this.camera.position.set(0, -10, 2);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.initLights();
    this.initGrid(0);
    this.initEDL();
    this.initResizeListener();
  }

  private initLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, -50, 100);
    this.scene.add(dirLight);
  }

  private initGrid(zPos: number): void {
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper);
      this.gridHelper.geometry.dispose();
      (this.gridHelper.material as THREE.Material).dispose();
    }

    // 200m size with 200 divisions = 1m grid squares (Enabled by default)
    const size = 200;
    const divisions = 200;
    this.gridHelper = new THREE.GridHelper(size, divisions, 0x555577, 0x333344);
    this.gridHelper.rotation.x = Math.PI / 2; // Rotate XZ grid to XY plane for Z-Up
    this.gridHelper.position.set(0, 0, zPos);
    this.scene.add(this.gridHelper);
    this.currentMinZ = zPos;
  }

  private initEDL(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Render target with depth texture
    this.renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });
    this.renderTarget.depthTexture = new THREE.DepthTexture(width, height);
    this.renderTarget.depthTexture.format = THREE.DepthFormat;
    this.renderTarget.depthTexture.type = THREE.UnsignedIntType;

    // EDL Material & Quad
    this.edlMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(EDLShader.uniforms),
      vertexShader: EDLShader.vertexShader,
      fragmentShader: EDLShader.fragmentShader,
    });

    this.edlMaterial.uniforms.resolution.value.set(width, height);

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.edlMaterial);
    this.edlScene = new THREE.Scene();
    this.edlScene.add(quad);
    this.edlCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  private updateMinZForObject(object: THREE.Object3D): void {
    const bbox = new THREE.Box3().setFromObject(object);
    if (!bbox.isEmpty()) {
      const objectMinZ = bbox.min.z;
      if (this.plyPoints.length + this.dxfPoints.length + this.dxfLines.length + this.meshLines.length === 1) {
        // First model loaded
        this.initGrid(objectMinZ);
      } else if (objectMinZ < this.currentMinZ) {
        this.initGrid(objectMinZ);
      }
    }
  }

  private initResizeListener(): void {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);

      if (this.renderTarget && this.edlMaterial) {
        this.renderTarget.setSize(width, height);
        this.edlMaterial.uniforms.resolution.value.set(width, height);
      }
    });
  }

  public toggleEDL(): boolean {
    this.edlEnabled = !this.edlEnabled;
    return this.edlEnabled;
  }

  public addPlyModel(model: LoadedModel): void {
    this.scene.add(model.object);
    if (model.isPointCloud && model.object instanceof THREE.Points) {
      this.plyPoints.push(model.object);
    } else if (model.isMesh) {
      this.meshLines.push(model.object);
    }
    this.updateMinZForObject(model.object);
  }

  public addDxfModel(model: LoadedDxf): void {
    this.scene.add(model.object);
    this.dxfPoints.push(...model.dxfPoints);
    this.dxfLines.push(...model.dxfLines);
    this.updateMinZForObject(model.object);
  }

  public getSceneContext(cameraControls?: CameraControls): SceneContext {
    return {
      scene: this.scene,
      cameraControls: cameraControls!,
      plyPoints: this.plyPoints,
      dxfPoints: this.dxfPoints,
      dxfLines: this.dxfLines,
      meshLines: this.meshLines,
    };
  }

  public render(): void {
    if (this.edlEnabled && this.renderTarget && this.edlMaterial && this.edlScene && this.edlCamera) {
      // Pass 1: Render scene to Depth & Color RenderTarget
      this.renderer.setRenderTarget(this.renderTarget);
      this.renderer.render(this.scene, this.camera);
      this.renderer.setRenderTarget(null);

      // Update EDL uniforms
      this.edlMaterial.uniforms.tDiffuse.value = this.renderTarget.texture;
      this.edlMaterial.uniforms.tDepth.value = this.renderTarget.depthTexture;
      this.edlMaterial.uniforms.cameraNear.value = this.camera.near;
      this.edlMaterial.uniforms.cameraFar.value = this.camera.far;

      // Pass 2: Render EDL shader quad to screen
      this.renderer.render(this.edlScene, this.edlCamera);
    } else {
      // Standard Direct Render
      this.renderer.render(this.scene, this.camera);
    }
  }
}

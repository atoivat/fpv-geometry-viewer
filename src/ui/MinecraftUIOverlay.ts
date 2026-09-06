import { MenuStateMachine, MenuState } from './menuStateMachine';
import { HotbarManager } from '../tools/HotbarManager';

export interface UIOverlayCallbacks {
  onLoadFiles: (files: FileList) => void;
  onResume: () => void;
  onStart: () => void;
  onExitToStart: () => void;
  onToggleEDL?: () => void;
}

export class MinecraftUIOverlay {
  private container: HTMLElement;
  private menuManager: MenuStateMachine;
  private hotbarManager: HotbarManager;
  private callbacks: UIOverlayCallbacks;

  private startMenuElem!: HTMLElement;
  private quickMenuElem!: HTMLElement;
  private hotbarElem!: HTMLElement;
  private toolNameBannerElem!: HTMLElement;
  private fileInputElem!: HTMLInputElement;

  constructor(
    container: HTMLElement,
    menuManager: MenuStateMachine,
    hotbarManager: HotbarManager,
    callbacks: UIOverlayCallbacks
  ) {
    this.container = container;
    this.menuManager = menuManager;
    this.hotbarManager = hotbarManager;
    this.callbacks = callbacks;

    this.initDOM();
    this.bindEvents();

    // Subscribe to state changes
    this.menuManager.subscribe((state) => this.renderState(state));
    this.hotbarManager.subscribe((activeIdx, slots) => this.renderHotbar(activeIdx, slots));

    // Render initial state
    this.renderState(this.menuManager.getState());
  }

  private initDOM(): void {
    // Hidden File Input
    this.fileInputElem = document.createElement('input');
    this.fileInputElem.type = 'file';
    this.fileInputElem.id = 'file-input';
    this.fileInputElem.multiple = true;
    this.fileInputElem.accept = '.ply,.dxf';
    this.container.appendChild(this.fileInputElem);

    // Start Menu
    this.startMenuElem = document.createElement('div');
    this.startMenuElem.className = 'mc-overlay';
    this.startMenuElem.innerHTML = `
      <div class="mc-title">FPV GEOMETRY<br/>VISUALIZER</div>
      <div class="mc-panel">
        <button id="btn-start-load" class="mc-button">📁 LOAD FILES (.PLY / .DXF)</button>
        <button id="btn-start-enter" class="mc-button">▶ ENTER VISUALIZER</button>
        <div class="mc-controls-guide">
          <b>CONTROLS:</b><br/>
          • MOUSE: LOOK (PITCH/YAW)<br/>
          • WASD: HORIZONTAL MOVE<br/>
          • SPACE / SHIFT: UP / DOWN<br/>
          • 1-9, 0 / SCROLL: HOTBAR TOOL<br/>
          • L-CLICK / R-CLICK: TOOL ACTION<br/>
          • ESC: PAUSE MENU
        </div>
      </div>
    `;
    this.container.appendChild(this.startMenuElem);

    // Quick Pause Menu
    this.quickMenuElem = document.createElement('div');
    this.quickMenuElem.className = 'mc-overlay';
    this.quickMenuElem.style.display = 'none';
    this.quickMenuElem.innerHTML = `
      <div class="mc-title">VISUALIZER PAUSED</div>
      <div class="mc-panel">
        <button id="btn-pause-resume" class="mc-button">BACK TO VISUALIZER</button>
        <button id="btn-pause-load" class="mc-button">📁 LOAD / ADD FILES</button>
        <button id="btn-pause-edl" class="mc-button">👁️ TOGGLE EYE-DOME LIGHTING (EDL)</button>
        <button id="btn-pause-exit" class="mc-button">EXIT TO MAIN MENU</button>
      </div>
    `;
    this.container.appendChild(this.quickMenuElem);

    // Tool Name Banner
    this.toolNameBannerElem = document.createElement('div');
    this.toolNameBannerElem.id = 'tool-name-banner';
    this.container.appendChild(this.toolNameBannerElem);

    // Hotbar Toolbar
    this.hotbarElem = document.createElement('div');
    this.hotbarElem.id = 'hotbar-container';
    this.container.appendChild(this.hotbarElem);

    this.renderHotbar(this.hotbarManager.getActiveSlotIndex(), this.hotbarManager.getSlots());
  }

  private bindEvents(): void {
    // Start Menu events
    const btnStartLoad = this.startMenuElem.querySelector('#btn-start-load');
    const btnStartEnter = this.startMenuElem.querySelector('#btn-start-enter');

    btnStartLoad?.addEventListener('click', () => this.fileInputElem.click());
    btnStartEnter?.addEventListener('click', () => this.callbacks.onStart());

    // Quick Menu events
    const btnPauseResume = this.quickMenuElem.querySelector('#btn-pause-resume');
    const btnPauseLoad = this.quickMenuElem.querySelector('#btn-pause-load');
    const btnPauseEDL = this.quickMenuElem.querySelector('#btn-pause-edl');
    const btnPauseExit = this.quickMenuElem.querySelector('#btn-pause-exit');

    btnPauseResume?.addEventListener('click', () => this.callbacks.onResume());
    btnPauseLoad?.addEventListener('click', () => this.fileInputElem.click());
    btnPauseEDL?.addEventListener('click', () => this.callbacks.onToggleEDL && this.callbacks.onToggleEDL());
    btnPauseExit?.addEventListener('click', () => this.callbacks.onExitToStart());

    // File Input change
    this.fileInputElem.addEventListener('change', () => {
      if (this.fileInputElem.files && this.fileInputElem.files.length > 0) {
        this.callbacks.onLoadFiles(this.fileInputElem.files);
      }
    });

    // Drag & Drop files
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        this.callbacks.onLoadFiles(e.dataTransfer.files);
      }
    });
  }

  public renderState(state: MenuState): void {
    if (state === MenuState.START_MENU) {
      this.startMenuElem.style.display = 'flex';
      this.quickMenuElem.style.display = 'none';
      this.hotbarElem.style.display = 'none';
      this.toolNameBannerElem.style.display = 'none';
    } else if (state === MenuState.VISUALIZING) {
      this.startMenuElem.style.display = 'none';
      this.quickMenuElem.style.display = 'none';
      this.hotbarElem.style.display = 'flex';
      this.toolNameBannerElem.style.display = 'block';
    } else if (state === MenuState.PAUSED_QUICK_MENU) {
      this.startMenuElem.style.display = 'none';
      this.quickMenuElem.style.display = 'flex';
      this.hotbarElem.style.display = 'flex';
      this.toolNameBannerElem.style.display = 'block';
    }
  }

  public renderHotbar(activeSlotIndex: number, slots: (any | null)[]): void {
    this.hotbarElem.innerHTML = '';

    const activeTool = slots[activeSlotIndex];
    if (activeTool && activeTool.name) {
      this.toolNameBannerElem.textContent = activeTool.name;
      this.toolNameBannerElem.style.opacity = '1';
    } else {
      this.toolNameBannerElem.textContent = '';
      this.toolNameBannerElem.style.opacity = '0';
    }

    slots.forEach((tool, idx) => {
      const slotDiv = document.createElement('div');
      slotDiv.className = `hotbar-slot ${idx === activeSlotIndex ? 'active' : ''}`;

      const slotNumber = document.createElement('span');
      slotNumber.className = 'slot-number';
      slotNumber.textContent = `${(idx + 1) % 10}`;

      slotDiv.appendChild(slotNumber);

      if (tool) {
        const iconSpan = document.createElement('span');
        iconSpan.textContent = tool.icon;
        slotDiv.appendChild(iconSpan);
        slotDiv.title = `${tool.name} (L-Click: +, R-Click: -)`;
      }

      this.hotbarElem.appendChild(slotDiv);
    });
  }
}

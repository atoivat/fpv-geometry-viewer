import { ITool, SceneContext } from './ITool';

export type HotbarChangeListener = (activeSlotIndex: number, slots: (ITool | null)[]) => void;

export class HotbarManager {
  private slots: (ITool | null)[] = new Array(10).fill(null);
  private activeSlotIndex: number = 0;
  private listeners: HotbarChangeListener[] = [];

  public getSlots(): (ITool | null)[] {
    return [...this.slots];
  }

  public getActiveSlotIndex(): number {
    return this.activeSlotIndex;
  }

  public getActiveTool(): ITool | null {
    return this.slots[this.activeSlotIndex];
  }

  public getToolAt(index: number): ITool | null {
    if (index >= 0 && index < 10) {
      return this.slots[index];
    }
    return null;
  }

  public subscribe(listener: HotbarChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.activeSlotIndex, this.slots));
  }

  public registerTool(slotIndex: number, tool: ITool, context: SceneContext): void {
    if (slotIndex >= 0 && slotIndex < 10) {
      this.slots[slotIndex] = tool;
      if (this.activeSlotIndex === slotIndex) {
        tool.activate(context);
      }
      this.notifyListeners();
    }
  }

  public selectSlot(index: number, context: SceneContext): void {
    if (index < 0 || index >= 10 || index === this.activeSlotIndex) return;

    const currentTool = this.getActiveTool();
    if (currentTool) {
      currentTool.deactivate(context);
    }

    this.activeSlotIndex = index;

    const newTool = this.getActiveTool();
    if (newTool) {
      newTool.activate(context);
    }

    this.notifyListeners();
  }

  public selectNextSlot(context: SceneContext): void {
    const nextIndex = (this.activeSlotIndex + 1) % 10;
    this.selectSlot(nextIndex, context);
  }

  public selectPrevSlot(context: SceneContext): void {
    const prevIndex = (this.activeSlotIndex - 1 + 10) % 10;
    this.selectSlot(prevIndex, context);
  }

  public triggerPrimaryAction(context: SceneContext): void {
    const activeTool = this.getActiveTool();
    if (activeTool) {
      activeTool.onPrimaryAction(context);
    }
  }

  public triggerSecondaryAction(context: SceneContext): void {
    const activeTool = this.getActiveTool();
    if (activeTool) {
      activeTool.onSecondaryAction(context);
    }
  }
}

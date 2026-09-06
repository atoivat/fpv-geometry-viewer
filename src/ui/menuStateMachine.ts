export enum MenuState {
  START_MENU = 'START_MENU',
  VISUALIZING = 'VISUALIZING',
  PAUSED_QUICK_MENU = 'PAUSED_QUICK_MENU',
}

export type MenuStateListener = (newState: MenuState) => void;

export class MenuStateMachine {
  private currentState: MenuState = MenuState.START_MENU;
  private listeners: MenuStateListener[] = [];

  public getState(): MenuState {
    return this.currentState;
  }

  public subscribe(listener: MenuStateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private setState(nextState: MenuState): void {
    if (this.currentState !== nextState) {
      this.currentState = nextState;
      this.listeners.forEach((listener) => listener(this.currentState));
    }
  }

  public startVisualizer(): void {
    this.setState(MenuState.VISUALIZING);
  }

  public pauseVisualizer(): void {
    if (this.currentState === MenuState.VISUALIZING) {
      this.setState(MenuState.PAUSED_QUICK_MENU);
    }
  }

  public resumeVisualizer(): void {
    if (this.currentState === MenuState.PAUSED_QUICK_MENU) {
      this.setState(MenuState.VISUALIZING);
    }
  }

  public togglePause(): void {
    if (this.currentState === MenuState.VISUALIZING) {
      this.pauseVisualizer();
    } else if (this.currentState === MenuState.PAUSED_QUICK_MENU) {
      this.resumeVisualizer();
    }
  }

  public exitToStartMenu(): void {
    this.setState(MenuState.START_MENU);
  }
}

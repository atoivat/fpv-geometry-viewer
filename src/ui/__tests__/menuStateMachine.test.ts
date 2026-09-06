import { describe, it, expect, beforeEach } from 'vitest';
import { MenuStateMachine, MenuState } from '../menuStateMachine';

describe('MenuStateMachine', () => {
  let menuManager: MenuStateMachine;

  beforeEach(() => {
    menuManager = new MenuStateMachine();
  });

  it('should start in START_MENU state', () => {
    expect(menuManager.getState()).toBe(MenuState.START_MENU);
  });

  it('should transition from START_MENU to VISUALIZING on startVisualizer()', () => {
    menuManager.startVisualizer();
    expect(menuManager.getState()).toBe(MenuState.VISUALIZING);
  });

  it('should transition from VISUALIZING to PAUSED_QUICK_MENU on pauseVisualizer()', () => {
    menuManager.startVisualizer();
    menuManager.pauseVisualizer();
    expect(menuManager.getState()).toBe(MenuState.PAUSED_QUICK_MENU);
  });

  it('should toggle pause cleanly between VISUALIZING and PAUSED_QUICK_MENU', () => {
    menuManager.startVisualizer();
    menuManager.togglePause();
    expect(menuManager.getState()).toBe(MenuState.PAUSED_QUICK_MENU);

    menuManager.togglePause();
    expect(menuManager.getState()).toBe(MenuState.VISUALIZING);
  });

  it('should transition back to START_MENU on exitToStartMenu()', () => {
    menuManager.startVisualizer();
    menuManager.pauseVisualizer();
    menuManager.exitToStartMenu();
    expect(menuManager.getState()).toBe(MenuState.START_MENU);
  });
});

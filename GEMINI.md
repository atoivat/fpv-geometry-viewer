# FPV Geometry Visualizer - Development Guidelines & Best Practices

## 1. Test-Driven Development (TDD) Workflow
- **Red-Green-Refactor Cycle:** Write a failing test in `Vitest` first for any pure logic (vector math, camera velocity calculations, DXF entity color extraction, tool state selection, menu state manager), then implement the minimal code to pass, then refactor.
- **Test Scope:**
  - **Unit Tests:** Math utilities, camera translation vectors (WASD in Z-Up), tool activation/deactivation, hotbar slot cycling, menu state machine (Start -> Playing -> Quick Menu).
  - **Integration Tests:** DXF entity transformer output, PLY attribute loader logic.

## 2. TypeScript & Code Quality
- **Strict Typing:** Always enable `strict: true` in `tsconfig.json`. Do not use `any`.
- **Interface-Driven Design:** Define explicit interfaces for core components:
  - `ITool`: Interface for hotbar slot tools (`id`, `name`, `activate`, `deactivate`, `onPrimaryAction`, `onSecondaryAction`).
  - `CameraState`: Pitch, yaw, position vectors.
  - `ModelMetadata`: Original bounding box, coordinate offset, entity counts.
  - `MenuState`: Active state enum (`START_MENU`, `PLAYING`, `PAUSED_QUICK_MENU`).
- **Immutability & Pure Functions:** Prefer pure functions for movement vector calculations and coordinate transformations to keep them easy to test.

## 3. WebGL & Three.js Performance Guidelines
- **Z-Up World Coordinates:** Enforce `Object3D.DEFAULT_UP.set(0, 0, 1)` globally before constructing cameras or loading models.
- **Origin Auto-Centering:** On importing geometries with large coordinates:
  1. Compute bounding box / centroid.
  2. Translate coordinates to `(0, 0, 0)`.
  3. Store the centroid offset in model metadata for UI reference.
- **Resource Cleanup & Memory Safety:** Explicitly call `.dispose()` on geometries, materials, and line shaders when clearing scenes or reloading files to avoid WebGL memory leaks.
- **Fat Lines:** Use `Line2`, `LineGeometry`, and `LineMaterial` from `three/addons/lines/` when adjustable line thickness is required.

## 4. UI & Control Architecture
- **Vanilla DOM Overlay & Minecraft Styling:** Maintain zero framework overhead. Keep UI controls, Minecraft-inspired menus (pixel fonts, bevelled buttons, semi-transparent overlays), hotbar rendering, and status overlays in lightweight Vanilla TypeScript modules.
- **Pointer Lock & Menu State Machine:** Handle `pointerlockchange` and `pointerlockerror` events cleanly. When pointer lock is disengaged via `Escape`, seamlessly transition to `PAUSED_QUICK_MENU`.

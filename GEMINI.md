# FPV Geometry Visualizer - Development Guidelines & Best Practices

## 1. Test-Driven Development (TDD) Workflow
- **Red-Green-Refactor Cycle:** Write a failing test in `Vitest` first for any pure logic (vector math, camera velocity calculations, DXF entity color extraction, tool state selection, menu state manager, EDL shader configuration), then implement minimal code to pass, then refactor.
- **Test Scope:**
  - **Unit Tests:** Math utilities, camera translation vectors (WASD in Z-Up), tool activation/deactivate, hotbar slot cycling, menu state machine (Start -> Visualizing -> Quick Menu), EDL shader uniforms.
  - **Integration Tests:** DXF entity transformer output, PLY attribute loader logic, 3D spatial gradient colorizers.

## 2. TypeScript & Code Quality
- **Strict Typing:** Always enable `strict: true` in `tsconfig.json`. Do not use `any`.
- **Interface-Driven Design:** Define explicit interfaces for core components:
  - `ITool`: Interface for hotbar slot tools (`id`, `name`, `icon`, `activate`, `deactivate`, `onPrimaryAction`, `onSecondaryAction`).
  - `CameraState`: Pitch, yaw, position vectors.
  - `ModelMetadata`: Original bounding box, coordinate offset, entity counts.
  - `MenuState`: Active state enum (`START_MENU`, `VISUALIZING`, `PAUSED_QUICK_MENU`).
- **Immutability & Pure Functions:** Prefer pure functions for movement vector calculations and coordinate transformations to keep them easy to test.

## 3. WebGL & Three.js Performance Guidelines
- **Z-Up World Coordinates:** Enforce `Object3D.DEFAULT_UP.set(0, 0, 1)` globally before constructing cameras or loading models.
- **Origin Auto-Centering:** On importing geometries with large coordinates:
  1. Compute bounding box / centroid.
  2. Translate coordinates to `(0, 0, 0)`.
  3. Store the centroid offset in model metadata for UI reference.
- **Eye-Dome Lighting (EDL) Shader:** Use two-pass depth post-processing (`renderTarget` with `DepthTexture`) for silhouette contour shading. Filter out background depth samples ($d \ge 0.98 \times \text{far}$) to prevent scene darkening.
- **Resource Cleanup & Memory Safety:** Explicitly call `.dispose()` on geometries, materials, depth textures, and line shaders when clearing scenes or reloading files to avoid WebGL memory leaks.
- **Fat Lines:** Use `Line2`, `LineGeometry`, and `LineMaterial` from `three/addons/lines/` when adjustable line thickness is required.

## 4. UI & Control Architecture
- **Vanilla DOM Overlay & Pixelated Retro HUD:** Maintain zero framework overhead. Keep UI controls, retro HUD menus (pixel fonts, bevelled buttons, semi-transparent overlays), hotbar rendering, tool name banners, and status overlays in lightweight Vanilla TypeScript modules.
- **Pointer Lock & Menu State Machine:** Handle `pointerlockchange` and `pointerlockerror` events cleanly. When pointer lock is disengaged via `Escape`, seamlessly transition to `PAUSED_QUICK_MENU`.

## 5. Continuous Documentation Rule
- **Always Keep Docs Up-to-Date:** Whenever modifying architecture, adding tools, updating shaders, or altering deployment configurations, immediately update `GEMINI.md`, `REQUIREMENTS.md`, `README.md`, and `walkthrough.md`.

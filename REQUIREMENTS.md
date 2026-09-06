# FPV Mesh & Point Cloud Visualizer - Requirements

## Overview
A simple, fast, and portable web-based tool to visualize 3D meshes and point clouds in a First-Person View (FPV).

## Core Features
- **File Inputs:** 
  - Supports `.ply` (point clouds/meshes) and `.dxf` (CAD drawings).
  - Can receive and process multiple files at once.
  - Client-side loading using standard HTML inputs and `FileReader` (no backend).
- **Coordinate System & Auto-Centering:**
  - **Z-Up Convention:** Default world orientation is Z-Up (`Object3D.DEFAULT_UP.set(0, 0, 1)`).
  - **Precision & Centering:** Auto-center geometry at origin `(0, 0, 0)` upon import to prevent 32-bit GPU floating-point jitter with large coordinates. Retain original coordinate offsets for reference.
- **DXF Parsing:**
  - Basic wireframe geometry support (`LINE`, `LWPOLYLINE`, `ARC`, `CIRCLE`, etc.).
  - Preserves native colors defined per layer/entity within the DXF file.
- **Rendering & Vision:**
  - Hardware-accelerated 3D rendering using Three.js.
  - Frustum culling: The camera sees only what is physically placed before it, and nothing behind it.
- **Physics:**
  - No collision detection. The camera passes freely through all geometries.

## Controls (Minecraft-Style)
- **Mouse:** Rotates the camera (pitch and yaw).
  - Implement pointer lock (cursor capture).
- **WASD (Horizontal Translation):**
  - Translates the camera strictly on the horizontal plane (XY plane in Z-Up).
  - Looking up or down does not alter the movement vector (forward/backward movement remains parallel to the ground).
- **Vertical Translation:**
  - `Space`: Increases Z (moves up).
  - `Shift`: Decreases Z (moves down).

## Toolbar & Modular Tools (Hotbar)
- **UI Structure:** 10-slot modular toolbar anchored at the bottom-center of the screen.
- **Slot Selection:** Number keys (`1`-`9`, `0`) and mouse scroll wheel to switch active slot.
- **Initial Tools:**
  1. **PLY Point Size:** Left-click increases point size; right-click decreases.
  2. **DXF Point Size:** Left-click increases point size; right-click decreases.
  3. **DXF Line Width:** Left-click increases line thickness (using `Line2`/`LineMaterial`); right-click decreases.
  4. **Mesh Wireframe Line Width:** Left-click increases line/wireframe thickness; right-click decreases.
- **Modular Tool Architecture:** Tools implement a standard interface (`activate`, `deactivate`, `onPrimaryAction` [left click], `onSecondaryAction` [right click]).

## Menus & UI Styling (Minecraft-Inspired)
- **Visual Aesthetic:**
  - Minecraft-style pixelated typography, 3D bevelled button borders (dark grey/light grey borders with hover highlights), and dark semi-transparent overlays.
- **Start Menu (Initial Screen):**
  - Shown upon initial application load before entering the 3D scene.
  - Includes logo/title, **Load Files** button / drag-and-drop zone, **Controls Guide**, and **Start Visualizer** button.
- **Quick Menu (Quick Pause Menu):**
  - Triggered by pressing `Escape` during visualizer execution (releases pointer lock).
  - Semi-transparent backdrop overlay over the frozen 3D scene.
  - Buttons: **Back to Visualizer** (re-engages pointer lock), **Load / Add Files**, **Controls / Help**, and **Exit to Start Menu**.

## Tech Stack & Development Requirements
- **Language:** Vanilla TypeScript (Strict type checking, no framework overhead).
- **3D Engine:** Three.js (`three` & `three/addons/...`).
- **File Parsers:** `PLYLoader` (Three.js ecosystem) & `dxf-parser`.
- **Build System:** Vite (Fast ESM bundling, compile to static assets).
- **Testing Framework:** Vitest (Test-Driven Development for camera math, tool state, and geometry parsers).
- **Development Practice:** Test-Driven Development (TDD) — write unit tests before implementation for math, parsers, UI state transitions, and tool state logic.

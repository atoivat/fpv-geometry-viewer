# FPV Mesh & Point Cloud Visualizer - Requirements

## Overview
A simple, fast, and portable web-based tool to visualize 3D meshes and point clouds in a First-Person View (FPV) with retro 3D HUD UI styling. Open-source under the MIT License.

## Core Features
- **File Inputs:** 
  - Supports `.ply` (point clouds/meshes) and `.dxf` (CAD drawings).
  - Can receive and process multiple files at once.
  - Client-side loading using standard HTML inputs and `FileReader` (no backend).
- **Coordinate System & Auto-Centering:**
  - **Z-Up Convention:** Default world orientation is Z-Up (`Object3D.DEFAULT_UP.set(0, 0, 1)`).
  - **Precision & Centering:** Auto-center geometry at origin `(0, 0, 0)` upon import to prevent 32-bit GPU floating-point jitter with large coordinates. Retain original coordinate offsets for reference.
- **Environment & Lighting:**
  - **1m Grid Floor:** 1-meter square grid plane automatically positioned at the lowest $Z_{\min}$ of loaded models (enabled by default).
  - **Depth Fog:** Exponential distance fog (`THREE.FogExp2`) enabled by default.
  - **Eye-Dome Lighting (EDL):** Screen-space post-processing depth shader for silhouette edge highlighting and crevice darkening on monochromatic point clouds.
- **DXF Parsing:**
  - Basic wireframe geometry support (`LINE`, `LWPOLYLINE`, `ARC`, `CIRCLE`, etc.).
  - Preserves native colors defined per layer/entity within the DXF file.
- **Rendering & Vision:**
  - Hardware-accelerated 3D rendering using Three.js.
  - Frustum culling: The camera sees only what is physically placed before it, and nothing behind it.
- **Physics:**
  - No collision detection. The camera passes freely through all geometries.

## Controls (First-Person View / FPS Style)
- **Mouse:** Rotates the camera (pitch and yaw).
  - Implement pointer lock (cursor capture).
- **WASD (Horizontal Translation):**
  - Translates the camera forward (`W`), backward (`S`), right (`D`), and left (`A`) along camera facing direction in horizontal XY plane.
  - Looking up or down does not alter horizontal movement vector.
- **Vertical Translation:**
  - `Space`: Increases Z (moves up).
  - `Shift`: Decreases Z (moves down).

## Toolbar & Modular Tools (Hotbar)
- **UI Structure:** 10-slot modular toolbar anchored at the bottom-center of the screen with active tool name floating banner.
- **Slot Selection:** Number keys (`1`-`9`, `0`) and mouse scroll wheel to switch active slot.
- **Tools Implemented:**
  1. **Colorize Cloud (🎨):** Left-click applies/cycles 3D spatial color gradients (Z-Height $\rightarrow$ Full 3D XYZ$\rightarrow$RGB $\rightarrow$ Rainbow); right-click restores original colors.
  2. **PLY Point Size (🟢):** Left-click increases point size; right-click decreases.
  3. **DXF Point Size (🟡):** Left-click increases point size; right-click decreases.
  4. **DXF Line Width (📏):** Left-click increases line thickness; right-click decreases.
  5. **Mesh Wireframe Width (🕸️):** Left-click increases wireframe thickness; right-click decreases.
  6. **Flight Speed (⚡):** Left-click increases camera speed (`+2.0 m/s`); right-click decreases.

## Menus & UI Styling (Pixelated Retro HUD)
- **Visual Aesthetic:**
  - Retro pixelated typography, 3D bevelled button borders, and dark semi-transparent overlays.
- **Start Menu (Initial Screen):**
  - Title/Logo, **Load Files** button / drag-and-drop zone, **Controls Guide**, and **Start Visualizer** button.
- **Quick Menu (Quick Pause Menu):**
  - Triggered by pressing `Escape` during visualizer execution (releases pointer lock).
  - Buttons: **Back to Visualizer**, **Load / Add Files**, **Eye-Dome Lighting (EDL) Toggle**, and **Exit to Start Menu**.

## Tech Stack & Deployment
- **Language:** Vanilla TypeScript (Strict type checking, no framework overhead).
- **3D Engine:** Three.js (`three` & `three/addons/...`).
- **File Parsers:** `PLYLoader` & `dxf-parser`.
- **Build System:** Vite (`base: './'` for GitHub Pages static hosting).
- **Testing Framework:** Vitest (TDD workflow).
- **Deployment:** GitHub Pages via GitHub Actions workflow (`.github/workflows/deploy.yml`).
- **License:** MIT License.

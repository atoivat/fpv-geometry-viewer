# FPV Mesh & Point Cloud Visualizer

A fast, lightweight, web-based tool for visualizing 3D point clouds (`.ply`), meshes, and CAD drawings (`.dxf`) using Minecraft-inspired First-Person View (FPV) controls and retro UI aesthetics.

---

## Features

- **Client-Side File Parsing**: Drag-and-drop or select multiple `.ply` and `.dxf` files locally with standard browser `FileReader` (zero server upload).
- **Z-Up & Precision Auto-Centering**: Enforces global Z-Up world coordinates and automatically centers large survey/CAD geometries at origin `(0, 0, 0)` to eliminate GPU floating-point precision jitter while retaining coordinate offset metadata.
- **Minecraft FPV Controls**:
  - Mouse pitch & yaw rotation using the Web API Pointer Lock cursor capture.
  - Horizontal `WASD` movement constrained to the ground plane (independent of pitch angle).
  - Vertical `Space` (+Z) and `Shift` (-Z) translation.
- **Minecraft UI & Menu System**:
  - **Start Menu**: Initial screen with controls overview and file loader.
  - **Quick Pause Menu**: Re-engage pointer lock or load additional files (`Escape` key trigger).
  - **10-Slot Modular Hotbar**: Anchor toolbar supporting slot switching via `1`-`9`, `0` keys and mouse scroll wheel.
- **Modular Tools Architecture**:
  - **Slot 1 (🟢)**: PLY Point Size Adjustment (L-Click +, R-Click -)
  - **Slot 2 (🟡)**: DXF Point Size Adjustment (L-Click +, R-Click -)
  - **Slot 3 (📏)**: DXF Line Width Adjustment (L-Click +, R-Click -)
  - **Slot 4 (🕸️)**: Mesh Wireframe Line Width Adjustment (L-Click +, R-Click -)

---

## Tech Stack

- **Language**: Vanilla TypeScript (`strict: true`)
- **3D Engine**: Three.js (`three`)
- **File Parsers**: `PLYLoader` (Three.js ecosystem) & `dxf-parser`
- **Build Tool**: Vite
- **Testing**: Vitest (Test-Driven Development)

---

## Getting Started

### Prerequisites
- Node.js (v18+) & `npm`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/fpv-geometry-visualizer.git
cd fpv-geometry-visualizer

# Install dependencies
npm install
```

### Running Locally

```bash
# Start local development server
npm run dev
```

Open your browser at `http://localhost:5173`.

### Running Tests (TDD Suite)

```bash
# Run unit test suite
npm run test
```

### Production Build

```bash
# Typecheck and bundle static files
npm run build
```

The output will be generated in the `dist/` directory.

---

## Controls Quick Reference

| Action | Control |
|---|---|
| **Look (Pitch / Yaw)** | Mouse Move (Pointer Lock) |
| **Move Horizontal** | `W`, `A`, `S`, `D` |
| **Elevate Up** | `Space` |
| **Elevate Down** | `Left Shift` / `Right Shift` |
| **Select Hotbar Tool** | Keys `1`-`9`, `0` or Mouse Scroll Wheel |
| **Use Selected Tool** | Left-Click (Increase) / Right-Click (Decrease) |
| **Pause / Open Menu** | `Escape` |

---

## Project Structure

```
fpv-geometry-visualizer/
├── src/
│   ├── core/
│   │   ├── CameraControls.ts      # Pointer Lock & WASD Z-Up camera controller
│   │   └── SceneManager.ts        # Three.js Z-Up scene, renderer & lights
│   ├── loaders/
│   │   ├── coordinateCentering.ts # Bounding box auto-centering at (0,0,0)
│   │   ├── PLYLoaderService.ts    # PLY point cloud / mesh loader
│   │   └── DXFLoaderService.ts    # DXF wireframe parser & layer color mapper
│   ├── math/
│   │   └── cameraMath.ts          # Pure velocity math functions for Z-Up
│   ├── tools/
│   │   ├── ITool.ts               # Modular tool interface definition
│   │   ├── HotbarManager.ts       # 10-Slot Hotbar state manager
│   │   └── implementations/       # Point size and line width tools
│   ├── ui/
│   │   ├── menuStateMachine.ts    # UI state transitions (Start / Playing / Paused)
│   │   └── MinecraftUIOverlay.ts  # Vanilla DOM overlay for Minecraft UI
│   ├── main.ts                    # Main application bootstrap
│   └── style.css                  # Pixel font & Minecraft UI styling
├── REQUIREMENTS.md                # Project requirements specification
├── GEMINI.md                      # Development guidelines & TDD best practices
├── package.json
└── vite.config.ts
```

---

## License

MIT

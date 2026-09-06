# FPV Mesh & Point Cloud Visualizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A fast, lightweight, web-based tool for visualizing 3D point clouds (`.ply`), meshes, and CAD drawings (`.dxf`) using Minecraft-inspired First-Person View (FPV) controls, hotbar tools, and retro UI aesthetics. Open-source under the MIT License.

---

## Features

- **Client-Side File Parsing**: Drag-and-drop or select multiple `.ply` and `.dxf` files locally with standard browser `FileReader` (zero server upload required).
- **Z-Up & Precision Auto-Centering**: Enforces global Z-Up world coordinates and automatically centers large survey/CAD geometries at origin `(0, 0, 0)` to eliminate GPU floating-point precision jitter while retaining coordinate offset metadata.
- **1m Grid Floor & Depth Fog**: 1-meter square grid floor automatically positioned at the lowest $Z_{\min}$ of loaded models, coupled with default exponential distance fog (`THREE.FogExp2`).
- **Eye-Dome Lighting (EDL)**: Screen-space post-processing depth shader for silhouette edge highlighting and depth contour shading on monochromatic point clouds.
- **Minecraft FPV Controls**:
  - Mouse pitch & yaw rotation using Pointer Lock API cursor capture.
  - Horizontal `WASD` movement aligned to camera facing direction (independent of pitch angle).
  - Vertical `Space` (+Z) and `Shift` (-Z) translation.
- **Minecraft UI & Menu System**:
  - **Start Menu**: Initial screen with controls overview and file loader.
  - **Quick Pause Menu**: Eye-Dome Lighting toggle, file loading, and exit options (`Escape` key trigger).
  - **10-Slot Modular Hotbar**: Anchor toolbar supporting slot switching via `1`-`9`, `0` keys and mouse scroll wheel with floating tool name banner.
- **Modular Tools Architecture**:
  - **Slot 1 (🎨)**: Colorize Cloud 3D Spatial Gradient (L-Click: Cycle Z-Height / 3D Spatial / Rainbow; R-Click: Restore original colors)
  - **Slot 2 (🟢)**: PLY Point Size Adjustment (L-Click +, R-Click -)
  - **Slot 3 (🟡)**: DXF Point Size Adjustment (L-Click +, R-Click -)
  - **Slot 4 (📏)**: DXF Line Width Adjustment (L-Click +, R-Click -)
  - **Slot 5 (🕸️)**: Mesh Wireframe Line Width Adjustment (L-Click +, R-Click -)
  - **Slot 6 (⚡)**: Flight Speed Adjustment (L-Click +, R-Click -)

---

## Tech Stack

- **Language**: Vanilla TypeScript (`strict: true`)
- **3D Engine**: Three.js (`three`)
- **File Parsers**: `PLYLoader` (Three.js ecosystem) & `dxf-parser`
- **Build Tool**: Vite
- **Testing**: Vitest (Test-Driven Development)
- **Deployment**: GitHub Pages (via GitHub Actions)
- **License**: MIT License

---

## Getting Started

### Prerequisites
- Node.js (v18+) & `npm`

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/fpv-geometry-visualizer.git
cd fpv-geometry-visualizer

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Open browser at `http://localhost:5173`.

### Automated Testing (Vitest TDD Suite)

```bash
npm run test
```

### Production Build

```bash
npm run build
```

The output will be generated in `dist/`.

---

## Controls Quick Reference

| Action | Control |
|---|---|
| **Look (Pitch / Yaw)** | Mouse Move (Pointer Lock) |
| **Move Horizontal** | `W`, `A`, `S`, `D` |
| **Elevate Up** | `Space` |
| **Elevate Down** | `Left Shift` / `Right Shift` |
| **Select Hotbar Tool** | Keys `1`-`9`, `0` or Mouse Scroll Wheel |
| **Use Selected Tool** | Left-Click (Primary) / Right-Click (Secondary) |
| **Pause / Open Menu** | `Escape` |

---

## Deployment to GitHub Pages

This project is configured for automated deployment to GitHub Pages via GitHub Actions:

1. Push your code to GitHub on the `main` branch.
2. In your GitHub repository settings under **Pages**:
   - Set **Source** to **GitHub Actions**.
3. The `.github/workflows/deploy.yml` workflow will automatically build and publish the site.

---

## License

[MIT License](LICENSE) © 2026 Otávio Leite

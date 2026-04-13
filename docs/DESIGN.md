# Design Decisions

## Project Positioning

A pixel-art personal website inspired by games like Terraria, Stardew Valley, and Pokemon. The final vision is an interactive village where visitors can explore and learn about the site owner.

## Tech Stack

| Technology | Reason |
|------------|--------|
| **Phaser 3** | Mature 2D game framework with excellent tilemap support, active community |
| **Vite** | Fast HMR, native TypeScript support, simple configuration |
| **TypeScript** | Type safety, better IDE support, maintainability |
| **GitHub Pages** | Free hosting, simple deployment via GitHub Actions |

## Asset Strategy

**Current Phase**: All graphics are programmatically generated using Phaser Graphics API.

**Future Phase**: Replace with actual pixel art assets (16x16 or 32x32 tiles).

Directories:
- `public/assets/tilesets/` - Terrain tiles
- `public/assets/sprites/` - Character/NPC sprites
- `public/assets/images/` - Other images
- `public/assets/audio/` - Sound effects (reserved)

## Inspirations

- **Terraria** - 2D sandbox exploration
- **Stardew Valley** - Pixel art style, village atmosphere
- **Pokemon** - Top-down exploration, NPC interactions

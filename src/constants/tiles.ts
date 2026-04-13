/**
 * Tile index constants for PokemonLike.png tileset.
 * The tileset is 640x640 pixels = 40 columns x 40 rows of 16x16 tiles.
 * Index = row * 40 + col (0-based, left-to-right, top-to-bottom).
 */

// --- Grass & ground ---
export const GRASS_1 = 1;           // row0 col1: solid green (0,129,0) with subtle specks
export const GRASS_2 = 2;           // row0 col2: solid green (0,129,0) with subtle specks variant
export const GRASS_TALL = 323;      // row8 col3: bright green variant

// --- Path / dirt (yellow sand) ---
export const PATH_H = 160;          // row4 col0: horizontal yellow sand path
export const PATH_V = 200;          // row5 col0: vertical yellow sand path
export const PATH_CENTER = 170;     // row4 col10: sand crossroad
export const PATH_TL = 171;         // path corner top-left
export const PATH_TR = 171;         // path corner top-right
export const PATH_BL = 171;         // path corner bottom-left
export const PATH_BR = 171;         // path corner bottom-right

// --- Trees (uniform dense forest tile for seamless border) ---
export const TREE_TOP_LEFT = 80;    // row2 col0: dark green dense forest
export const TREE_TOP_RIGHT = 80;   // row2 col0: same tile for seamless tiling
export const TREE_BOT_LEFT = 80;    // row2 col0: same tile for seamless tiling
export const TREE_BOT_RIGHT = 80;   // row2 col0: same tile for seamless tiling

// --- Water (teal) ---
export const WATER_1 = 284;         // row7 col4: darker teal water
export const WATER_2 = 364;         // row9 col4: lighter teal water
export const WATER_TL = 284;        // water edge top-left (darker)
export const WATER_TR = 284;        // water edge top-right (darker)
export const WATER_BL = 364;        // water edge bottom-left (lighter, reflection)
export const WATER_BR = 364;        // water edge bottom-right (lighter, reflection)
export const WATER_T = 284;         // water edge top (darker)
export const WATER_B = 364;         // water edge bottom (lighter, reflection)
export const WATER_L = 284;         // water edge left (darker)
export const WATER_R = 284;         // water edge right (darker)

// --- Houses (red roof + gray stone walls) ---
export const HOUSE_TL = 87;         // row2 col7: red roof left
export const HOUSE_TC = 87;         // row2 col7: red roof center
export const HOUSE_TR = 88;         // row2 col8: red roof right
export const HOUSE_ML = 480;        // row12 col0: gray stone wall
export const HOUSE_MC = 480;        // row12 col0: gray stone wall
export const HOUSE_MR = 480;        // row12 col0: gray stone wall
export const HOUSE_BL = 560;        // row14 col0: darker gray base
export const HOUSE_BC = 295;        // row7 col15: reddish-brown door
export const HOUSE_BR = 560;        // row14 col0: darker gray base

// --- Fence (brown) ---
export const FENCE_H = 287;         // row7 col7: dark brown horizontal
export const FENCE_V = 291;         // row7 col11: medium brown vertical
export const FENCE_TL = 287;        // fence corner top-left (H-dominant)
export const FENCE_TR = 291;        // fence corner top-right (V-dominant)
export const FENCE_BL = 291;        // fence corner bottom-left (V-dominant)
export const FENCE_BR = 287;        // fence corner bottom-right (H-dominant)

// --- Flowers / decorations (purple) ---
export const FLOWER_1 = 252;        // row6 col12: lavender
export const FLOWER_2 = 253;        // row6 col13: lavender variant

// --- Collidable tile indices (player cannot walk through these) ---
export const COLLIDABLE_TILES: number[] = [
  // Trees (all parts are solid)
  TREE_TOP_LEFT, TREE_TOP_RIGHT,
  TREE_BOT_LEFT, TREE_BOT_RIGHT,
  // Water
  WATER_1, WATER_2,
  WATER_TL, WATER_TR, WATER_BL, WATER_BR,
  WATER_T, WATER_B, WATER_L, WATER_R,
  // Houses (all parts are solid)
  HOUSE_TL, HOUSE_TC, HOUSE_TR,
  HOUSE_ML, HOUSE_MC, HOUSE_MR,
  HOUSE_BL, HOUSE_BC, HOUSE_BR,
  // Fences
  FENCE_H, FENCE_V,
  FENCE_TL, FENCE_TR, FENCE_BL, FENCE_BR,
];

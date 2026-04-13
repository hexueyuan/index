/**
 * Tile index constants for PokemonLike.png tileset.
 * The tileset is 640x640 pixels = 40 columns x 40 rows of 16x16 tiles.
 * Index = row * 40 + col (0-based, left-to-right, top-to-bottom).
 */

// --- Grass & ground ---
export const GRASS_1 = 240;         // row6 col0: textured grass
export const GRASS_2 = 241;         // row6 col1: bright grass variant
export const GRASS_TALL = 323;      // row8 col3: bright green variant

// --- Path / dirt (yellow sand) ---
export const PATH_H = 160;          // row4 col0: yellow sand path
export const PATH_V = 171;          // row4 col11: sand variant
export const PATH_CENTER = 170;     // row4 col10: sand crossroad
export const PATH_TL = 171;         // path corner top-left
export const PATH_TR = 171;         // path corner top-right
export const PATH_BL = 171;         // path corner bottom-left
export const PATH_BR = 171;         // path corner bottom-right

// --- Trees (2x2, textured dark-green tiles with visible contrast against grass) ---
export const TREE_TOP_LEFT = 320;   // row8 col0: dark canopy with gray/black detail
export const TREE_TOP_RIGHT = 321;  // row8 col1: dark canopy variant
export const TREE_BOT_LEFT = 440;   // row11 col0: tree base with black/gray texture
export const TREE_BOT_RIGHT = 441;  // row11 col1: tree base variant

// --- Water (teal) ---
export const WATER_1 = 284;         // row7 col4: teal water
export const WATER_2 = 364;         // row9 col4: lighter teal water
export const WATER_TL = 284;        // water edge top-left
export const WATER_TR = 284;        // water edge top-right
export const WATER_BL = 284;        // water edge bottom-left
export const WATER_BR = 284;        // water edge bottom-right
export const WATER_T = 284;         // water edge top
export const WATER_B = 284;         // water edge bottom
export const WATER_L = 284;         // water edge left
export const WATER_R = 284;         // water edge right

// --- Houses (red roof + dark gray walls) ---
export const HOUSE_TL = 87;         // row2 col7: red roof left
export const HOUSE_TC = 87;         // row2 col7: red roof center
export const HOUSE_TR = 88;         // row2 col8: red roof right
export const HOUSE_ML = 17;         // row0 col17: dark gray wall left
export const HOUSE_MC = 17;         // row0 col17: dark gray wall center
export const HOUSE_MR = 18;         // row0 col18: dark gray wall right
export const HOUSE_BL = 96;         // row2 col16: dark base left
export const HOUSE_BC = 57;         // row1 col17: black (door)
export const HOUSE_BR = 99;         // row2 col19: dark base right

// --- Fence (brown) ---
export const FENCE_H = 287;         // row7 col7: dark brown
export const FENCE_V = 291;         // row7 col11: medium brown
export const FENCE_TL = 287;        // fence corner top-left
export const FENCE_TR = 287;        // fence corner top-right
export const FENCE_BL = 287;        // fence corner bottom-left
export const FENCE_BR = 287;        // fence corner bottom-right

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

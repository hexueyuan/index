/**
 * Tile index constants for PokemonLike.png tileset.
 * The tileset is 640x640 pixels = 40 columns x 40 rows of 16x16 tiles.
 * Index = row * 40 + col (0-based, left-to-right, top-to-bottom).
 */

// --- Grass & ground ---
export const GRASS_1 = 0;          // row0 col0: plain grass
export const GRASS_2 = 1;          // row0 col1: grass variant
export const GRASS_3 = 2;          // row0 col2: grass variant
export const GRASS_TALL = 3;       // row0 col3: tall grass / flowers

// --- Path / dirt ---
export const PATH_H = 40;         // row1 col0: horizontal path
export const PATH_V = 41;         // row1 col1: vertical path
export const PATH_CENTER = 42;    // row1 col2: path center / crossroad
export const PATH_TL = 80;        // row2 col0: path corner top-left
export const PATH_TR = 81;        // row2 col1: path corner top-right
export const PATH_BL = 82;        // row2 col2: path corner bottom-left
export const PATH_BR = 83;        // row2 col3: path corner bottom-right

// --- Trees ---
export const TREE_TOP_LEFT = 4;    // row0 col4: tree canopy top-left
export const TREE_TOP_RIGHT = 5;   // row0 col5: tree canopy top-right
export const TREE_BOT_LEFT = 44;   // row1 col4: tree trunk bottom-left
export const TREE_BOT_RIGHT = 45;  // row1 col5: tree trunk bottom-right

// --- Water ---
export const WATER_1 = 160;       // row4 col0: water tile
export const WATER_2 = 161;       // row4 col1: water variant
export const WATER_TL = 120;      // row3 col0: water edge top-left
export const WATER_TR = 121;      // row3 col1: water edge top-right
export const WATER_BL = 200;      // row5 col0: water edge bottom-left
export const WATER_BR = 201;      // row5 col1: water edge bottom-right
export const WATER_T = 122;       // row3 col2: water edge top
export const WATER_B = 202;       // row5 col2: water edge bottom
export const WATER_L = 162;       // row4 col2: water edge left
export const WATER_R = 163;       // row4 col3: water edge right

// --- Houses ---
export const HOUSE_TL = 6;        // row0 col6: house top-left
export const HOUSE_TC = 7;        // row0 col7: house top-center
export const HOUSE_TR = 8;        // row0 col8: house top-right
export const HOUSE_ML = 46;       // row1 col6: house middle-left
export const HOUSE_MC = 47;       // row1 col7: house middle-center (door area)
export const HOUSE_MR = 48;       // row1 col8: house middle-right
export const HOUSE_BL = 86;       // row2 col6: house bottom-left
export const HOUSE_BC = 87;       // row2 col7: house bottom-center (door)
export const HOUSE_BR = 88;       // row2 col8: house bottom-right

// --- Fence ---
export const FENCE_H = 9;         // row0 col9: horizontal fence
export const FENCE_V = 49;        // row1 col9: vertical fence
export const FENCE_TL = 10;       // row0 col10: fence corner top-left
export const FENCE_TR = 11;       // row0 col11: fence corner top-right
export const FENCE_BL = 50;       // row1 col10: fence corner bottom-left
export const FENCE_BR = 51;       // row1 col11: fence corner bottom-right

// --- Flowers / decorations ---
export const FLOWER_1 = 12;       // row0 col12: flower patch
export const FLOWER_2 = 13;       // row0 col13: flower variant

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

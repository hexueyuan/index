import {
  GRASS_1,
  GRASS_2,
  GRASS_TALL,
  PATH_H,
  PATH_V,
  PATH_CENTER,
  PATH_TL,
  PATH_TR,
  PATH_BL,
  PATH_BR,
  TREE_TOP_LEFT,
  TREE_TOP_RIGHT,
  TREE_BOT_LEFT,
  TREE_BOT_RIGHT,
  WATER_1,
  WATER_2,
  WATER_TL,
  WATER_TR,
  WATER_BL,
  WATER_BR,
  WATER_T,
  WATER_B,
  WATER_L,
  WATER_R,
  HOUSE_TL,
  HOUSE_TC,
  HOUSE_TR,
  HOUSE_ML,
  HOUSE_MC,
  HOUSE_MR,
  HOUSE_BL,
  HOUSE_BC,
  HOUSE_BR,
  FENCE_H,
  FENCE_V,
  FENCE_TL,
  FENCE_TR,
  FENCE_BL,
  FENCE_BR,
  FLOWER_1,
  FLOWER_2,
} from '../constants/tiles';

// Shorthand aliases for readability
const G1 = GRASS_1;
const G2 = GRASS_2;
const GT = GRASS_TALL;
const PH = PATH_H;
const PV = PATH_V;
const PC = PATH_CENTER;
const PTL = PATH_TL;
const PTR = PATH_TR;
const PBL = PATH_BL;
const PBR = PATH_BR;
const TTL = TREE_TOP_LEFT;
const TTR = TREE_TOP_RIGHT;
const TBL = TREE_BOT_LEFT;
const TBR = TREE_BOT_RIGHT;
const W1 = WATER_1;
const W2 = WATER_2;
const WTL = WATER_TL;
const WTR = WATER_TR;
const WBL = WATER_BL;
const WBR = WATER_BR;
const WT = WATER_T;
const WB = WATER_B;
const WL = WATER_L;
const WR = WATER_R;
const HTL = HOUSE_TL;
const HTC = HOUSE_TC;
const HTR = HOUSE_TR;
const HML = HOUSE_ML;
const HMC = HOUSE_MC;
const HMR = HOUSE_MR;
const HBL = HOUSE_BL;
const HBC = HOUSE_BC;
const HBR = HOUSE_BR;
const FH = FENCE_H;
const FV = FENCE_V;
const FTL = FENCE_TL;
const FTR = FENCE_TR;
const FBL = FENCE_BL;
const FBR = FENCE_BR;
const F1 = FLOWER_1;
const F2 = FLOWER_2;

/**
 * Village map: 50 columns x 40 rows.
 * Each value is a tile index into PokemonLike.png.
 *
 * Layout concept:
 * - Outer border: 2-tile-thick tree wall
 * - Central area: grass fields with paths
 * - 3 houses scattered around the village
 * - A pond in the southeast area
 * - Fence-enclosed garden in the southwest
 * - Paths connecting all areas
 * - Scattered flowers and tall grass
 */
export const VILLAGE_MAP: number[][] = [
  // Row 0: top tree border
  [TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR],
  // Row 1: bottom of top tree border
  [TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR],
  // Row 2: second tree border row (top)
  [TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR],
  // Row 3: second tree border row (bottom)
  [TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR],
  // Row 4: left/right tree wall + grass interior, house 1 top row
  [TTL,TTR,TTL,TTR, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2,HTL,HTC,HTR, G1, G2, G1, G1, G1, G2, G1, G1, G1, G2, G1, G1, G1,HTL,HTC,HTR, G1, G2, G1, G2, G1, G1, G1, G2, G1, G1, G2, G1, G2,TTL,TTR,TTL,TTR],
  // Row 5: house 1 middle row
  [TBL,TBR,TBL,TBR, G1, G1, G2, G1, G1, G2, G1, G2, G1, G1,HML,HMC,HMR, G1, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1,HML,HMC,HMR, G2, G1, G2, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1,TBL,TBR,TBL,TBR],
  // Row 6: house 1 bottom row + path start
  [TTL,TTR,TTL,TTR, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1,HBL,HBC,HBR, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1,HBL,HBC,HBR, G1, G2, G1, G2, G1, G2, G1, G2, G1, G2, G1, G2, G1,TTL,TTR,TTL,TTR],
  // Row 7: path going south from houses
  [TBL,TBR,TBL,TBR, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, PV, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, PV, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1,TBL,TBR,TBL,TBR],
  // Row 8: path + grass
  [TTL,TTR,TTL,TTR, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, PV, G2, G1, G1, G2, G1, G1, G2, G1, G1, G1, G1, G2, G1, G1, G2, PV, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2,TTL,TTR,TTL,TTR],
  // Row 9: horizontal path connecting houses
  [TBL,TBR,TBL,TBR, G1, G2, G1, G2, G1, G1,PTL,PH, PH, PH, PH, PC, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PC, PH, PH, PH, PH, PH, PH,PTR, G1, G2, G1, G2, G1, G2, G1,TBL,TBR,TBL,TBR],
  // Row 10: path going south
  [TTL,TTR,TTL,TTR, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, PV, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G1, PV, G1, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2,TTL,TTR,TTL,TTR],
  // Row 11: grass + scattered flowers
  [TBL,TBR,TBL,TBR, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2, PV, G2, G1, F1, G1, G2, G1, F2, G1, G2, G1, G2, G1, G1, G2, G1, PV, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G1,TBL,TBR,TBL,TBR],
  // Row 12: grass + tree cluster + path
  [TTL,TTR,TTL,TTR, G1, G2, G1, G1,TTL,TTR, G1, G1, G2, G1, G1, PV, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, PV, G1, G2, G1, G1, G2,TTL,TTR, G1, G2, G1, G2, G1, G2, G1,TTL,TTR,TTL,TTR],
  // Row 13: tree bottoms + path
  [TBL,TBR,TBL,TBR, G2, G1, G2, G1,TBL,TBR, G2, G1, G1, G2, G1, PV, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, PV, G2, G1, G2, G1, G1,TBL,TBR, G2, G1, G2, G1, G2, G1, G2,TBL,TBR,TBL,TBR],
  // Row 14: main horizontal path (central road)
  [TTL,TTR,TTL,TTR,PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PC, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PC, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH,TTL,TTR,TTL,TTR],
  // Row 15: path + grass
  [TBL,TBR,TBL,TBR, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, G2, PV, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, PV, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G2,TBL,TBR,TBL,TBR],
  // Row 16: grass + tall grass
  [TTL,TTR,TTL,TTR, G2, G1, GT, G1, G2, G1, G2, G1, G1, G2, G1, PV, G2, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G2, G1, G1, G2, PV, G2, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1,TTL,TTR,TTL,TTR],
  // Row 17: fence garden (southwest) + path + grass
  [TBL,TBR,TBL,TBR, G1, G2, G1, G2,FTL,FH, FH, FH, FH,FTR, G1, PV, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, PV, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G2, G1, G1, G2,TBL,TBR,TBL,TBR],
  // Row 18: fence garden interior
  [TTL,TTR,TTL,TTR, G1, G1, G2, G1,FV, F1, F2, F1, F2,FV, G2, PV, G2, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G2, PV, G2, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G2, G1, G1,TTL,TTR,TTL,TTR],
  // Row 19: fence garden interior + flowers
  [TBL,TBR,TBL,TBR, G2, G1, G1, G2,FV, F2, F1, F2, F1,FV, G1, PV, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, PV, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G2,TBL,TBR,TBL,TBR],
  // Row 20: fence garden bottom + path fork south
  [TTL,TTR,TTL,TTR, G1, G2, G1, G1,FBL,FH, FH, FH, FH,FBR, G2,PBL,PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH,PBR, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1,TTL,TTR,TTL,TTR],
  // Row 21: grass
  [TBL,TBR,TBL,TBR, G2, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1,TBL,TBR,TBL,TBR],
  // Row 22: grass + house 3
  [TTL,TTR,TTL,TTR, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, G1,HTL,HTC,HTR, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G2,TTL,TTR,TTL,TTR],
  // Row 23: house 3 middle
  [TBL,TBR,TBL,TBR, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1,HML,HMC,HMR, G2, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G2, G1,TBL,TBR,TBL,TBR],
  // Row 24: house 3 bottom + path to house
  [TTL,TTR,TTL,TTR, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2,HBL,HBC,HBR, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1,TTL,TTR,TTL,TTR],
  // Row 25: grass + path from house 3
  [TBL,TBR,TBL,TBR, G2, G1, G2, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2, PV, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1,TBL,TBR,TBL,TBR],
  // Row 26: pond area (northeast of lower section)
  [TTL,TTR,TTL,TTR, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2,PH, PH, PH, PH, PH, PH, PH, PC, PH, PH, PH, PH, PH, PH, PH, G1, G2, G1, G1,WTL,WT, WT,WTR, G1, G2, G1, G1, G2, G1, G2,TTL,TTR,TTL,TTR],
  // Row 27: pond middle
  [TBL,TBR,TBL,TBR, G2, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, PV, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1,WL, W1, W2,WR, G2, G1, G2, G1, G1, G2, G1,TBL,TBR,TBL,TBR],
  // Row 28: pond middle
  [TTL,TTR,TTL,TTR, G1, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G1, G2, G1, G2, G1, G1, G2, PV, G2, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2,WL, W2, W1,WR, G1, G2, G1, G2, G1, G1, G2,TTL,TTR,TTL,TTR],
  // Row 29: pond bottom
  [TBL,TBR,TBL,TBR, G2, G1, G1, G2, G1, G1, G2, G1, G1, G1, G2, G1, G2, G1, G2, G1, G2, G1, G1, PV, G1, G1, G2, G1, G2, G1, G2, G1, G2, G1, G1,WBL,WB, WB,WBR, G2, G1, G1, G2, G1, G2, G1,TBL,TBR,TBL,TBR],
  // Row 30: grass + scattered trees
  [TTL,TTR,TTL,TTR, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, PV, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G2, G1, G2, G1, G2, G1, G1,TTL,TTR,TTL,TTR],
  // Row 31: path and trees
  [TBL,TBR,TBL,TBR, G2, G1, G2,TTL,TTR, G1, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1,PTL,PC,PTR, G1, G2, G1, G1, G2, G1, G2, G1, G1,TTL,TTR, G2, G1, G2, G1, G2, G1, G1, G2, G1, G2,TBL,TBR,TBL,TBR],
  // Row 32: tree bottoms
  [TTL,TTR,TTL,TTR, G1, G2, G1,TBL,TBR, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1,TBL,TBR, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1,TTL,TTR,TTL,TTR],
  // Row 33: grass + flowers
  [TBL,TBR,TBL,TBR, G2, G1, G2, G1, G2, G1, G2, G1, F1, G2, G1, G2, G1, G2, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, F2, G1, G2, G1, G2, G1, G2, G1,TBL,TBR,TBL,TBR],
  // Row 34: grass
  [TTL,TTR,TTL,TTR, G1, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2,TTL,TTR,TTL,TTR],
  // Row 35: grass
  [TBL,TBR,TBL,TBR, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G1, G2, G1, G1, G2, G1, G1, G2, G1, G2, G1, G2, G1, G1,TBL,TBR,TBL,TBR],
  // Row 36: bottom tree border top (row 1 of 4)
  [TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR],
  // Row 37: bottom tree border
  [TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR],
  // Row 38: bottom tree border
  [TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR,TTL,TTR],
  // Row 39: bottom tree border bottom
  [TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR,TBL,TBR],
];

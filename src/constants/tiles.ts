export const TileType = {
  Air: 0,
  Ground: 1,
  Border: 2,
} as const;

export const TILE_TEXTURES: Record<number, string> = {
  [TileType.Air]: 'tile_air',
  [TileType.Ground]: 'tile_ground',
  [TileType.Border]: 'tile_border',
};

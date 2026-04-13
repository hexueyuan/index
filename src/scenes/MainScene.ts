import Phaser from 'phaser';
import { Player, Direction } from '../objects/Player';
import { TileType, TILE_TEXTURES } from '../constants/tiles';

export interface GameInput {
  pressKey: (dir: string) => void;
  releaseKey: (dir: string) => void;
}

declare global {
  interface Window {
    __gameInput?: GameInput;
  }
}

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private readonly TILE_SIZE = 16;
  private readonly SCALE = 2;
  private readonly DISPLAY_TILE_SIZE = this.TILE_SIZE * this.SCALE;
  private readonly MAP_WIDTH = 25;
  private readonly MAP_HEIGHT = 19;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {}

  create(): void {
    this.generateTileTextures();
    this.generatePlayerTexture();

    const mapData = this.createMapData();
    this.renderMap(mapData);

    const worldWidth = this.MAP_WIDTH * this.DISPLAY_TILE_SIZE;
    const worldHeight = this.MAP_HEIGHT * this.DISPLAY_TILE_SIZE;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.player = new Player(this, worldWidth / 2, worldHeight / 2 - 64);

    window.__gameInput = {
      pressKey: (dir) => this.player.pressVirtualKey(dir as Direction),
      releaseKey: (dir) => this.player.releaseVirtualKey(dir as Direction),
    };
  }

  private generateTileTextures(): void {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x4a7c59);
    graphics.fillRect(0, 0, this.TILE_SIZE, this.TILE_SIZE);
    graphics.fillStyle(0x6aab79);
    graphics.fillRect(0, 0, this.TILE_SIZE, 3);
    graphics.fillStyle(0x5a8c69);
    graphics.fillRect(2, 4, 2, 2);
    graphics.fillRect(10, 6, 2, 2);
    graphics.fillRect(6, 10, 2, 2);
    graphics.generateTexture('tile_ground', this.TILE_SIZE, this.TILE_SIZE);
    graphics.clear();

    graphics.fillStyle(0x2d4a2f);
    graphics.fillRect(0, 0, this.TILE_SIZE, this.TILE_SIZE);
    graphics.fillStyle(0x3d5a3f);
    graphics.fillRect(1, 1, 6, 6);
    graphics.fillRect(9, 9, 6, 6);
    graphics.fillStyle(0x1d3a1f);
    graphics.fillRect(8, 1, 7, 7);
    graphics.fillRect(1, 8, 7, 7);
    graphics.generateTexture('tile_border', this.TILE_SIZE, this.TILE_SIZE);
    graphics.clear();

    graphics.fillStyle(0x87ceeb);
    graphics.fillRect(0, 0, this.TILE_SIZE, this.TILE_SIZE);
    graphics.fillStyle(0x9dd8ef);
    graphics.fillRect(0, 0, this.TILE_SIZE, 4);
    graphics.generateTexture('tile_air', this.TILE_SIZE, this.TILE_SIZE);

    graphics.destroy();
  }

  private generatePlayerTexture(): void {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x4488ff);
    graphics.fillRect(0, 0, this.TILE_SIZE, this.TILE_SIZE);
    graphics.fillStyle(0x2266cc);
    graphics.fillRect(0, 0, this.TILE_SIZE, 1);
    graphics.fillRect(0, 0, 1, this.TILE_SIZE);
    graphics.fillRect(this.TILE_SIZE - 1, 0, 1, this.TILE_SIZE);
    graphics.fillRect(0, this.TILE_SIZE - 1, this.TILE_SIZE, 1);
    graphics.fillStyle(0x66aaff);
    graphics.fillRect(3, 3, 4, 4);
    graphics.fillRect(9, 3, 4, 4);
    graphics.fillStyle(0x000033);
    graphics.fillRect(4, 4, 2, 2);
    graphics.fillRect(10, 4, 2, 2);
    graphics.fillStyle(0x003366);
    graphics.fillRect(5, 10, 6, 1);
    graphics.fillRect(4, 9, 1, 1);
    graphics.fillRect(11, 9, 1, 1);

    graphics.generateTexture('player', this.TILE_SIZE, this.TILE_SIZE);
    graphics.destroy();
  }

  private createMapData(): number[][] {
    const map: number[][] = [];

    for (let y = 0; y < this.MAP_HEIGHT; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.MAP_WIDTH; x++) {
        const isTopBorder = y === 0;
        const isBottomBorder = y === this.MAP_HEIGHT - 1;
        const isLeftBorder = x === 0;
        const isRightBorder = x === this.MAP_WIDTH - 1;
        const isGround = y >= this.MAP_HEIGHT - 4;

        if (isTopBorder || isLeftBorder || isRightBorder || isBottomBorder) {
          row.push(TileType.Border);
        } else if (isGround) {
          row.push(y === this.MAP_HEIGHT - 4 ? TileType.Ground : TileType.Border);
        } else {
          row.push(TileType.Air);
        }
      }
      map.push(row);
    }

    this.addTerrainFeatures(map);
    return map;
  }

  private addTerrainFeatures(map: number[][]): void {
    for (let x = 3; x <= 7; x++) {
      map[10][x] = TileType.Ground;
      map[11][x] = TileType.Border;
    }

    for (let x = 17; x <= 22; x++) {
      map[8][x] = TileType.Ground;
      map[9][x] = TileType.Border;
    }

    map[this.MAP_HEIGHT - 5][11] = TileType.Ground;
    map[this.MAP_HEIGHT - 5][12] = TileType.Ground;
    map[this.MAP_HEIGHT - 5][13] = TileType.Ground;
    map[this.MAP_HEIGHT - 6][12] = TileType.Ground;

    for (let y = this.MAP_HEIGHT - 7; y < this.MAP_HEIGHT - 4; y++) {
      map[y][3] = TileType.Border;
    }
    map[this.MAP_HEIGHT - 8][3] = TileType.Ground;
    map[this.MAP_HEIGHT - 7][2] = TileType.Ground;
    map[this.MAP_HEIGHT - 7][4] = TileType.Ground;

    for (let y = this.MAP_HEIGHT - 7; y < this.MAP_HEIGHT - 4; y++) {
      map[y][21] = TileType.Border;
    }
    map[this.MAP_HEIGHT - 8][21] = TileType.Ground;
    map[this.MAP_HEIGHT - 7][20] = TileType.Ground;
    map[this.MAP_HEIGHT - 7][22] = TileType.Ground;
  }

  private renderMap(mapData: number[][]): void {
    for (let y = 0; y < mapData.length; y++) {
      for (let x = 0; x < mapData[y].length; x++) {
        const textureKey = TILE_TEXTURES[mapData[y][x]] ?? 'tile_air';
        const posX = x * this.DISPLAY_TILE_SIZE + this.DISPLAY_TILE_SIZE / 2;
        const posY = y * this.DISPLAY_TILE_SIZE + this.DISPLAY_TILE_SIZE / 2;
        this.add.image(posX, posY, textureKey).setScale(this.SCALE);
      }
    }
  }

  update(): void {
    this.player.update();
  }
}

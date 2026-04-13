import Phaser from 'phaser';
import { Player, Direction } from '../objects/Player';
import { COLLIDABLE_TILES } from '../constants/tiles';
import { VILLAGE_MAP } from '../maps/villageMap';

export interface GameInput {
  pressKey: (dir: Direction) => void;
  releaseKey: (dir: Direction) => void;
}

declare global {
  interface Window {
    __gameInput?: GameInput;
  }
}

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private mapLayer!: Phaser.Tilemaps.TilemapLayer;

  private readonly TILE_SIZE = 16;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    const ts = this.TILE_SIZE;
    this.load.spritesheet('tileset', 'assets/images/PokemonLike.png', {
      frameWidth: ts,
      frameHeight: ts,
    });
    this.load.spritesheet('character', 'assets/sprites/character.png', {
      frameWidth: ts,
      frameHeight: ts,
    });
  }

  create(): void {
    // Create tilemap from 2D array data
    const map = this.make.tilemap({
      data: VILLAGE_MAP,
      tileWidth: this.TILE_SIZE,
      tileHeight: this.TILE_SIZE,
    });

    // Add the tileset image - first param is tileset name, second is cache key
    const tileset = map.addTilesetImage('tileset', 'tileset');
    if (!tileset) {
      console.error('Failed to add tileset image');
      return;
    }

    // Create the map layer
    const layer = map.createLayer(0, tileset, 0, 0);
    if (!layer) {
      console.error('Failed to create map layer');
      return;
    }
    this.mapLayer = layer;

    // Set collision on obstacle tiles
    this.mapLayer.setCollision(COLLIDABLE_TILES);

    const mapPixelWidth = VILLAGE_MAP[0].length * this.TILE_SIZE;
    const mapPixelHeight = VILLAGE_MAP.length * this.TILE_SIZE;

    // Set world bounds to original pixel size
    this.physics.world.setBounds(0, 0, mapPixelWidth, mapPixelHeight);

    // Create character animations from spritesheet (4 cols x 5 rows)
    const animDefs = [
      { key: 'idle', start: 0, end: 3, frameRate: 4 },
      { key: 'walk_down', start: 4, end: 7, frameRate: 8 },
      { key: 'walk_up', start: 8, end: 11, frameRate: 8 },
      { key: 'walk_left', start: 12, end: 15, frameRate: 8 },
      { key: 'walk_right', start: 16, end: 19, frameRate: 8 },
    ];
    for (const def of animDefs) {
      this.anims.create({
        key: def.key,
        frames: this.anims.generateFrameNumbers('character', { start: def.start, end: def.end }),
        frameRate: def.frameRate,
        repeat: -1,
      });
    }

    // Create player at center of map
    this.player = new Player(this, mapPixelWidth / 2, mapPixelHeight / 2 - 64);

    // Add collision between player and map layer
    this.physics.add.collider(this.player, this.mapLayer);

    // Set up camera with zoom instead of scale
    this.cameras.main.setZoom(2);
    this.cameras.main.setBounds(0, 0, mapPixelWidth, mapPixelHeight);
    this.cameras.main.startFollow(this.player);

    // Expose virtual input for mobile D-pad
    window.__gameInput = {
      pressKey: (dir) => this.player.pressVirtualKey(dir),
      releaseKey: (dir) => this.player.releaseVirtualKey(dir),
    };
  }

  update(): void {
    this.player.update();
  }
}

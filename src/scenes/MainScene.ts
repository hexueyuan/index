import Phaser from 'phaser';
import { Player, Direction } from '../objects/Player';

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
  private mapLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  private readonly TILE_SIZE = 16;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    const ts = this.TILE_SIZE;
    // Load Tiled JSON map
    this.load.tilemapTiledJSON('village', 'assets/maps/village.tmj');
    // Load tileset image
    this.load.image('PokemonLike', 'assets/images/PokemonLike.png');
    // Load character spritesheet
    this.load.spritesheet('character', 'assets/sprites/character.png', {
      frameWidth: ts,
      frameHeight: ts,
    });
  }

  create(): void {
    // Create tilemap from Tiled JSON
    const map = this.make.tilemap({ key: 'village' });

    // Add tileset - first param must match the tileset name in Tiled
    const tileset = map.addTilesetImage('PokemonLike', 'PokemonLike');
    if (!tileset) {
      console.error('Failed to add tileset image');
      return;
    }

    // Create all tile layers from the Tiled map
    for (const layerData of map.layers) {
      const layer = map.createLayer(layerData.name, tileset, 0, 0);
      if (layer) {
        this.mapLayers.push(layer);
        // Set collision on all non-empty tiles in the collision layer
        if (layerData.name === 'collision') {
          layer.setCollisionByExclusion([-1, 0]);
        }
      }
    }

    const mapPixelWidth = map.widthInPixels;
    const mapPixelHeight = map.heightInPixels;

    // Set world bounds
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

    // Add collision between player and all map layers
    for (const layer of this.mapLayers) {
      this.physics.add.collider(this.player, layer);
    }

    // Set up camera with zoom
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

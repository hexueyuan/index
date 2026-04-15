import Phaser from 'phaser';
import { Player, Direction } from '../objects/Player';
import { DialogBox, DialogLine } from '../ui/DialogBox';
import { InspectPanel, InspectContent } from '../ui/InspectPanel';

export interface GameInput {
  pressKey: (dir: Direction) => void;
  releaseKey: (dir: Direction) => void;
  pressAction: () => void;
}

declare global {
  interface Window {
    __gameInput?: GameInput;
  }
}

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private mapLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private dialogBox!: DialogBox;
  private inspectPanel!: InspectPanel;
  private interactiveObjects: { x: number; y: number; dialog?: DialogLine[]; inspect?: InspectContent }[] = [];

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

    // Create all tile layers and enable collision via per-tile property
    // Layers named "above" (or inside an "above" group) render on top of the player.
    const aboveLayers: Phaser.Tilemaps.TilemapLayer[] = [];
    for (const layerData of map.layers) {
      const layer = map.createLayer(layerData.name, tileset, 0, 0);
      if (layer) {
        this.mapLayers.push(layer);
        layer.setCollisionByProperty({ collides: true });
        if (layerData.name.startsWith('above')) {
          aboveLayers.push(layer);
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

    // Render "above" layers on top of the player (e.g. rooftops, tree canopies)
    this.player.setDepth(10);
    for (const layer of aboveLayers) {
      layer.setDepth(20);
    }

    // Add collision between player and all map layers
    for (const layer of this.mapLayers) {
      this.physics.add.collider(this.player, layer);
    }

    // Parse interactive objects from Tiled object layer
    const objectLayer = map.getObjectLayer('interactions');
    if (objectLayer) {
      for (const obj of objectLayer.objects) {
        const type = obj.type;  // "class" in Tiled 1.9+ maps to obj.type in Phaser
        const textProp = obj.properties?.find(
          (p: { name: string; value: unknown }) => p.name === 'text'
        );
        if (type === 'sign' && textProp) {
          this.interactiveObjects.push({
            x: obj.x!,
            y: obj.y!,
            inspect: { type: 'sign', title: obj.name || '告示牌', text: String(textProp.value) },
          });
        }
      }
    }

    // Set up camera with zoom
    this.cameras.main.setZoom(2);
    this.cameras.main.setBounds(0, 0, mapPixelWidth, mapPixelHeight);
    this.cameras.main.startFollow(this.player);

    // Expose virtual input for mobile D-pad
    window.__gameInput = {
      pressKey: (dir) => this.player.pressVirtualKey(dir),
      releaseKey: (dir) => this.player.releaseVirtualKey(dir),
      pressAction: () => this.handleAction(),
    };

    // Create dialog box
    this.dialogBox = new DialogBox(
      this,
      () => this.player.lock(),
      () => this.player.unlock()
    );

    // Create inspect panel
    this.inspectPanel = new InspectPanel(
      this,
      () => this.player.lock(),
      () => this.player.unlock()
    );

    // Keyboard input: Space/Enter/A to interact or advance dialog
    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const enterKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const aKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const handleKey = () => this.handleAction();
    spaceKey?.on('down', handleKey);
    enterKey?.on('down', handleKey);
    aKey?.on('down', handleKey);
  }

  private handleAction(): void {
    if (this.dialogBox.isActive) {
      this.dialogBox.advance();
    } else if (this.inspectPanel.isActive) {
      this.inspectPanel.close();
    } else {
      this.tryInteract();
    }
  }

  private tryInteract(): void {
    if (this.dialogBox.isActive) return;
    if (this.inspectPanel.isActive) return;

    // Compute the point the player is facing
    const ts = this.TILE_SIZE;
    let targetX = this.player.x;
    let targetY = this.player.y;
    switch (this.player.facing) {
      case 'up':    targetY -= ts; break;
      case 'down':  targetY += ts; break;
      case 'left':  targetX -= ts; break;
      case 'right': targetX += ts; break;
    }

    // Check if any interactive object is near the target point
    for (const obj of this.interactiveObjects) {
      const dist = Phaser.Math.Distance.Between(targetX, targetY, obj.x, obj.y);
      if (dist <= ts) {
        if (obj.inspect) {
          this.inspectPanel.show(obj.inspect);
        } else if (obj.dialog) {
          this.dialogBox.show(obj.dialog);
        }
        return;
      }
    }
  }

  update(): void {
    this.player.update();
  }
}

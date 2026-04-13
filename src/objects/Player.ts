import Phaser from 'phaser';

export type Direction = 'up' | 'down' | 'left' | 'right';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private virtualKeys = { up: false, down: false, left: false, right: false };
  private readonly SPEED = 150;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setScale(2);
    this.cursors = scene.input.keyboard?.createCursorKeys();
  }

  pressVirtualKey(dir: Direction): void {
    this.virtualKeys[dir] = true;
  }

  releaseVirtualKey(dir: Direction): void {
    this.virtualKeys[dir] = false;
  }

  update(): void {
    let vx = 0;
    let vy = 0;

    if (this.cursors?.left.isDown || this.virtualKeys.left) {
      vx = -this.SPEED;
    } else if (this.cursors?.right.isDown || this.virtualKeys.right) {
      vx = this.SPEED;
    }

    if (this.cursors?.up.isDown || this.virtualKeys.up) {
      vy = -this.SPEED;
    } else if (this.cursors?.down.isDown || this.virtualKeys.down) {
      vy = this.SPEED;
    }

    this.setVelocity(vx, vy);
  }
}

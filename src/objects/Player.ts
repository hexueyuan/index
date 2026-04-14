import Phaser from 'phaser';

export type Direction = 'up' | 'down' | 'left' | 'right';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private virtualKeys = { up: false, down: false, left: false, right: false };
  private readonly SPEED = 150;
  private _locked: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'character', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.cursors = scene.input.keyboard?.createCursorKeys();
    if (!this.cursors) {
      console.warn('Keyboard input not available, use virtual D-pad for controls.');
    }
    this.play('idle');
  }

  pressVirtualKey(dir: Direction): void {
    this.virtualKeys[dir] = true;
  }

  releaseVirtualKey(dir: Direction): void {
    this.virtualKeys[dir] = false;
  }

  lock(): void {
    this._locked = true;
    this.setVelocity(0, 0);
    this.play('idle');
  }

  unlock(): void {
    this._locked = false;
  }

  get locked(): boolean {
    return this._locked;
  }

  update(): void {
    if (this._locked) {
      return;
    }

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

    // Play direction-aware walk animation (avoid redundant play calls)
    let animKey: string;
    if (vx < 0) {
      animKey = 'walk_left';
    } else if (vx > 0) {
      animKey = 'walk_right';
    } else if (vy < 0) {
      animKey = 'walk_up';
    } else if (vy > 0) {
      animKey = 'walk_down';
    } else {
      animKey = 'idle';
    }

    if (this.anims.currentAnim?.key !== animKey) {
      this.play(animKey);
    }
  }
}

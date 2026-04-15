import Phaser from 'phaser';

export type DialogRole = 'player' | 'npc';

export interface DialogLine {
  speaker: string;
  role: DialogRole;
  text: string;
}

type DialogState = 'IDLE' | 'TYPING' | 'PAGE_COMPLETE';

const COLORS = {
  player: '#5599ff',
  npc: '#ffdd44',
  text: '#ffffff',
  background: 0x000000,
  backgroundAlpha: 0.8,
};

// Fixed style constants (layout is computed dynamically based on camera zoom)
const STYLE = {
  boxHeight: 90,
  padX: 16,
  nameOffsetY: 8,
  textOffsetY: 26,
  fontSize: '16px',
  fontFamily: '"Press Start 2P", "Courier New", monospace',
  cornerRadius: 4,
};

const TYPING_DELAY = 50;
const INDICATOR_BLINK_RATE = 500;

export class DialogBox {
  private scene: Phaser.Scene;
  private background: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private contentText: Phaser.GameObjects.Text;
  private indicator: Phaser.GameObjects.Graphics;

  // Computed layout positions (derived from camera zoom in constructor)
  private boxX: number = 0;
  private boxY: number = 0;
  private boxWidth: number = 400;

  private dialogState: DialogState = 'IDLE';
  private dialog: DialogLine[] = [];
  private currentPageIndex: number = 0;
  private displayedChars: number = 0;
  private fullText: string = '';

  private typingTimer?: Phaser.Time.TimerEvent;
  private indicatorTimer?: Phaser.Time.TimerEvent;
  private indicatorVisible: boolean = true;

  private onOpen?: () => void;
  private onClose?: () => void;

  constructor(
    scene: Phaser.Scene,
    onOpen?: () => void,
    onClose?: () => void
  ) {
    this.scene = scene;
    this.onOpen = onOpen;
    this.onClose = onClose;

    const depth = 1000;

    // Compute visible area for scrollFactor(0) objects under camera zoom.
    // With zoom, coordinates are scaled from the canvas center, so (0,0) is NOT top-left.
    // Formula: screenPos = (gamePos - canvasCenter) * zoom + canvasCenter
    // Visible top-left in game coords = canvasCenter * (1 - 1/zoom)
    const cam = scene.cameras.main;
    const zoom = cam.zoom;
    const visX = (cam.width / 2) * (1 - 1 / zoom);
    const visY = (cam.height / 2) * (1 - 1 / zoom);
    const visW = cam.width / zoom;
    const visH = cam.height / zoom;

    this.boxX = visX;
    this.boxY = visY + visH - STYLE.boxHeight;
    this.boxWidth = visW;
    const wrapWidth = visW - STYLE.padX * 2;

    // Background
    this.background = scene.add.graphics();
    this.background.setScrollFactor(0);
    this.background.setDepth(depth);
    this.drawBackground();

    // Name text
    this.nameText = scene.add.text(
      this.boxX + STYLE.padX,
      this.boxY + STYLE.nameOffsetY,
      '',
      {
        fontFamily: STYLE.fontFamily,
        fontSize: STYLE.fontSize,
        color: COLORS.player,
        padding: { top: 6, bottom: 6 },
      }
    );
    this.nameText.setScrollFactor(0);
    this.nameText.setDepth(depth + 1);
    this.nameText.setScale(0.5);

    // Content text
    this.contentText = scene.add.text(
      this.boxX + STYLE.padX,
      this.boxY + STYLE.textOffsetY,
      '',
      {
        fontFamily: STYLE.fontFamily,
        fontSize: STYLE.fontSize,
        color: COLORS.text,
        wordWrap: { width: wrapWidth * 2 },
        padding: { top: 6, bottom: 6 },
      }
    );
    this.contentText.setScrollFactor(0);
    this.contentText.setDepth(depth + 1);
    this.contentText.setScale(0.5);

    // Page indicator (triangle)
    this.indicator = scene.add.graphics();
    this.indicator.setScrollFactor(0);
    this.indicator.setDepth(depth + 1);
    this.drawIndicator();

    // Start hidden
    this.setVisible(false);
  }

  private drawBackground(): void {
    this.background.clear();
    this.background.fillStyle(COLORS.background, COLORS.backgroundAlpha);
    this.background.fillRoundedRect(
      this.boxX,
      this.boxY,
      this.boxWidth,
      STYLE.boxHeight,
      STYLE.cornerRadius
    );
  }

  private drawIndicator(): void {
    const x = this.boxX + this.boxWidth - 16;
    const y = this.boxY + STYLE.boxHeight - 12;
    this.indicator.clear();
    this.indicator.fillStyle(0xffffff, 1);
    this.indicator.fillTriangle(x, y, x + 8, y, x + 4, y + 6);
  }

  private setVisible(visible: boolean): void {
    this.background.setVisible(visible);
    this.nameText.setVisible(visible);
    this.contentText.setVisible(visible);
    this.indicator.setVisible(visible);
  }

  show(dialog: DialogLine[]): void {
    if (dialog.length === 0) return;

    this.dialog = dialog;
    this.currentPageIndex = 0;
    this.setVisible(true);
    this.scene.input.on('pointerdown', this.handleInput);
    this.onOpen?.();
    this.showCurrentPage();
  }

  private showCurrentPage(): void {
    const line = this.dialog[this.currentPageIndex];
    this.nameText.setText(line.speaker);
    this.nameText.setColor(COLORS[line.role]);
    this.fullText = line.text;
    this.displayedChars = 0;
    this.contentText.setText('');
    this.indicator.setVisible(false);
    this.dialogState = 'TYPING';
    this.startTyping();
  }

  private startTyping(): void {
    this.stopTyping();
    this.typingTimer = this.scene.time.addEvent({
      delay: TYPING_DELAY,
      callback: this.typeNextChar,
      callbackScope: this,
      loop: true,
    });
  }

  private stopTyping(): void {
    if (this.typingTimer) {
      this.typingTimer.destroy();
      this.typingTimer = undefined;
    }
  }

  private typeNextChar(): void {
    if (this.displayedChars < this.fullText.length) {
      this.displayedChars++;
      this.contentText.setText(this.fullText.substring(0, this.displayedChars));
    } else {
      this.completeTyping();
    }
  }

  private completeTyping(): void {
    this.stopTyping();
    this.contentText.setText(this.fullText);
    this.dialogState = 'PAGE_COMPLETE';
    this.startIndicatorBlink();
  }

  private startIndicatorBlink(): void {
    this.stopIndicatorBlink();
    this.indicatorVisible = true;
    this.indicator.setVisible(true);
    this.indicatorTimer = this.scene.time.addEvent({
      delay: INDICATOR_BLINK_RATE,
      callback: () => {
        this.indicatorVisible = !this.indicatorVisible;
        this.indicator.setVisible(this.indicatorVisible);
      },
      loop: true,
    });
  }

  private stopIndicatorBlink(): void {
    if (this.indicatorTimer) {
      this.indicatorTimer.destroy();
      this.indicatorTimer = undefined;
    }
    this.indicator.setVisible(false);
  }

  advance(): void {
    if (this.dialogState === 'TYPING') {
      this.completeTyping();
    } else if (this.dialogState === 'PAGE_COMPLETE') {
      this.stopIndicatorBlink();
      if (this.currentPageIndex < this.dialog.length - 1) {
        this.currentPageIndex++;
        this.showCurrentPage();
      } else {
        this.close();
      }
    }
  }

  close(): void {
    this.dialogState = 'IDLE';
    this.setVisible(false);
    this.stopTyping();
    this.stopIndicatorBlink();
    this.scene.input.off('pointerdown', this.handleInput);
    this.onClose?.();
  }

  private handleInput = (): void => {
    if (this.dialogState !== 'IDLE') {
      this.advance();
    }
  };

  get isActive(): boolean {
    return this.dialogState !== 'IDLE';
  }

  destroy(): void {
    this.stopTyping();
    this.stopIndicatorBlink();
    this.scene?.input?.off('pointerdown', this.handleInput);
    this.background.destroy();
    this.nameText.destroy();
    this.contentText.destroy();
    this.indicator.destroy();
  }
}

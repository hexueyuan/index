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

const LAYOUT = {
  boxX: 0,
  boxY: 210,
  boxWidth: 400,
  boxHeight: 90,
  nameX: 16,
  nameY: 218,
  textX: 16,
  textY: 236,
  fontSize: 8,
  wrapWidth: 368,
  cornerRadius: 4,
};

const TYPING_DELAY = 50;
const INDICATOR_BLINK_RATE = 500;

export class DialogBox extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private contentText: Phaser.GameObjects.Text;
  private indicator: Phaser.GameObjects.Graphics;

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
    super(scene, 0, 0);
    this.onOpen = onOpen;
    this.onClose = onClose;

    scene.add.existing(this as Phaser.GameObjects.Container);
    this.setScrollFactor(0);
    this.setDepth(1000);

    // Background
    this.background = scene.add.graphics();
    this.drawBackground();
    this.add(this.background);

    // Name text
    this.nameText = scene.add.text(LAYOUT.nameX, LAYOUT.nameY, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: `${LAYOUT.fontSize}px`,
      color: COLORS.player,
    });
    this.add(this.nameText);

    // Content text
    this.contentText = scene.add.text(LAYOUT.textX, LAYOUT.textY, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: `${LAYOUT.fontSize}px`,
      color: COLORS.text,
      wordWrap: { width: LAYOUT.wrapWidth },
    });
    this.add(this.contentText);

    // Page indicator (triangle)
    this.indicator = scene.add.graphics();
    this.drawIndicator();
    this.add(this.indicator);

    // Pointer input for mobile tap-to-advance
    scene.input.on('pointerdown', this.handleInput);

    // Start hidden
    this.setVisible(false);
  }

  private drawBackground(): void {
    this.background.clear();
    this.background.fillStyle(COLORS.background, COLORS.backgroundAlpha);
    this.background.fillRoundedRect(
      LAYOUT.boxX,
      LAYOUT.boxY,
      LAYOUT.boxWidth,
      LAYOUT.boxHeight,
      LAYOUT.cornerRadius
    );
  }

  private drawIndicator(): void {
    const x = LAYOUT.boxX + LAYOUT.boxWidth - 16;
    const y = LAYOUT.boxY + LAYOUT.boxHeight - 12;
    this.indicator.clear();
    this.indicator.fillStyle(0xffffff, 1);
    this.indicator.fillTriangle(x, y, x + 8, y, x + 4, y + 6);
  }

  show(dialog: DialogLine[]): void {
    if (dialog.length === 0) return;

    this.dialog = dialog;
    this.currentPageIndex = 0;
    this.setVisible(true);
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
      // Skip animation
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

  private close(): void {
    this.dialogState = 'IDLE';
    this.setVisible(false);
    this.stopTyping();
    this.stopIndicatorBlink();
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

  destroy(fromScene?: boolean): void {
    this.stopTyping();
    this.stopIndicatorBlink();
    this.scene?.input?.off('pointerdown', this.handleInput);
    super.destroy(fromScene);
  }
}

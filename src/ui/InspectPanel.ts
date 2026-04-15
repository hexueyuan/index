import Phaser from 'phaser';

export interface InspectContent {
  type: 'sign' | 'photo' | 'diary' | 'item';
  title?: string;
  text?: string;
}

const COLORS = {
  boardFill: 0x8B4513,
  boardBorder: 0xDEB887,
  woodGrain: 0x7A3B10,
  titleColor: '#FFD700',
  textColor: '#ffffff',
};

const STYLE = {
  panelWidth: 200,
  panelHeight: 160,
  borderWidth: 4,
  padX: 14,
  titleOffsetY: 14,
  textOffsetY: 38,
  fontSize: '16px',
  fontFamily: '"Press Start 2P", "Courier New", monospace',
  grainLineCount: 6,
};

export class InspectPanel {
  private scene: Phaser.Scene;
  private background: Phaser.GameObjects.Graphics;
  private titleText: Phaser.GameObjects.Text;
  private contentText: Phaser.GameObjects.Text;

  private panelX: number = 0;
  private panelY: number = 0;
  private visible: boolean = false;

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

    // Compute visible area using same zoom correction as DialogBox
    const cam = scene.cameras.main;
    const zoom = cam.zoom;
    const visX = (cam.width / 2) * (1 - 1 / zoom);
    const visY = (cam.height / 2) * (1 - 1 / zoom);
    const visW = cam.width / zoom;
    const visH = cam.height / zoom;

    // Center the panel in the visible area
    this.panelX = visX + (visW - STYLE.panelWidth) / 2;
    this.panelY = visY + (visH - STYLE.panelHeight) / 2;

    const wrapWidth = (STYLE.panelWidth - STYLE.padX * 2) * 2; // *2 because scale 0.5

    // Background (wood board)
    this.background = scene.add.graphics();
    this.background.setScrollFactor(0);
    this.background.setDepth(depth);
    this.drawBackground();

    // Title text
    this.titleText = scene.add.text(
      this.panelX + STYLE.panelWidth / 2,
      this.panelY + STYLE.titleOffsetY,
      '',
      {
        fontFamily: STYLE.fontFamily,
        fontSize: STYLE.fontSize,
        color: COLORS.titleColor,
        padding: { top: 4, bottom: 4 },
      }
    );
    this.titleText.setOrigin(0.5, 0);
    this.titleText.setScrollFactor(0);
    this.titleText.setDepth(depth + 1);
    this.titleText.setScale(0.5);

    // Content text
    this.contentText = scene.add.text(
      this.panelX + STYLE.padX,
      this.panelY + STYLE.textOffsetY,
      '',
      {
        fontFamily: STYLE.fontFamily,
        fontSize: STYLE.fontSize,
        color: COLORS.textColor,
        wordWrap: { width: wrapWidth },
        padding: { top: 4, bottom: 4 },
      }
    );
    this.contentText.setScrollFactor(0);
    this.contentText.setDepth(depth + 1);
    this.contentText.setScale(0.5);

    // Start hidden
    this.setVisible(false);
  }

  private drawBackground(): void {
    const { panelX: x, panelY: y } = this;
    const w = STYLE.panelWidth;
    const h = STYLE.panelHeight;
    const bw = STYLE.borderWidth;

    this.background.clear();

    // Border (lighter brown)
    this.background.fillStyle(COLORS.boardBorder, 1);
    this.background.fillRect(x, y, w, h);

    // Inner fill (dark brown)
    this.background.fillStyle(COLORS.boardFill, 1);
    this.background.fillRect(x + bw, y + bw, w - bw * 2, h - bw * 2);

    // Wood grain lines
    const innerH = h - bw * 2;
    const spacing = innerH / (STYLE.grainLineCount + 1);
    this.background.lineStyle(1, COLORS.woodGrain, 0.4);
    for (let i = 1; i <= STYLE.grainLineCount; i++) {
      const ly = y + bw + spacing * i;
      this.background.beginPath();
      this.background.moveTo(x + bw + 2, ly);
      this.background.lineTo(x + w - bw - 2, ly);
      this.background.strokePath();
    }
  }

  private setVisible(v: boolean): void {
    this.background.setVisible(v);
    this.titleText.setVisible(v);
    this.contentText.setVisible(v);
  }

  show(content: InspectContent): void {
    this.titleText.setText(content.title ?? '');
    this.contentText.setText(content.text ?? '');
    this.setVisible(true);
    this.visible = true;
    this.scene.input.on('pointerdown', this.handleClose);
    this.onOpen?.();
  }

  close(): void {
    this.setVisible(false);
    this.visible = false;
    this.scene.input.off('pointerdown', this.handleClose);
    this.onClose?.();
  }

  private handleClose = (): void => {
    if (this.visible) {
      this.close();
    }
  };

  get isActive(): boolean {
    return this.visible;
  }

  destroy(): void {
    this.scene?.input?.off('pointerdown', this.handleClose);
    this.background.destroy();
    this.titleText.destroy();
    this.contentText.destroy();
  }
}

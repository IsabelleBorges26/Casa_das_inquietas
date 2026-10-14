import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

/**
 * VictoryScene - Matching 'Vitória' panel from reference image.
 */
export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.cameras.main.fadeIn(800, 0, 0, 0);

    // Window silhouette background
    this.add.image(w / 2, h / 2, 'victory_bg').setDisplaySize(w, h);

    // Dark subtle vignette on edges
    const vignette = this.add.graphics();
    vignette.fillGradientStyle(0x382C3A, 0x382C3A, 0x382C3A, 0x382C3A, 0.2, 0.2, 0.6, 0.6);
    vignette.fillRect(0, 0, w, h);

    // Title: Vitória
    this.add.text(w / 2 + 2, 72, '✦ Vitória ✦', {
      fontFamily: 'Cinzel Decorative, serif',
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#1A0E1C',
    }).setOrigin(0.5).setAlpha(0.6);

    const title = this.add.text(w / 2, 70, '✦ Vitória ✦', {
      fontFamily: 'Cinzel Decorative, serif',
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#F4D56D',
      stroke: '#382C3A',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.04, scaleY: 1.04,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Message
    this.add.text(w / 2, 130, 'Você conseguiu escapar...\nMas a casa ainda guarda muitos segredos.', {
      fontFamily: 'Caveat, cursive, sans-serif',
      fontSize: '22px',
      color: '#FFF8E7',
      align: 'center',
      lineSpacing: 6,
      stroke: '#382C3A',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Buttons at bottom
    this.createPillButton(w / 2, h - 100, 'Jogar novamente', () => {
      this.cameras.main.fadeOut(500, 42, 31, 45);
      this.time.delayedCall(500, () => this.scene.start('BedroomScene', { stage: 1 }));
    });

    this.createPillButton(w / 2, h - 45, 'Menu principal', () => {
      this.cameras.main.fadeOut(500, 42, 31, 45);
      this.time.delayedCall(500, () => this.scene.start('MenuScene'));
    });
  }

  createPillButton(x, y, label, callback) {
    const container = this.add.container(x, y);
    const bg = this.add.image(0, 0, 'btn_pink').setScale(0.9, 0.85).setInteractive({ useHandCursor: true });
    const text = this.add.text(0, -1, label, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      fontStyle: '600',
      color: '#382C3A',
    }).setOrigin(0.5);

    container.add([bg, text]);

    bg.on('pointerover', () => {
      bg.setTexture('btn_pink_hover');
      text.setColor('#B32D48');
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 80 });
    });
    bg.on('pointerout', () => {
      bg.setTexture('btn_pink');
      text.setColor('#382C3A');
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 80 });
    });
    bg.on('pointerdown', callback);

    return container;
  }
}

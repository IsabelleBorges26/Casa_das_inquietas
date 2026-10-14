import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

/**
 * DefeatScene - Matching 'Derrota' panel from reference image.
 */
export default class DefeatScene extends Phaser.Scene {
  constructor() {
    super('DefeatScene');
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.cameras.main.fadeIn(600, 40, 20, 30);

    // Defeat artwork background (crying doll in spotlight with shadow toys)
    this.add.image(w / 2, h / 2, 'defeat_bg').setDisplaySize(w, h);

    // Red ambient vignette on edges
    const vignette = this.add.graphics();
    vignette.fillGradientStyle(0x382C3A, 0x382C3A, 0x382C3A, 0x382C3A, 0.3, 0.3, 0.7, 0.7);
    vignette.fillRect(0, 0, w, h);

    // Title: Derrota
    this.add.text(w / 2 + 2, 62, 'Derrota', {
      fontFamily: 'Cinzel Decorative, serif',
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#1A0E1C',
    }).setOrigin(0.5).setAlpha(0.6);

    const title = this.add.text(w / 2, 60, 'Derrota', {
      fontFamily: 'Cinzel Decorative, serif',
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#F5A8C8',
      stroke: '#B32D48',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.03, scaleY: 1.03,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Message
    this.add.text(w / 2, 115, 'Você foi capturada...\nOs brinquedos não querem que você vá embora.', {
      fontFamily: 'Caveat, cursive, sans-serif',
      fontSize: '22px',
      color: '#FFF8E7',
      align: 'center',
      lineSpacing: 6,
      stroke: '#382C3A',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Buttons
    this.createPillButton(w / 2, h - 100, 'Tentar novamente', () => {
      this.cameras.main.fadeOut(500, 42, 31, 45);
      this.time.delayedCall(500, () => this.scene.start('BedroomScene'));
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

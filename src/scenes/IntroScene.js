import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

/**
 * IntroScene - Narrative introduction matching 'Introdução' panel from reference image.
 */
export default class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create(data = {}) {
    this.selectedStage = data.stage || 1;
    this.selectedSequence = data.sequence || ['red', 'yellow', 'blue'];
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Background image with doll in spotlight on the left
    this.add.image(w / 2, h / 2, 'intro_bg').setDisplaySize(w, h);

    // Narrative panel on right side
    const panelX = w * 0.68;
    const panelY = h * 0.45;

    const lines = [
      'Quando abriu os olhos,',
      'todos os brinquedos estavam imóveis.',
      'Pelo menos, era isso que parecia.',
      '',
      'Na porta, um bilhete dizia:',
      '"Não toque na música depois',
      'que as luzes se apagarem."'
    ];

    const narrativeText = this.add.text(panelX, panelY, lines.join('\n'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      color: '#FFF8E7',
      align: 'left',
      lineSpacing: 8
    }).setOrigin(0.5);

    // Stylize the quoted text with pink color
    narrativeText.setStroke('#382C3A', 2);

    // "Continuar" Button
    const btnContainer = this.add.container(panelX, h * 0.78);
    const btnBg = this.add.image(0, 0, 'btn_pink').setScale(0.85).setInteractive({ useHandCursor: true });
    const btnText = this.add.text(0, -1, 'Continuar', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      fontStyle: '600',
      color: '#382C3A'
    }).setOrigin(0.5);

    btnContainer.add([btnBg, btnText]);

    btnBg.on('pointerover', () => {
      btnBg.setTexture('btn_pink_hover');
      btnText.setColor('#B32D48');
      this.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 80 });
    });

    btnBg.on('pointerout', () => {
      btnBg.setTexture('btn_pink');
      btnText.setColor('#382C3A');
      this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 80 });
    });

    btnBg.on('pointerdown', () => {
      this.startGame();
    });

    // Skip on any key or click
    this.input.keyboard.on('keydown', () => this.startGame());
    this.skipped = false;
  }

  startGame() {
    if (this.skipped) return;
    this.skipped = true;
    this.cameras.main.fadeOut(800, 42, 31, 45);
    this.time.delayedCall(800, () => {
      this.scene.start('BedroomScene', { stage: this.selectedStage, sequence: this.selectedSequence, roomsCleared: 0 });
    });
  }
}

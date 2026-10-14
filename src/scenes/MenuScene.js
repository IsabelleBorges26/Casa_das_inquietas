import Phaser from 'phaser';
import { COLORS, COLOR_STRINGS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

/**
 * MenuScene - Main Menu exactly matching 'Tela inicial' in reference image.
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    // Background illustration
    this.add.image(w / 2, h / 2, 'menu_bg').setDisplaySize(w, h);

    // Dark gradient vignette overlay
    const overlay = this.add.graphics();
    overlay.fillGradientStyle(0x382C3A, 0x382C3A, 0x382C3A, 0x382C3A, 0.4, 0.4, 0.7, 0.7);
    overlay.fillRect(0, 0, w, h);

    // Decorative Stars
    this.createFloatingStars();

    // House icon above title (fairytale haunted house)
    const houseIcon = this.add.text(w / 2, 85, '✦ 🏚️ ✦', {
      fontSize: '24px',
      color: '#F4D56D'
    }).setOrigin(0.5);

    // Title: CASA DAS INQUIETAS
    this.add.text(w / 2 + 2, 135, 'CASA DAS\nINQUIETAS', {
      fontFamily: 'Cinzel Decorative, serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#1A0E1C',
      align: 'center',
      lineSpacing: -4,
    }).setOrigin(0.5).setAlpha(0.6);

    const title = this.add.text(w / 2, 132, 'CASA DAS\nINQUIETAS', {
      fontFamily: 'Cinzel Decorative, serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#F5A8C8',
      stroke: '#382C3A',
      strokeThickness: 5,
      align: 'center',
      lineSpacing: -4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(w / 2, 200, 'Às vezes, os brinquedos também têm sonhos... e medos.', {
      fontFamily: 'Caveat, cursive, sans-serif',
      fontSize: '20px',
      color: '#FFF8E7',
      align: 'center'
    }).setOrigin(0.5);

    // Menu Buttons on the right-center
    const btnX = w / 2;
    const startY = 280;

    this.createMenuPillButton(btnX, startY, 'Jogar', () => {
      this.showMapSelection();
    });

    this.createMenuPillButton(btnX, startY + 60, 'Como Jogar', () => {
      this.showHowToPlay();
    });

    this.createMenuPillButton(btnX, startY + 120, 'Créditos', () => {
      this.showCredits();
    });

    // Version label
    this.add.text(w - 15, h - 15, 'v1.0 • Casa das Inquietas', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '12px',
      color: '#83B99A',
    }).setOrigin(1, 1);

    this.cameras.main.fadeIn(800, 42, 31, 45);
  }


  showMapSelection() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x160D19, 0.94).setInteractive().setDepth(50);
    const card = this.add.rectangle(w / 2, h / 2, 590, 440, 0x382C3A).setStrokeStyle(3, 0xF5A8C8).setDepth(51);
    const title = this.add.text(w / 2, 112, 'ESCOLHA ONDE EXPLORAR', {
      fontFamily: 'Cinzel Decorative, serif', fontSize: '23px', color: '#F5A8C8', align: 'center'
    }).setOrigin(0.5).setDepth(52);
    const subtitle = this.add.text(w / 2, 146, 'Cada partida sorteia uma nova sequência de cores.', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '15px', color: '#FFF8E7', align: 'center'
    }).setOrigin(0.5).setDepth(52);

    const maps = [
      { stage: 1, name: 'Quarto do Despertar', detail: 'O começo dos segredos', tint: 0xF5A8C8 },
      { stage: 2, name: 'Ala dos Espelhos', detail: 'Reflexos e passagens', tint: 0xC5D5FF },
      { stage: 3, name: 'Corredor dos Brinquedos', detail: 'Onde ninguém está sozinho', tint: 0xB89ACD },
    ];
    const objects = [overlay, card, title, subtitle];
    maps.forEach((map, index) => {
      const y = 215 + index * 76;
      const bg = this.add.rectangle(w / 2, y, 490, 60, 0x504253).setStrokeStyle(2, map.tint).setInteractive({ useHandCursor: true }).setDepth(52);
      const icon = this.add.text(w / 2 - 205, y, ['🛏️', '🪞', '🧸'][index], { fontSize: '25px' }).setOrigin(0.5).setDepth(53);
      const name = this.add.text(w / 2 - 165, y - 9, map.name, { fontFamily: 'Fredoka, sans-serif', fontSize: '17px', color: '#FFF8E7' }).setOrigin(0, 0.5).setDepth(53);
      const detail = this.add.text(w / 2 - 165, y + 14, map.detail, { fontFamily: 'Fredoka, sans-serif', fontSize: '12px', color: '#D8C9D9' }).setOrigin(0, 0.5).setDepth(53);
      objects.push(bg, icon, name, detail);
      bg.on('pointerover', () => bg.setFillStyle(0x67536A));
      bg.on('pointerout', () => bg.setFillStyle(0x504253));
      bg.on('pointerdown', () => {
        const colors = ['red', 'yellow', 'blue', 'green', 'pink'];
        const previous = this.registry.get('lastPuzzleSequence') || [];
        const permutations = [];
        for (let a = 0; a < colors.length; a++) {
          for (let b = 0; b < colors.length; b++) {
            for (let c = 0; c < colors.length; c++) {
              if (a !== b && b !== c && a !== c) permutations.push([colors[a], colors[b], colors[c]]);
            }
          }
        }
        const choices = permutations.filter(seq => seq.join(',') !== previous.join(','));
        const sequence = Phaser.Utils.Array.GetRandom(choices.length ? choices : permutations);
        this.registry.set('lastPuzzleSequence', sequence);
        objects.forEach(obj => obj.destroy());
        if (!this.scale.isFullscreen) this.scale.startFullscreen();
        this.cameras.main.fadeOut(450, 42, 31, 45);
        this.time.delayedCall(450, () => this.scene.start('IntroScene', { stage: map.stage, sequence }));
      });
    });
    const back = this.add.text(w / 2, 363 + 76, '‹ Voltar', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '16px', color: '#F4D66D'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(52);
    objects.push(back);
    back.on('pointerdown', () => objects.forEach(obj => obj.destroy()));
    back.on('pointerover', () => back.setColor('#F5A8C8'));
    back.on('pointerout', () => back.setColor('#F4D66D'));
  }

  createFloatingStars() {
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const y = Phaser.Math.Between(30, GAME_HEIGHT - 30);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(10, 18)}px`,
        color: i % 2 === 0 ? '#F4D56D' : '#F5A8C8'
      }).setOrigin(0.5).setAlpha(0.4);

      this.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 0.9 },
        scale: { from: 0.8, to: 1.2 },
        duration: Phaser.Math.Between(1500, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1500)
      });
    }
  }

  createMenuPillButton(x, y, label, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.image(0, 0, 'btn_pink').setInteractive({ useHandCursor: true });
    const text = this.add.text(0, -1, label, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      fontStyle: '600',
      color: '#382C3A',
    }).setOrigin(0.5);

    container.add([bg, text]);

    bg.on('pointerover', () => {
      bg.setTexture('btn_pink_hover');
      text.setColor('#B32D48');
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });

    bg.on('pointerout', () => {
      bg.setTexture('btn_pink');
      text.setColor('#382C3A');
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
    });

    bg.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: callback,
      });
    });

    return container;
  }

  showHowToPlay() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x1A0E1C, 0.85).setInteractive();
    
    // Parchment card
    const card = this.add.rectangle(w / 2, h / 2, 480, 400, 0x382C3A)
      .setStrokeStyle(2, 0xF5A8C8, 0.8);

    const title = this.add.text(w / 2, h / 2 - 150, '✦ Como Jogar ✦', {
      fontFamily: 'Cinzel Decorative, serif',
      fontSize: '24px',
      color: '#F5A8C8',
    }).setOrigin(0.5);

    const instructions = [
      '🕹️  WASD ou Setas: Mover a boneca',
      '⭐  E ou Espaço: Interagir / Ler / Esconder',
      '⏸️  ESC: Pausar o jogo',
      '',
      '📝  Encontre as pistas escondidas nos bilhetes',
      '🎵  Decifre o enigma da caixinha de música',
      '🗝️  Pegue a chave na gaveta secreta',
      '🚪  Abra a porta e escape do quarto!',
      '',
      '⚠️  Evite os soldadinhos e o palhaço ouvinte!',
      '🚪  Use os guarda-roupas para se camuflar'
    ];

    const text = this.add.text(w / 2, h / 2 - 15, instructions.join('\n'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#FFF8E7',
      align: 'left',
      lineSpacing: 3,
    }).setOrigin(0.5);

    const closeBtn = this.add.text(w / 2, h / 2 + 155, '[ Fechar ]', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      color: '#F4D56D',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor('#F5A8C8'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#F4D56D'));
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      card.destroy();
      title.destroy();
      text.destroy();
      closeBtn.destroy();
    });
  }

  showCredits() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x1A0E1C, 0.85).setInteractive();
    
    const card = this.add.rectangle(w / 2, h / 2, 440, 360, 0x382C3A)
      .setStrokeStyle(2, 0xF5A8C8, 0.8);

    const title = this.add.text(w / 2, h / 2 - 130, '✦ Créditos ✦', {
      fontFamily: 'Cinzel Decorative, serif',
      fontSize: '24px',
      color: '#F5A8C8',
    }).setOrigin(0.5);

    const credits = this.add.text(w / 2, h / 2 - 10, [
      'CASA DAS INQUIETAS',
      '',
      'Direção Criativa e Conceito Visual',
      'Isabelle Borges',
      '',
      'Desenvolvimento & Gameplay',
      'Phaser 3 • JavaScript • Vite',
      '',
      'Arte Procedural e Ilustração Vintage',
      '',
      'Um jogo feito com muito carinho ♥'
    ].join('\n'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#FFF8E7',
      align: 'center',
      lineSpacing: 3,
    }).setOrigin(0.5);

    const closeBtn = this.add.text(w / 2, h / 2 + 135, '[ Voltar ]', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      color: '#F4D56D',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor('#F5A8C8'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#F4D56D'));
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      card.destroy();
      title.destroy();
      credits.destroy();
      closeBtn.destroy();
    });
  }
}

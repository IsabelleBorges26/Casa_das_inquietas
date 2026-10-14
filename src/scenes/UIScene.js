
import Phaser from 'phaser';
import { COLORS, COLOR_STRINGS, GAME_WIDTH, GAME_HEIGHT, PUZZLE_SEQUENCES } from '../config.js';
import { sounds } from '../systems/SoundSystem.js';

/**
 * UIScene - Overlay scene for all UI elements:
 * - Quest Tracker / Objective HUD
 * - Fullscreen toggle button (⛶)
 * - 4-slot bottom-left HUD Inventory (Chave, Bilhetes, Caixinha)
 * - Handwritten parchment note reader with sounds
 * - Music box riddle modal with realistic chime sounds
 * - Pause menu with sound and fullscreen options
 * - Mobile virtual joystick and touch buttons
 */
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: false });
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.notesReadCount = 0;
    this.totalNotes = 5;

    // ===== 1. QUEST TRACKER (TOP-RIGHT) =====
    this.createQuestTracker(w);

    // ===== 2. FULLSCREEN BUTTON (TOP-RIGHT CORNER) =====
    this.createFullscreenButton(w);

    // ===== 3. INVENTORY HUD (BOTTOM-LEFT) =====
    this.createInventoryHUD(w, h);

    // ===== 4. INTERACT PROMPT HINT =====
    this.interactHint = this.add.container(w / 2, h - 35).setDepth(20).setVisible(false);
    const hintBg = this.add.rectangle(0, 0, 180, 32, 0x382C3A, 0.95)
      .setStrokeStyle(1.5, 0xF5A8C8, 0.9);
    const hintTxt = this.add.text(0, 0, '✦ [E / Espaço] Interagir ✦', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      color: '#F4D56D'
    }).setOrigin(0.5);
    this.interactHint.add([hintBg, hintTxt]);

    // ===== 5. NOTIFICATION BANNER =====
    this.createMessageBanner(w, h);

    // ===== 6. MOBILE VIRTUAL CONTROLS =====
    this.joystickData = { force: 0, x: 0, y: 0 };
    this.createMobileControls(w, h);

    // Initial gentle objective tip
    this.time.delayedCall(1000, () => {
      this.showMessage('Encontre os 3 bilhetes com pistas para decifrar a caixinha!', '#F4D56D');
    });

    // Keyboard 'F' for Fullscreen
    this.input.keyboard.on('keydown-F', () => this.toggleFullscreen());
  }

  // ===== QUEST TRACKER =====
  createQuestTracker(w) {
    this.questContainer = this.add.container(w - 180, 20).setDepth(20);

    const qBg = this.add.rectangle(80, 45, 175, 95, 0x382C3A, 0.88)
      .setStrokeStyle(1.5, 0xF5A8C8, 0.7);
    this.questContainer.add(qBg);

    const qTitle = this.add.text(80, 8, '✦ Objetivos ✦', {
      fontFamily: 'Cinzel Decorative, serif',
      fontSize: '13px',
      color: '#F5A8C8'
    }).setOrigin(0.5);
    this.questContainer.add(qTitle);

    this.qNoteTxt = this.add.text(10, 26, '• Bilhetes: 0/5', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '12px',
      color: '#FFF8E7'
    });
    this.qMusicTxt = this.add.text(10, 44, '• Tocar Caixinha [ ]', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '12px',
      color: '#A090A0'
    });
    this.qKeyTxt = this.add.text(10, 62, '• Pegar Chave [ ]', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '12px',
      color: '#A090A0'
    });
    this.qDoorTxt = this.add.text(10, 80, '• Destrancar Porta [ ]', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '12px',
      color: '#A090A0'
    });

    this.questContainer.add([this.qNoteTxt, this.qMusicTxt, this.qKeyTxt, this.qDoorTxt]);
  }

  updateQuest(type, data) {
    if (type === 'note') {
      this.notesReadCount = Math.min(this.notesReadCount + 1, 3);
      this.qNoteTxt.setText(`• Bilhetes: ${this.notesReadCount}/3 ✔`).setColor('#83B99A');
      if (this.notesReadCount >= 3) {
        this.qMusicTxt.setColor('#FFF8E7');
      }
    } else if (type === 'puzzle_solved') {
      this.qMusicTxt.setText('• Caixinha: Resolvida ✔').setColor('#83B99A');
      this.qKeyTxt.setColor('#FFF8E7');
    } else if (type === 'key') {
      this.qKeyTxt.setText('• Chave: Coletada ✔').setColor('#83B99A');
      this.qDoorTxt.setColor('#F4D56D');
    }
  }

  // ===== FULLSCREEN BUTTON =====
  createFullscreenButton(w) {
    const fsBtn = this.add.container(w - 28, 20).setDepth(22);
    const bg = this.add.circle(0, 0, 15, 0x382C3A, 0.9)
      .setStrokeStyle(1.5, 0xF4D56D, 0.8)
      .setInteractive({ useHandCursor: true });
    const icon = this.add.text(0, -1, '⛶', { fontSize: '14px', color: '#F4D56D' }).setOrigin(0.5);

    fsBtn.add([bg, icon]);

    bg.on('pointerdown', () => this.toggleFullscreen());
  }

  toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
    }
  }

  // ===== INVENTORY HUD =====
  createInventoryHUD(w, h) {
    this.invContainer = this.add.container(25, h - 60).setDepth(20);

    const panelBg = this.add.rectangle(100, 20, 210, 52, 0x382C3A, 0.9)
      .setStrokeStyle(2, 0xF5A8C8, 0.7);
    this.invContainer.add(panelBg);

    const label = this.add.text(100, -12, 'Inventário', {
      fontFamily: 'Caveat, cursive, sans-serif',
      fontSize: '18px',
      color: '#F5A8C8'
    }).setOrigin(0.5);
    this.invContainer.add(label);

    this.slots = [];
    this.slotIcons = [];
    const slotX = [25, 75, 125, 175];

    slotX.forEach((x, i) => {
      const slot = this.add.rectangle(x, 20, 42, 42, 0x2A1F2D)
        .setStrokeStyle(1.5, 0xF5A8C8, 0.5);
      this.invContainer.add(slot);
      this.slots.push(slot);

      const icon = this.add.image(x, 20, 'item_note').setVisible(false).setScale(0.85);
      this.invContainer.add(icon);
      this.slotIcons.push(icon);
    });

    this.slotIcons[0].setTexture('item_note').setVisible(true);
  }

  updateInventory(item) {
    if (item === 'key') {
      sounds.playKeyPickup();
      this.slotIcons[1].setTexture('item_key').setVisible(true);
      this.updateQuest('key');
      this.tweens.add({
        targets: this.slotIcons[1],
        scaleX: 1.3, scaleY: 1.3,
        duration: 250,
        yoyo: true
      });
    }
  }

  // ===== MESSAGE BANNER =====
  createMessageBanner(w, h) {
    this.messageContainer = this.add.container(w / 2, 45).setDepth(25).setVisible(false);
    this.messageBg = this.add.rectangle(0, 0, 460, 40, 0x382C3A, 0.95)
      .setStrokeStyle(2, 0xF5A8C8, 0.8);
    this.messageText = this.add.text(0, 0, '', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#FFF8E7',
      align: 'center'
    }).setOrigin(0.5);
    this.messageContainer.add([this.messageBg, this.messageText]);
  }

  showMessage(text, color) {
    this.messageText.setColor(color || '#FFF8E7');
    this.messageText.setText(text);
    this.messageBg.setSize(Math.min(this.messageText.width + 40, GAME_WIDTH - 60), 40);

    this.messageContainer.setVisible(true).setAlpha(1);
    if (this.messageTimer) this.messageTimer.remove();
    this.messageTimer = this.time.delayedCall(3500, () => {
      this.tweens.add({
        targets: this.messageContainer,
        alpha: 0,
        duration: 300,
        onComplete: () => this.messageContainer.setVisible(false)
      });
    });
  }

  setInteractHint(visible) {
    this.interactHint.setVisible(visible);
  }

  // ===== PARCHMENT NOTE READER =====
  showNarrativeModal(text, onComplete) {
    sounds.playPaperSound();
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x1A0E1C, 0.85)
      .setInteractive()
      .setDepth(30);

    const paper = this.add.rectangle(w / 2, h / 2, 460, 260, 0xFFF2D6)
      .setStrokeStyle(3, 0xD4AF7A, 0.9)
      .setDepth(31);

    const seal = this.add.circle(w / 2 + 190, h / 2 + 90, 16, 0xB32D48)
      .setDepth(32);
    const sealInner = this.add.circle(w / 2 + 190, h / 2 + 90, 12, 0x8C1B33)
      .setDepth(32);

    // Limita a largura e a altura para o texto nunca sair do papel.
    const content = this.add.text(w / 2, h / 2 - 20, text, {
      fontFamily: 'Caveat, cursive, sans-serif',
      fontSize: '23px',
      color: '#4A3228',
      align: 'center',
      lineSpacing: 3,
      wordWrap: {
        width: 370,
        useAdvancedWrap: true
      },
      fixedWidth: 380,
      fixedHeight: 145,
      maxLines: 6
    })
      .setOrigin(0.5)
      .setDepth(32);

    const closeBtn = this.add.text(w / 2, h / 2 + 91, '[ Guardar bilhete ]', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#B32D48',
      fontStyle: '600'
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(33);

    const closeHandler = () => {
      sounds.playPaperSound();
      overlay.destroy();
      paper.destroy();
      seal.destroy();
      sealInner.destroy();
      content.destroy();
      closeBtn.destroy();
      if (onComplete) onComplete();
    };

    closeBtn.on('pointerdown', closeHandler);
    overlay.on('pointerdown', closeHandler);
  }

  // ===== MUSIC BOX PUZZLE MODAL =====
  showPuzzle(onSuccess, onClose, solution = PUZZLE_SEQUENCES[0], stage = 1) {
    sounds.playMusicBoxMelody();
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    const depth = 30;
    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x100914, 0.92).setInteractive().setDepth(depth);
    const modalBg = this.add.rectangle(w / 2, h / 2, 590, 390, 0x382C3A)
      .setStrokeStyle(3, 0xF5A8C8, 0.95).setDepth(depth + 1);
    const title = this.add.text(w / 2, h / 2 - 155, `A CAIXINHA DE MÚSICA • ALA ${stage}/3`, {
      fontFamily: 'Cinzel Decorative, serif', fontSize: '17px', color: '#F5A8C8', align: 'center'
    }).setOrigin(0.5).setDepth(depth + 2);
    const subtitle = this.add.text(w / 2, h / 2 - 119,
      'Descubra nos bilhetes a sequência e reproduza as três notas.', {
        fontFamily: 'Fredoka, sans-serif', fontSize: '14px', color: '#FFF8E7', align: 'center',
        wordWrap: { width: 500 }
      }).setOrigin(0.5).setDepth(depth + 2);
    const slots = [];
    const chosen = [];
    const colorValues = { red: 0xB82D48, yellow: 0xF4D66D, blue: 0x79C9D0, green: 0x83B99A, pink: 0xF5A8C8 };
    const colorLabels = { red: 'VERMELHO', yellow: 'AMARELO', blue: 'AZUL', green: 'VERDE', pink: 'ROSA' };
    const feedback = this.add.text(w / 2, h / 2 + 96, 'Escolha as cores na ordem revelada pelos bilhetes.', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '12px', color: '#F4D56D', align: 'center',
      wordWrap: { width: 490 }
    }).setOrigin(0.5).setDepth(depth + 2);
    const slotY = h / 2 - 48;
    for (let i = 0; i < 3; i++) {
      const x = w / 2 - 90 + i * 90;
      const circle = this.add.circle(x, slotY, 24, 0x241B28).setStrokeStyle(2, 0xF5A8C8, 0.8).setDepth(depth + 2);
      const number = this.add.text(x, slotY + 38, `${i + 1}`, { fontFamily: 'Fredoka', fontSize: '12px', color: '#FFF8E7' }).setOrigin(0.5).setDepth(depth + 2);
      slots.push({ circle, number });
    }
    const available = ['red', 'yellow', 'blue', 'green', 'pink'];
    const buttonY = h / 2 + 20;
    const buttonSpacing = 72;
    available.forEach((color, i) => {
      const x = w / 2 - buttonSpacing * 2 + i * buttonSpacing;
      const btn = this.add.circle(x, buttonY, 22, colorValues[color]).setStrokeStyle(2, 0xFFF8E7, 0.9)
        .setInteractive({ useHandCursor: true }).setDepth(depth + 2);
      this.add.text(x, buttonY + 31, colorLabels[color], { fontFamily: 'Fredoka', fontSize: '8px', color: '#FFF8E7' })
        .setOrigin(0.5).setDepth(depth + 2);
      btn.on('pointerdown', () => {
        if (chosen.length >= 3) return;
        chosen.push(color);
        const slot = slots[chosen.length - 1];
        slot.circle.setFillStyle(colorValues[color]).setStrokeStyle(2, 0xFFFFFF, 1);
        sounds.playMusicBoxNote(color);
        this.tweens.add({ targets: btn, scale: 1.18, duration: 100, yoyo: true });
        feedback.setText(chosen.length < 3 ? `Nota ${chosen.length}/3 escolhida. Continue a sequência.` : 'Sequência completa! Toque em REPRODUZIR.').setColor('#83B99A');
      });
    });
    const resetBtn = this.add.text(w / 2 - 100, h / 2 + 143, '↺ RECOMEÇAR', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '13px', color: '#F5A8C8'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(depth + 2);
    resetBtn.on('pointerdown', () => {
      chosen.length = 0;
      slots.forEach(slot => slot.circle.setFillStyle(0x241B28).setStrokeStyle(2, 0xF5A8C8, 0.8));
      feedback.setText('Sequência apagada. Consulte os bilhetes e tente novamente.').setColor('#F4D56D');
    });
    const playBg = this.add.rectangle(w / 2 + 90, h / 2 + 143, 150, 34, 0x83B99A).setStrokeStyle(1, 0xFFF8E7)
      .setInteractive({ useHandCursor: true }).setDepth(depth + 2);
    this.add.text(w / 2 + 90, h / 2 + 143, '♫ REPRODUZIR', { fontFamily: 'Fredoka', fontSize: '13px', color: '#1A0E1C', fontStyle: 'bold' }).setOrigin(0.5).setDepth(depth + 3);
    const closeBtn = this.add.text(w / 2 + 270, h / 2 - 174, '✕', { fontSize: '18px', color: '#F5A8C8' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(depth + 3);
    const allObjects = this.children.list.filter(obj => obj.depth >= depth);
    const destroyModal = () => allObjects.forEach(obj => { if (obj.active) obj.destroy(); });
    playBg.on('pointerdown', () => {
      if (chosen.length !== solution.length) {
        feedback.setText(`Você escolheu ${chosen.length} de 3 notas. Complete a sequência.`).setColor('#F5A8C8');
        return;
      }
      const isCorrect = chosen.every((color, index) => color === solution[index]);
      if (!isCorrect) {
        feedback.setText('A melodia está errada! Releia os bilhetes e tente outra combinação.').setColor('#F5A8C8');
        sounds.playMusicBoxNote('red');
        return;
      }
      solution.forEach((color, index) => this.time.delayedCall(index * 260, () => sounds.playMusicBoxNote(color)));
      this.time.delayedCall(850, () => {
        sounds.playMusicBoxNote('correct');
        this.updateQuest('puzzle_solved');
        destroyModal();
        if (onSuccess) onSuccess(true);
      });
    });
    closeBtn.on('pointerdown', () => { destroyModal(); if (onClose) onClose(); });
  }

  // ===== PAUSE MENU =====
  showPauseMenu(onResume, onRestart, onMenu) {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x1A0E1C, 0.85).setInteractive().setDepth(40);
    const card = this.add.rectangle(w / 2, h / 2, 340, 310, 0x382C3A)
      .setStrokeStyle(2, 0xF5A8C8, 0.8)
      .setDepth(41);

    const title = this.add.text(w / 2, h / 2 - 105, '✦ Pausado ✦', {
      fontFamily: 'Cinzel Decorative, serif',
      fontSize: '26px',
      color: '#F5A8C8'
    }).setOrigin(0.5).setDepth(42);

    const createBtn = (y, label, cb) => {
      const container = this.add.container(w / 2, y).setDepth(42);
      const bg = this.add.image(0, 0, 'btn_pink').setScale(0.8, 0.75).setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, -1, label, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '16px',
        fontStyle: '600',
        color: '#382C3A'
      }).setOrigin(0.5);
      container.add([bg, txt]);

      bg.on('pointerover', () => bg.setTexture('btn_pink_hover'));
      bg.on('pointerout', () => bg.setTexture('btn_pink'));
      bg.on('pointerdown', () => {
        destroyPause();
        cb();
      });
      return container;
    };

    const b1 = createBtn(h / 2 - 40, 'Continuar', onResume);
    const b2 = createBtn(h / 2 + 15, 'Reiniciar', onRestart);
    const b3 = createBtn(h / 2 + 70, 'Menu Principal', onMenu);

    const destroyPause = () => {
      overlay.destroy();
      card.destroy();
      title.destroy();
      b1.destroy();
      b2.destroy();
      b3.destroy();
    };

    this.hidePauseMenu = destroyPause;
  }

  // ===== MOBILE CONTROLS =====
  createMobileControls(w, h) {
    const joyX = 80;
    const joyY = h - 80;

    const joyBase = this.add.circle(joyX, joyY, 50, 0x382C3A, 0.7)
      .setStrokeStyle(2, 0x79C9D0, 0.8)
      .setDepth(20)
      .setInteractive();

    const joyThumb = this.add.circle(joyX, joyY, 22, 0x79C9D0, 0.9)
      .setDepth(21);

    this.input.setDraggable(joyBase);

    let isTouching = false;
    this.input.on('pointerdown', (pointer) => {
      if (Phaser.Math.Distance.Between(pointer.x, pointer.y, joyX, joyY) < 70) {
        isTouching = true;
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (!isTouching) return;
      const angle = Phaser.Math.Angle.Between(joyX, joyY, pointer.x, pointer.y);
      const dist = Math.min(Phaser.Math.Distance.Between(joyX, joyY, pointer.x, pointer.y), 45);
      joyThumb.x = joyX + Math.cos(angle) * dist;
      joyThumb.y = joyY + Math.sin(angle) * dist;

      this.joystickData = {
        force: dist / 45,
        x: (joyThumb.x - joyX) / 45,
        y: (joyThumb.y - joyY) / 45
      };
    });

    this.input.on('pointerup', () => {
      isTouching = false;
      joyThumb.setPosition(joyX, joyY);
      this.joystickData = { force: 0, x: 0, y: 0 };
    });

    // Mobile Action Button
    const actBtn = this.add.circle(w - 70, h - 70, 32, 0xF5A8C8, 0.85)
      .setStrokeStyle(2, 0xFFFFFF, 0.8)
      .setDepth(20)
      .setInteractive();

    const actIcon = this.add.text(w - 70, h - 70, '⭐', { fontSize: '20px' })
      .setOrigin(0.5).setDepth(21);

    actBtn.on('pointerdown', () => {
      const bedroomScene = this.scene.get('BedroomScene');
      if (bedroomScene && bedroomScene.handleInteract) {
        bedroomScene.handleInteract();
      }
    });

    // Mobile Pause Button
    const pauseBtn = this.add.circle(w - 70, 35, 18, 0x382C3A, 0.85)
      .setStrokeStyle(1.5, 0xF5A8C8, 0.8)
      .setDepth(20)
      .setInteractive();

    const pauseIcon = this.add.text(w - 70, 35, '⏸', { fontSize: '12px', color: '#FFF8E7' })
      .setOrigin(0.5).setDepth(21);

    pauseBtn.on('pointerdown', () => {
      const bedroomScene = this.scene.get('BedroomScene');
      if (bedroomScene && bedroomScene.togglePause) {
        bedroomScene.togglePause();
      }
    });
  }

  getJoystickData() {
    return this.joystickData;
  }
}

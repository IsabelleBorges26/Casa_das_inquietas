import Phaser from 'phaser';
import { COLORS, COLOR_STRINGS, GAME_WIDTH, GAME_HEIGHT, ROOM_WIDTH, ROOM_HEIGHT, PUZZLE_SEQUENCES } from '../config.js';
import Doll from '../entities/Doll.js';
import PatrolToy from '../entities/toys/PatrolToy.js';
import NoiseToy from '../entities/toys/NoiseToy.js';
import { sounds } from '../systems/SoundSystem.js';

/**
 * BedroomScene - Main gameplay scene: "Quarto de Despertar"
 * Fully enriched with:
 * - Quest progression updates
 * - Visual sparkle highlights on all interactive items
 * - Additional rich room interactions (mirror, fairy-tale bookshelf, teddy bear)
 * - Sprint mechanic (<kbd>Shift</kbd>)
 * - Sound synthesizer integrations
 */
export default class BedroomScene extends Phaser.Scene {
  constructor() {
    super('BedroomScene');
  }

  create(data = {}) {
    this.stage = Phaser.Math.Clamp(data.stage || 1, 1, 3);
    this.roomsCleared = data.roomsCleared || 0;
    this.stageSequence = data.sequence || this.registry.get('activePuzzleSequence') || PUZZLE_SEQUENCES[this.stage - 1];
    this.registry.set('activePuzzleSequence', this.stageSequence);
    // Launch UI Overlay
    this.scene.launch('UIScene');
    this.uiScene = this.scene.get('UIScene');

    // Game state
    this.hasKey = false;
    this.drawerOpen = false;
    this.doorUnlocked = false;
    this.isPuzzleOpen = false;
    this.isGameOver = false;
    this.isPaused = false;
    this.readNotesMap = {};

    // 1. Room Background Map
    this.roomBackground = this.add.image(ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 'room_map').setDisplaySize(ROOM_WIDTH, ROOM_HEIGHT);
    // Cada ala muda a atmosfera e o espelhamento do cenário para variar a exploração.
    if (this.stage === 2) { this.roomBackground.setFlipX(true).setTint(0xC5D5FF); }
    if (this.stage === 3) { this.roomBackground.setFlipY(true).setTint(0xB89ACD); }
    this.add.text(ROOM_WIDTH / 2, 18, `CASA DAS INQUIETAS  •  ALA ${this.stage}/3`, {
      fontFamily: 'Cinzel Decorative, serif', fontSize: '12px', color: '#FFF8E7',
      stroke: '#382C3A', strokeThickness: 3
    }).setOrigin(0.5).setDepth(20).setAlpha(0.9);

    // 2. Physics Walls and Furniture Colliders
    this.setupRoomColliders();

    // 3. Interactive Objects & Sparkle Highlights
    this.setupInteractables();

    // 4. Player (Doll)
    this.player = new Doll(this, ROOM_WIDTH / 2, ROOM_HEIGHT - 130);

    // 5. Enemies (Patrol Soldier & Noise Clown)
    this.setupEnemies();

    // 6. Collisions
    this.setupCollisions();

    // 7. Ambient Lighting Overlay
    this.createAmbientLighting();

    // 8. Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);
    this.cameras.main.fadeIn(1000, 42, 31, 45);

    // 9. Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D,E,SPACE,ESC,SHIFT');

    this.input.keyboard.on('keydown-E', () => this.handleInteract());
    this.input.keyboard.on('keydown-SPACE', () => this.handleInteract());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());

    // Prompt text above items
    this.interactPrompt = this.add.text(0, 0, '✦ [E] Interagir ✦', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      color: '#F4D56D',
      stroke: '#382C3A',
      strokeThickness: 3
    }).setOrigin(0.5).setVisible(false).setDepth(15);
  }

  // ===== ROOM COLLIDERS =====
  setupRoomColliders() {
    this.obstacles = this.physics.add.staticGroup();

    this.addStaticObstacle(ROOM_WIDTH / 2, 25, ROOM_WIDTH, 50);
    this.addStaticObstacle(ROOM_WIDTH / 2, ROOM_HEIGHT - 10, ROOM_WIDTH, 20);
    this.addStaticObstacle(20, ROOM_HEIGHT / 2, 40, ROOM_HEIGHT);
    this.addStaticObstacle(ROOM_WIDTH - 20, ROOM_HEIGHT / 2, 40, ROOM_HEIGHT);

    // Cada ala rearranja os móveis e os corredores, criando rotas diferentes.
    const furnitureLayouts = [
      [{ x: 400, y: 160, w: 140, h: 150 }, { x: 125, y: 140, w: 150, h: 130 }, { x: 595, y: 140, w: 120, h: 110 }, { x: 720, y: 130, w: 80, h: 100 }, { x: 95, y: 430, w: 75, h: 190 }, { x: 720, y: 380, w: 65, h: 150 }, { x: 720, y: 530, w: 65, h: 90 }],
      [{ x: 390, y: 175, w: 150, h: 135 }, { x: 660, y: 140, w: 120, h: 130 }, { x: 175, y: 140, w: 120, h: 110 }, { x: 80, y: 130, w: 70, h: 100 }, { x: 660, y: 430, w: 75, h: 175 }, { x: 80, y: 380, w: 65, h: 145 }, { x: 80, y: 530, w: 65, h: 80 }],
      [{ x: 400, y: 180, w: 155, h: 140 }, { x: 125, y: 140, w: 145, h: 125 }, { x: 595, y: 140, w: 115, h: 105 }, { x: 720, y: 130, w: 75, h: 95 }, { x: 130, y: 430, w: 75, h: 170 }, { x: 700, y: 385, w: 70, h: 140 }, { x: 690, y: 525, w: 70, h: 85 }]
    ];
    furnitureLayouts[this.stage - 1].forEach(({ x, y, w, h }) => this.addStaticObstacle(x, y, w, h));
  }

  addStaticObstacle(x, y, w, h) {
    const obs = this.obstacles.create(x, y, null);
    obs.body.setSize(w, h);
    obs.setVisible(false);
  }

  // ===== INTERACTABLE OBJECTS & SPARKLES =====
  setupInteractables() {
    this.interactables = [];

    // Sparkle pulse helper
    const addSparkle = (x, y) => {
      const sp = this.add.text(x, y - 10, '✦', {
        fontSize: '14px',
        color: '#F4D56D'
      }).setOrigin(0.5).setDepth(14);

      this.tweens.add({
        targets: sp,
        scaleX: 1.3, scaleY: 1.3,
        alpha: { from: 0.3, to: 1 },
        duration: 1200,
        yoyo: true,
        repeat: -1
      });
      return sp;
    };

    // 1. Music Box
    this.musicBox = this.add.image(625, 135, 'item_music_box').setScale(0.9);
    const mbSparkle = addSparkle(625, 135);
    this.interactables.push({
      sprite: this.musicBox,
      sparkle: mbSparkle,
      action: () => this.openPuzzle()
    });

    // 2. Note 1 (Desk)
    const noteSpots = [
      [{ x: 95, y: 185 }, { x: 115, y: 370 }, { x: 690, y: 480 }, { x: 315, y: 505 }, { x: 510, y: 360 }],
      [{ x: 210, y: 185 }, { x: 200, y: 390 }, { x: 550, y: 470 }, { x: 360, y: 505 }, { x: 520, y: 300 }],
      [{ x: 150, y: 230 }, { x: 150, y: 400 }, { x: 640, y: 500 }, { x: 320, y: 470 }, { x: 520, y: 390 }],
    ][this.stage - 1];
    this.note1 = this.add.image(noteSpots[0].x, noteSpots[0].y, 'item_note').setScale(0.85);
    const n1Sparkle = addSparkle(noteSpots[0].x, noteSpots[0].y);
    this.interactables.push({
      sprite: this.note1,
      sparkle: n1Sparkle,
      action: () => this.readNote(1, n1Sparkle)
    });

    // 3. Note 2 (Sofa)
    this.note2 = this.add.image(noteSpots[1].x, noteSpots[1].y, 'item_note').setScale(0.85);
    const n2Sparkle = addSparkle(noteSpots[1].x, noteSpots[1].y);
    this.interactables.push({
      sprite: this.note2,
      sparkle: n2Sparkle,
      action: () => this.readNote(2, n2Sparkle)
    });

    // 4. Note 3 (Nightstand)
    this.note3 = this.add.image(noteSpots[2].x, noteSpots[2].y, 'item_note').setScale(0.85);
    const n3Sparkle = addSparkle(noteSpots[2].x, noteSpots[2].y);
    this.interactables.push({
      sprite: this.note3,
      sparkle: n3Sparkle,
      action: () => this.readNote(3, n3Sparkle)
    });

    this.note4 = this.add.image(noteSpots[3].x, noteSpots[3].y, 'item_note').setScale(0.78);
    const n4Sparkle = addSparkle(noteSpots[3].x, noteSpots[3].y);
    this.interactables.push({ sprite: this.note4, sparkle: n4Sparkle, action: () => this.readNote(4, n4Sparkle) });

    this.note5 = this.add.image(noteSpots[4].x, noteSpots[4].y, 'item_note').setScale(0.78);
    const n5Sparkle = addSparkle(noteSpots[4].x, noteSpots[4].y);
    this.interactables.push({ sprite: this.note5, sparkle: n5Sparkle, action: () => this.readNote(5, n5Sparkle) });

    // 5. Wardrobe Hiding Spot
    this.wardrobeSpot = this.add.zone(680, 380, 50, 60);
    this.interactables.push({
      sprite: this.wardrobeSpot,
      action: () => this.toggleHide(this.wardrobeSpot, 'no guarda-roupa')
    });

    // 6. Toy Chest Hiding Spot
    this.chestSpot = this.add.zone(680, 520, 50, 50);
    this.interactables.push({
      sprite: this.chestSpot,
      action: () => this.toggleHide(this.chestSpot, 'no baú')
    });

    // 7. Extra Interactivity: Bookshelf
    const booksSpot = this.add.zone(120, 110, 60, 40);
    this.interactables.push({
      sprite: booksSpot,
      action: () => {
        sounds.playPaperSound();
        this.uiScene.showMessage('📖 "Conto de Fadas: À meia-noite, as bonecas despertam em busca da liberdade..."', '#79C9D0');
      }
    });

    // 8. Extra Interactivity: Mirror
    const mirrorSpot = this.add.zone(570, 110, 50, 40);
    this.interactables.push({
      sprite: mirrorSpot,
      action: () => {
        sounds.playMusicBoxNote('blue');
        this.uiScene.showMessage('🪞 Você olha no espelho da penteadeira, ajeita os laços e ganha determinação!', '#F5A8C8');
      }
    });

    // 9. Extra Interactivity: Teddy Bear
    const teddySpot = this.add.zone(100, 470, 40, 40);
    this.interactables.push({
      sprite: teddySpot,
      action: () => {
        sounds.playMusicBoxNote('yellow');
        this.uiScene.showMessage('🧸 O ursinho de pelúcia parece sussurrar: "Cuidado com o soldadinho!"', '#F4D56D');
      }
    });

    // 10. Key
    this.keySprite = this.add.image(470, 520, 'item_key').setScale(1.1).setVisible(false).setActive(false);
    this.interactables.push({
      sprite: this.keySprite,
      action: () => this.collectKey()
    });

    // 11. Exit Door
    this.door = this.add.zone(400, 550, 60, 50);
    this.interactables.push({
      sprite: this.door,
      action: () => this.tryOpenDoor()
    });
  }

  // ===== ENEMIES =====
  setupEnemies() {
    this.enemies = [];

    const routes = [
      [{ x: 230, y: 270 }, { x: 570, y: 270 }, { x: 570, y: 470 }, { x: 230, y: 470 }],
      [{ x: 170, y: 300 }, { x: 620, y: 300 }, { x: 620, y: 480 }, { x: 170, y: 480 }],
      [{ x: 260, y: 230 }, { x: 540, y: 360 }, { x: 270, y: 490 }, { x: 550, y: 250 }],
    ];
    const soldierWaypoints = routes[this.stage - 1];
    this.patrolToy = new PatrolToy(this, 230, 270, soldierWaypoints);
    this.enemies.push(this.patrolToy);

    this.noiseToy = new NoiseToy(this, this.stage === 2 ? 210 : this.stage === 3 ? 390 : 580, this.stage === 3 ? 420 : 230);
    this.enemies.push(this.noiseToy);
  }

  // ===== COLLISIONS =====
  setupCollisions() {
    this.physics.add.collider(this.player, this.obstacles);

    this.enemies.forEach(enemy => {
      this.physics.add.collider(enemy, this.obstacles);
    });

    this.enemies.forEach(enemy => {
      this.physics.add.overlap(this.player, enemy, () => this.handleCatch(), null, this);
    });
  }

  createAmbientLighting() {
    const vignette = this.add.graphics().setDepth(18);
    vignette.fillGradientStyle(0x382C3A, 0x382C3A, 0x382C3A, 0x382C3A, 0.15, 0.15, 0.35, 0.35);
    vignette.fillRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(100, ROOM_WIDTH - 100);
      const y = Phaser.Math.Between(100, ROOM_HEIGHT - 100);
      const dot = this.add.circle(x, y, 1.5, 0xF4D56D, 0.3).setDepth(19);

      this.tweens.add({
        targets: dot,
        alpha: { from: 0.1, to: 0.6 },
        y: y - Phaser.Math.Between(15, 30),
        duration: Phaser.Math.Between(2500, 5000),
        yoyo: true,
        repeat: -1
      });
    }
  }

  handleInteract() {
    if (this.isGameOver || this.isPuzzleOpen || this.isPaused) return;

    let closest = null;
    let closestDist = 65;

    this.interactables.forEach(item => {
      if (!item.sprite.active || !item.sprite.visible) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.sprite.x, item.sprite.y);
      if (dist < closestDist) {
        closestDist = dist;
        closest = item;
      }
    });

    if (closest) {
      closest.action();
    }
  }

  readNote(noteId, sparkle) {
    const names = { red: 'vermelho', yellow: 'amarelo', blue: 'azul', green: 'verde', pink: 'rosa' };
    const sequence = this.stageSequence.map(color => names[color]);
    const clueSets = [
      `A primeira nota é ${sequence[0]}, como a fita que a bailarina usava.`,
      `A segunda nota vem depois da primeira: procure a cor ${sequence[1]} nas lembranças da boneca.`,
      `A última nota da melodia é ${sequence[2]}. Não toque fora de ordem.`,
      `A caixinha guarda três cores: ${sequence.join(', ')}. Mas os botões não precisam ser tocados de uma vez.`,
      `A ordem completa é: primeiro ${sequence[0]}, depois ${sequence[1]} e, por fim, ${sequence[2]}. A casa escuta cada erro...`
    ];
    const noteText = `✦ Bilhete ${noteId} de 5 • Ala ${this.stage} ✦\n\n"${clueSets[noteId - 1]}"`;

    if (!this.readNotesMap[noteId]) {
      this.readNotesMap[noteId] = true;
      if (this.uiScene) this.uiScene.updateQuest('note');
    }

    this.uiScene.showNarrativeModal(noteText, () => {});
    this.emitNoise(this.player.x, this.player.y, 80);
  }

  toggleHide(spot, placeName) {
    if (this.player.isHiding) {
      this.player.isHiding = false;
      this.player.setPosition(spot.x, spot.y + 40);
      sounds.playHideSound();
      this.uiScene.showMessage(`Você saiu do esconderijo.`);
    } else {
      this.player.isHiding = true;
      this.player.setPosition(spot.x, spot.y);
      sounds.playHideSound();
      this.uiScene.showMessage(`Você se escondeu ${placeName}! Os brinquedos não te veem aqui.`, '#83B99A');
    }
  }

  openPuzzle() {
    if (this.hasKey) {
      this.uiScene.showMessage('A caixinha de música já revelou a chave!');
      return;
    }
    this.isPuzzleOpen = true;
    this.player.setVelocity(0);
    this.uiScene.showPuzzle(
      (success) => this.solvePuzzle(success),
      () => { this.isPuzzleOpen = false; },
      this.stageSequence,
      this.stage
    );
    this.emitNoise(this.musicBox.x, this.musicBox.y, 300);
  }

  solvePuzzle(success) {
    this.isPuzzleOpen = false;
    if (success) {
      this.drawerOpen = true;
      this.keySprite.setVisible(true).setActive(true);
      sounds.playUnlockSound();
      this.uiScene.showMessage('✨ A melodia ressoou com perfeição! Uma chave dourada apareceu perto do tapete!', '#F4D56D');
    } else {
      this.uiScene.showMessage('A melodia desafinou... Releia os cinco bilhetes espalhados pela ala!', '#B32D48');
      this.emitNoise(this.musicBox.x, this.musicBox.y, 400);
    }
  }

  collectKey() {
    if (this.hasKey) return;
    this.hasKey = true;
    this.keySprite.setVisible(false).setActive(false);
    this.uiScene.showMessage('🗝️ Você pegou a Chave Dourada! Corra até a porta ao sul para escapar!', '#F4D56D');
    this.uiScene.updateInventory('key');
  }

  tryOpenDoor() {
    if (this.hasKey) {
      this.doorUnlocked = true;
      this.isGameOver = true;
      this.player.setVelocity(0);
      sounds.playUnlockSound();
      const hasMoreRooms = this.roomsCleared < 2;
      const nextStage = (this.stage % 3) + 1;
      this.uiScene.showMessage(hasMoreRooms ? `🚪 A porta abriu! Uma passagem leva à Ala ${nextStage}...` : '🚪 A última porta se abriu! Você escapou da casa!', '#83B99A');

      this.time.delayedCall(1200, () => {
        this.scene.stop('UIScene');
        if (hasMoreRooms) {
          this.scene.start('BedroomScene', {
            stage: nextStage,
            sequence: this.stageSequence,
            roomsCleared: this.roomsCleared + 1
          });
        } else {
          this.scene.start('VictoryScene');
        }
      });
    } else {
      this.uiScene.showMessage('🚪 A porta está trancada com cadeado. Resolva a caixinha de música para obter a chave!', '#FFF8E7');
    }
  }

  handleCatch() {
    if (this.isGameOver || this.player.isHiding) return;
    this.isGameOver = true;
    this.player.setVelocity(0);
    this.enemies.forEach(e => e.setVelocity(0));

    sounds.playAlertSound();
    this.cameras.main.flash(350, 179, 45, 72);

    this.time.delayedCall(700, () => {
      this.scene.stop('UIScene');
      this.scene.start('DefeatScene');
    });
  }

  emitNoise(x, y, range) {
    if (this.noiseToy && this.noiseToy.hearNoise) {
      this.noiseToy.hearNoise(x, y);
    }
  }

  togglePause() {
    if (this.isGameOver) return;
    if (this.isPaused) {
      this.isPaused = false;
      this.physics.resume();
      this.uiScene.hidePauseMenu();
    } else {
      this.isPaused = true;
      this.physics.pause();
      this.uiScene.showPauseMenu(
        () => this.togglePause(),
        () => {
          this.scene.stop('UIScene');
          this.scene.restart();
        },
        () => {
          this.scene.stop('UIScene');
          this.scene.start('MenuScene');
        }
      );
    }
  }

  update() {
    if (this.isGameOver || this.isPuzzleOpen || this.isPaused) {
      if (this.isGameOver) this.player.setVelocity(0);
      return;
    }

    // Sprint support: Shift boosts speed
    if (this.wasd.SHIFT.isDown) {
      this.player.speed = 190;
    } else {
      this.player.speed = 135;
    }

    const joystickData = this.uiScene ? this.uiScene.getJoystickData() : null;
    this.player.update(this.cursors, this.wasd, joystickData);

    this.enemies.forEach(enemy => {
      if (enemy.active) {
        enemy.update(this.player);
      }
    });

    this.updateInteractPrompt();

    this.player.setDepth(this.player.y);
    this.enemies.forEach(e => e.setDepth(e.y));
  }

  updateInteractPrompt() {
    let canInteract = false;
    let closestDist = 60;
    let closestSprite = null;

    this.interactables.forEach(item => {
      if (!item.sprite.active || !item.sprite.visible) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.sprite.x, item.sprite.y);
      if (dist < closestDist) {
        closestDist = dist;
        closestSprite = item.sprite;
        canInteract = true;
      }
    });

    if (canInteract && closestSprite) {
      this.interactPrompt.setVisible(true);
      this.interactPrompt.setPosition(closestSprite.x, closestSprite.y - 25);
    } else {
      this.interactPrompt.setVisible(false);
    }

    if (this.uiScene) {
      this.uiScene.setInteractHint(canInteract);
    }
  }
}

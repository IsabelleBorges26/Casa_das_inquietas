import Phaser from 'phaser';
import { COLORS, TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

/**
 * BootScene - Preloads artworks and generates pixel-perfect sprites matching
 * the Casa das Inquietas reference art sheet.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Elegant loading screen
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x2A1F2D);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'CASA DAS INQUIETAS', {
      fontFamily: 'Cinzel Decorative, serif',
      fontSize: '28px',
      color: '#F5A8C8',
      stroke: '#382C3A',
      strokeThickness: 3
    }).setOrigin(0.5);

    const subtitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 15, 'Carregando segredos...', {
      fontFamily: 'Caveat, cursive, sans-serif',
      fontSize: '18px',
      color: '#F4D56D',
    }).setOrigin(0.5);

    // Load background artworks
    this.load.image('menu_bg', '/assets/menu_bg.jpg');
    this.load.image('room_map', '/assets/room_map.jpg');
    this.load.image('intro_bg', '/assets/intro_bg.jpg');
    this.load.image('victory_bg', '/assets/victory_bg.jpg');
    this.load.image('defeat_bg', '/assets/defeat_bg.jpg');
    this.load.image('doll_sprites_raw', '/assets/doll_sprites_raw.jpg');
  }

  create() {
    this.processDollSprites();
    this.generatePatrolToySprites();
    this.generateNoiseToySprites();
    this.generateItemTextures();
    this.generateUITextures();
    this.setupAnimations();

    this.scene.start('MenuScene');
  }

  // ===== PROCESS DOLL SPRITESHEET (CHROMA KEYING & SLICING) =====
  processDollSprites() {
    const rawImage = this.textures.get('doll_sprites_raw').getSourceImage();
    const w = rawImage.width;
    const h = rawImage.height;

    // Create an offscreen canvas to process chroma key
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(rawImage, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Chroma key: replace pure magenta / pinkish-magenta background with transparency
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Detect magenta background (High R and B, low G)
      if (r > 160 && b > 160 && g < 110) {
        data[i + 3] = 0; // Alpha 0
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Slice the 4 views (Frente, Trás, Esquerda, Direita)
    // Approximate horizontal bounds for 4 columns: [0..0.25], [0.25..0.5], [0.5..0.75], [0.75..1.0]
    const views = [
      { key: 'doll_down', startX: 0.05, endX: 0.27, startY: 0.28, endY: 0.82 },
      { key: 'doll_up',   startX: 0.28, endX: 0.52, startY: 0.28, endY: 0.82 },
      { key: 'doll_left', startX: 0.54, endX: 0.76, startY: 0.28, endY: 0.82 },
      { key: 'doll_right',startX: 0.77, endX: 0.98, startY: 0.28, endY: 0.82 }
    ];

    views.forEach(v => {
      const sx = Math.floor(v.startX * w);
      const ex = Math.floor(v.endX * w);
      const sy = Math.floor(v.startY * h);
      const ey = Math.floor(v.endY * h);
      const sw = ex - sx;
      const sh = ey - sy;

      // Extract frame 0 (idle)
      const frameCanvas0 = document.createElement('canvas');
      frameCanvas0.width = 48;
      frameCanvas0.height = 64;
      const fCtx0 = frameCanvas0.getContext('2d');
      fCtx0.imageSmoothingEnabled = false;
      fCtx0.drawImage(canvas, sx, sy, sw, sh, 0, 0, 48, 64);
      this.textures.addCanvas(`${v.key}_0`, frameCanvas0);

      // Extract frame 1 (walk step 1 - slight bob)
      const frameCanvas1 = document.createElement('canvas');
      frameCanvas1.width = 48;
      frameCanvas1.height = 64;
      const fCtx1 = frameCanvas1.getContext('2d');
      fCtx1.imageSmoothingEnabled = false;
      fCtx1.drawImage(canvas, sx, sy, sw, sh, 0, -2, 48, 64);
      this.textures.addCanvas(`${v.key}_1`, frameCanvas1);

      // Extract frame 2 (walk step 2)
      const frameCanvas2 = document.createElement('canvas');
      frameCanvas2.width = 48;
      frameCanvas2.height = 64;
      const fCtx2 = frameCanvas2.getContext('2d');
      fCtx2.imageSmoothingEnabled = false;
      fCtx2.drawImage(canvas, sx, sy, sw, sh, 0, 0, 48, 64);
      this.textures.addCanvas(`${v.key}_2`, frameCanvas2);
    });

    // Also register base 'doll' texture
    this.textures.addCanvas('doll', this.textures.get('doll_down_0').getSourceImage());
  }

  // ===== GENERATE PATROL TOY (TIN SOLDIER) SPRITES =====
  generatePatrolToySprites() {
    const directions = ['down', 'up', 'left', 'right'];

    directions.forEach(dir => {
      [0, 1].forEach(frame => {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 56;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const bob = frame === 1 ? -2 : 0;

        // Shadow
        ctx.fillStyle = 'rgba(40, 20, 30, 0.4)';
        ctx.beginPath();
        ctx.ellipse(20, 52, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wind-up Key (behind body or on back)
        if (dir === 'up' || dir === 'left' || dir === 'right') {
          ctx.fillStyle = '#F4D56D';
          ctx.fillRect(dir === 'left' ? 26 : 14, 26 + bob, 6, 4);
          ctx.beginPath();
          ctx.arc(dir === 'left' ? 32 : 11, 28 + bob, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shako Hat (Blue & Gold)
        ctx.fillStyle = '#304878';
        ctx.fillRect(11, 4 + bob, 18, 16);
        // Hat gold trim & visor
        ctx.fillStyle = '#F4D56D';
        ctx.fillRect(10, 18 + bob, 20, 3);
        ctx.fillRect(18, 6 + bob, 4, 6);
        // Feather/pom-pom
        ctx.fillStyle = '#F5A8C8';
        ctx.beginPath();
        ctx.arc(20, 3 + bob, 3, 0, Math.PI * 2);
        ctx.fill();

        // Face
        ctx.fillStyle = '#FFE0BD';
        ctx.fillRect(13, 20 + bob, 14, 10);

        if (dir === 'down') {
          // Eyes
          ctx.fillStyle = '#2A1F2D';
          ctx.fillRect(15, 23 + bob, 2, 3);
          ctx.fillRect(23, 23 + bob, 2, 3);
          // Rosy cheeks
          ctx.fillStyle = '#F5A8C8';
          ctx.fillRect(14, 26 + bob, 2, 2);
          ctx.fillRect(24, 26 + bob, 2, 2);
          // Mustache
          ctx.fillStyle = '#4A3228';
          ctx.fillRect(17, 27 + bob, 6, 2);
        } else if (dir === 'left') {
          ctx.fillStyle = '#2A1F2D';
          ctx.fillRect(14, 23 + bob, 2, 3);
          ctx.fillStyle = '#F5A8C8';
          ctx.fillRect(13, 26 + bob, 2, 2);
        } else if (dir === 'right') {
          ctx.fillStyle = '#2A1F2D';
          ctx.fillRect(24, 23 + bob, 2, 3);
          ctx.fillStyle = '#F5A8C8';
          ctx.fillRect(25, 26 + bob, 2, 2);
        }

        // Red Military Jacket
        ctx.fillStyle = '#B32D48';
        ctx.fillRect(11, 30 + bob, 18, 14);

        // Gold Epaulets
        ctx.fillStyle = '#F4D56D';
        ctx.fillRect(9, 30 + bob, 4, 4);
        ctx.fillRect(27, 30 + bob, 4, 4);

        // Cross-belts & Buttons
        ctx.fillStyle = '#FFF8E7';
        if (dir === 'down') {
          ctx.fillRect(13, 31 + bob, 3, 11);
          ctx.fillRect(24, 31 + bob, 3, 11);
          ctx.fillStyle = '#F4D56D';
          ctx.fillRect(18, 32 + bob, 4, 2);
          ctx.fillRect(18, 36 + bob, 4, 2);
          ctx.fillRect(18, 40 + bob, 4, 3); // Belt buckle
        }

        // Blue Trousers
        ctx.fillStyle = '#304878';
        ctx.fillRect(13, 44 + bob, 6, 6);
        ctx.fillRect(21, 44 + bob, 6, 6);

        // Black Boots
        ctx.fillStyle = '#1A141C';
        const legOff = frame === 1 ? 2 : 0;
        ctx.fillRect(12, 49 + bob, 7, 5 + legOff);
        ctx.fillRect(21, 49 + bob, 7, 5 - legOff);

        this.textures.addCanvas(`patrol_${dir}_${frame}`, canvas);
      });
    });

    this.textures.addCanvas('patrol_toy', this.textures.get('patrol_down_0').getSourceImage());
  }

  // ===== GENERATE NOISE TOY (MECHANICAL CLOWN) SPRITES =====
  generateNoiseToySprites() {
    const directions = ['down', 'up', 'left', 'right'];

    directions.forEach(dir => {
      [0, 1].forEach(frame => {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 56;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const bob = frame === 1 ? -2 : 0;

        // Shadow
        ctx.fillStyle = 'rgba(40, 20, 30, 0.4)';
        ctx.beginPath();
        ctx.ellipse(20, 52, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wind-up Key on side
        ctx.fillStyle = '#F4D56D';
        ctx.fillRect(dir === 'right' ? 7 : 27, 22 + bob, 6, 4);
        ctx.beginPath();
        ctx.arc(dir === 'right' ? 5 : 35, 24 + bob, 5, 0, Math.PI * 2);
        ctx.fill();

        // Pointy Hat (Blue & Yellow)
        ctx.fillStyle = '#79C9D0';
        ctx.beginPath();
        ctx.moveTo(20, 2 + bob);
        ctx.lineTo(12, 18 + bob);
        ctx.lineTo(28, 18 + bob);
        ctx.closePath();
        ctx.fill();

        // Hat Pom-pom
        ctx.fillStyle = '#F4D56D';
        ctx.beginPath();
        ctx.arc(20, 3 + bob, 3, 0, Math.PI * 2);
        ctx.fill();

        // Porcelain Face (White)
        ctx.fillStyle = '#FFF8F0';
        ctx.fillRect(12, 18 + bob, 16, 12);

        if (dir === 'down') {
          // Blue Eyes
          ctx.fillStyle = '#79C9D0';
          ctx.fillRect(14, 21 + bob, 3, 3);
          ctx.fillRect(23, 21 + bob, 3, 3);
          // Red nose
          ctx.fillStyle = '#B32D48';
          ctx.fillRect(19, 23 + bob, 2, 2);
          // Big smile
          ctx.fillStyle = '#B32D48';
          ctx.fillRect(17, 26 + bob, 6, 2);
          // Cheek spots
          ctx.fillStyle = '#F5A8C8';
          ctx.fillRect(13, 24 + bob, 2, 2);
          ctx.fillRect(25, 24 + bob, 2, 2);
        }

        // Ruffled Clown Collar (Blue / Teal)
        ctx.fillStyle = '#79C9D0';
        ctx.fillRect(8, 30 + bob, 24, 4);

        // Striped Body (Pink & Yellow)
        ctx.fillStyle = '#F5A8C8';
        ctx.fillRect(11, 34 + bob, 18, 12);
        ctx.fillStyle = '#F4D56D';
        ctx.fillRect(15, 34 + bob, 4, 12);
        ctx.fillRect(21, 34 + bob, 4, 12);

        // Little Clown Shoes
        ctx.fillStyle = '#B32D48';
        const footOff = frame === 1 ? 1 : 0;
        ctx.fillRect(10, 46 + bob + footOff, 8, 6);
        ctx.fillRect(22, 46 + bob - footOff, 8, 6);

        this.textures.addCanvas(`noise_${dir}_${frame}`, canvas);
      });
    });

    this.textures.addCanvas('noise_toy', this.textures.get('noise_down_0').getSourceImage());
  }

  // ===== GENERATE INTERACTIVE ITEM TEXTURES =====
  generateItemTextures() {
    // 1. Chave (Key with delicate pink ribbon bow)
    const keyCanvas = document.createElement('canvas');
    keyCanvas.width = 36;
    keyCanvas.height = 36;
    const kCtx = keyCanvas.getContext('2d');
    // Golden key stem & bit
    kCtx.fillStyle = '#F4D56D';
    kCtx.beginPath();
    kCtx.arc(12, 12, 6, 0, Math.PI * 2);
    kCtx.fill();
    kCtx.fillStyle = '#2A1F2D';
    kCtx.beginPath();
    kCtx.arc(12, 12, 3, 0, Math.PI * 2);
    kCtx.fill();
    kCtx.fillStyle = '#F4D56D';
    kCtx.fillRect(15, 15, 14, 4);
    kCtx.fillRect(25, 19, 4, 4);
    kCtx.fillRect(21, 19, 3, 3);
    // Pink Ribbon Bow
    kCtx.fillStyle = '#F5A8C8';
    kCtx.beginPath();
    kCtx.arc(15, 14, 4, 0, Math.PI * 2);
    kCtx.arc(12, 17, 4, 0, Math.PI * 2);
    kCtx.fill();
    kCtx.fillStyle = '#B32D48';
    kCtx.fillRect(13, 14, 3, 3);
    this.textures.addCanvas('item_key', keyCanvas);

    // 2. Bilhete (Rolled parchment note with red wax seal)
    const noteCanvas = document.createElement('canvas');
    noteCanvas.width = 36;
    noteCanvas.height = 36;
    const nCtx = noteCanvas.getContext('2d');
    nCtx.fillStyle = '#FFF2D6';
    nCtx.fillRect(6, 6, 24, 24);
    nCtx.strokeStyle = '#D4AF7A';
    nCtx.lineWidth = 1;
    nCtx.strokeRect(6, 6, 24, 24);
    // Lines
    nCtx.fillStyle = '#8B6F5C';
    nCtx.fillRect(10, 11, 16, 1.5);
    nCtx.fillRect(10, 15, 14, 1.5);
    nCtx.fillRect(10, 19, 10, 1.5);
    // Red wax seal
    nCtx.fillStyle = '#B32D48';
    nCtx.beginPath();
    nCtx.arc(22, 23, 4, 0, Math.PI * 2);
    nCtx.fill();
    this.textures.addCanvas('item_note', noteCanvas);

    // 3. Caixinha de Música (Music Box with Ballerina)
    const mbCanvas = document.createElement('canvas');
    mbCanvas.width = 44;
    mbCanvas.height = 48;
    const mCtx = mbCanvas.getContext('2d');
    // Box body (Pink & Gold)
    mCtx.fillStyle = '#F5A8C8';
    mCtx.fillRect(8, 24, 28, 18);
    mCtx.fillStyle = '#F4D56D';
    mCtx.fillRect(6, 22, 32, 4);
    mCtx.fillRect(8, 40, 28, 3);
    // Ornate details
    mCtx.fillStyle = '#B32D48';
    mCtx.fillRect(18, 30, 8, 6);
    // Ballerina doll on top
    mCtx.fillStyle = '#FFE0BD';
    mCtx.fillRect(20, 8, 4, 6);
    mCtx.fillStyle = '#F5A8C8';
    mCtx.beginPath();
    mCtx.moveTo(15, 18);
    mCtx.lineTo(29, 18);
    mCtx.lineTo(22, 12);
    mCtx.closePath();
    mCtx.fill();
    this.textures.addCanvas('item_music_box', mbCanvas);

    // 4. Door Open / Padlock states
    const doorOpenCanvas = document.createElement('canvas');
    doorOpenCanvas.width = 80;
    doorOpenCanvas.height = 80;
    const dCtx = doorOpenCanvas.getContext('2d');
    dCtx.fillStyle = '#1A0E1C';
    dCtx.fillRect(10, 10, 60, 70);
    dCtx.fillStyle = '#FFF8E7';
    dCtx.fillRect(20, 10, 40, 70);
    this.textures.addCanvas('door_open', doorOpenCanvas);
  }

  // ===== GENERATE UI TEXTURES =====
  generateUITextures() {
    // Inventory slot frame
    const slotCanvas = document.createElement('canvas');
    slotCanvas.width = 48;
    slotCanvas.height = 48;
    const sCtx = slotCanvas.getContext('2d');
    sCtx.fillStyle = 'rgba(42, 31, 45, 0.85)';
    sCtx.fillRect(0, 0, 48, 48);
    sCtx.strokeStyle = '#F5A8C8';
    sCtx.lineWidth = 2;
    sCtx.strokeRect(2, 2, 44, 44);
    this.textures.addCanvas('ui_slot', slotCanvas);

    // Button background
    const btnCanvas = document.createElement('canvas');
    btnCanvas.width = 220;
    btnCanvas.height = 46;
    const bCtx = btnCanvas.getContext('2d');
    bCtx.fillStyle = '#F5A8C8';
    bCtx.beginPath();
    bCtx.roundRect(0, 0, 220, 46, 23);
    bCtx.fill();
    bCtx.strokeStyle = '#FFFFFF';
    bCtx.lineWidth = 2;
    bCtx.stroke();
    this.textures.addCanvas('btn_pink', btnCanvas);

    // Button hover background
    const btnHoverCanvas = document.createElement('canvas');
    btnHoverCanvas.width = 220;
    btnHoverCanvas.height = 46;
    const bhCtx = btnHoverCanvas.getContext('2d');
    bhCtx.fillStyle = '#FFFFFF';
    bhCtx.beginPath();
    bhCtx.roundRect(0, 0, 220, 46, 23);
    bhCtx.fill();
    bhCtx.strokeStyle = '#F5A8C8';
    bhCtx.lineWidth = 2;
    bhCtx.stroke();
    this.textures.addCanvas('btn_pink_hover', btnHoverCanvas);
  }

  // ===== ANIMATIONS SETUP =====
  setupAnimations() {
    const dirs = ['down', 'up', 'left', 'right'];

    // Doll walking animations
    dirs.forEach(dir => {
      if (!this.anims.exists(`doll_walk_${dir}`)) {
        this.anims.create({
          key: `doll_walk_${dir}`,
          frames: [
            { key: `doll_${dir}_0` },
            { key: `doll_${dir}_1` },
            { key: `doll_${dir}_0` },
            { key: `doll_${dir}_2` }
          ],
          frameRate: 6,
          repeat: -1
        });
      }
    });

    // Patrol Toy walking animations
    dirs.forEach(dir => {
      if (!this.anims.exists(`patrol_walk_${dir}`)) {
        this.anims.create({
          key: `patrol_walk_${dir}`,
          frames: [
            { key: `patrol_${dir}_0` },
            { key: `patrol_${dir}_1` }
          ],
          frameRate: 4,
          repeat: -1
        });
      }
    });

    // Noise Toy walking animations
    dirs.forEach(dir => {
      if (!this.anims.exists(`noise_walk_${dir}`)) {
        this.anims.create({
          key: `noise_walk_${dir}`,
          frames: [
            { key: `noise_${dir}_0` },
            { key: `noise_${dir}_1` }
          ],
          frameRate: 4,
          repeat: -1
        });
      }
    });
  }
}

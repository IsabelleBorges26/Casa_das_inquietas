import Phaser from 'phaser';

// ===== COLOR PALETTE =====
export const COLORS = {
  pink: 0xF5A8C8,
  red: 0xB82D48,
  blue: 0x79C9D0,
  yellow: 0xF4D66D,
  green: 0x83B99A,
  dark: 0x382C3A,
  // Derived colors
  pinkLight: 0xFCD4E4,
  darkLight: 0x504253,
  darkMid: 0x2A1F2D,
  white: 0xFFFFFF,
  cream: 0xFFF8E7,
  brown: 0x6B4C3B,
  brownLight: 0x8B6F5C,
  brownDark: 0x4A3228,
};

export const COLOR_STRINGS = {
  pink: '#F5A8C8',
  red: '#B82D48',
  blue: '#79C9D0',
  yellow: '#F4D66D',
  green: '#83B99A',
  dark: '#382C3A',
  pinkLight: '#FCD4E4',
  darkLight: '#504253',
  darkMid: '#2A1F2D',
  white: '#FFFFFF',
  cream: '#FFF8E7',
};

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const TILE_SIZE = 32;

// Room dimensions (in tiles)
export const ROOM_COLS = 25;
export const ROOM_ROWS = 19;
export const ROOM_WIDTH = ROOM_COLS * TILE_SIZE;
export const ROOM_HEIGHT = ROOM_ROWS * TILE_SIZE;

// Cada ala da casa possui uma sequência própria, revelada pelos bilhetes.
export const PUZZLE_SEQUENCES = [
  ['red', 'yellow', 'blue'],
  ['blue', 'red', 'yellow'],
  ['yellow', 'blue', 'red'],
];
export const PUZZLE_SOLUTION = PUZZLE_SEQUENCES[0];

// Font config
export const FONT_FAMILY = 'Fredoka, Patrick Hand, sans-serif';

export const gameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#2A1F2D',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  pixelArt: true,
};

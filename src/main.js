import Phaser from 'phaser';
import { gameConfig } from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import IntroScene from './scenes/IntroScene.js';
import BedroomScene from './scenes/BedroomScene.js';
import UIScene from './scenes/UIScene.js';
import VictoryScene from './scenes/VictoryScene.js';
import DefeatScene from './scenes/DefeatScene.js';

const config = {
  ...gameConfig,
  scene: [BootScene, MenuScene, IntroScene, BedroomScene, UIScene, VictoryScene, DefeatScene]
};

const game = new Phaser.Game(config);

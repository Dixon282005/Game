import MainMenu from './mainMenu.js';
import GameScene from './gameScene.js'; 
import PauseMenu from './pauseMenu.js';

const config = {
    width: 320 * 2,
    height: 180 * 2,
    parent: 'container',
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scene: [MainMenu, GameScene, PauseMenu] // Usa las escenas como un array
};

var game = new Phaser.Game(config);

export default class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.image('background', 'src/assets/img/drawed_bg.png');
    }

    create() {
        // Fondo ajustado al tamaño de la pantalla
        this.add.image(0, 0, 'background')
            .setOrigin(0, 0)
            .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Título del juego
        this.add.text(this.sys.game.config.width / 2, 80, 'SeaQuest 2.0', {
            fontSize: '42px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Texto para iniciar
        this.add.text(this.sys.game.config.width / 2, 150, 'Presiona ENTER para comenzar', {
            fontSize: '25px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Captura de la tecla ENTER
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.scene.start('GameScene');
        }
    }
}

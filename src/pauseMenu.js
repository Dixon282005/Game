export default class PauseMenu extends Phaser.Scene {
    constructor() {
        super('PauseMenu');
        this.selectedIndex = 0;
        this.options = [];
    }

    create() {
        const centerX = this.sys.game.config.width / 2;

        // Fondo oscuro
        this.add.rectangle(
            centerX,
            this.sys.game.config.height / 2,
            this.sys.game.config.width,
            this.sys.game.config.height,
            0x000000,
            0.6
        );

        // Opciones del menú
        this.options = [
            this.add.text(centerX, 100, 'Reanudar', this.getStyle(false)).setOrigin(0.5),
            this.add.text(centerX, 160, 'Salir', this.getStyle(false)).setOrigin(0.5)
        ];

        this.updateSelection();

        // Teclas
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        // Navegar por opciones
        if (Phaser.Input.Keyboard.JustDown(this.keyUp)) {
            this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
            this.updateSelection();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyDown)) {
            this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
            this.updateSelection();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
            if (this.selectedIndex === 0) {
                this.resumeGame();
            } else if (this.selectedIndex === 1) {
                this.exitToMenu();
            }
        }
    }

    updateSelection() {
        this.options.forEach((option, index) => {
            option.setStyle(this.getStyle(index === this.selectedIndex));
        });
    }

    getStyle(selected) {
        return {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: selected ? '#003566' : '#ffffff',
            backgroundColor: selected ? '#ffc300' : '#000000',
            padding: { x: 20, y: 10 }
        };
    }

    resumeGame() {
        this.scene.stop(); // Cierra este menú
        this.scene.resume('GameScene'); // Reanuda el juego
    }

    exitToMenu() {
        this.scene.stop('GameScene');
        this.scene.start('MainMenu');
    }
}

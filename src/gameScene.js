// src/GameScene.js
import Enemies from "./enemies.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('submarine', 'src/assets/submar.png');
        this.load.image('bullet', 'src/assets/bullet.png');
        this.load.image("background", "src/assets/drawed_bg.png");
        this.load.image('enemy', 'src/assets/bullet.png');
        this.load.image('pause', 'src/assets/pause_button.png');
    }

    create() {
        this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        this.submarine = this.physics.add.sprite(80, 100, 'submarine').setScale(1).setOrigin(0.5);
        this.submarine.body.setCollideWorldBounds(true);
        this.submarine.body.setDrag(0, 0);
        this.submarine.body.setMaxVelocity(200, 200);

        this.lastDirection = 'right';
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Tecla espacio para disparar

        this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P); // Tecla P para pausar

        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W) // Tecla W para moverse hacia arriba
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S) // Tecla S para moverse hacia abajo
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A) // Tecla A para moverse hacia la izquierda
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D) // Tecla D para moverse hacia la derecha

        this.bullets = this.physics.add.group(); // Grupo de balas

        this.physics.world.on('worldbounds', function(body) {
            if (body.gameObject) {
                body.gameObject.destroy();
            }
        });

        this.enemies = new Enemies(this);
        this.enemies.create(); // Crear enemigos

        // Botón de pausa en la esquina superior derecha
        this.pauseButton = this.add.image(this.sys.game.config.width - 30, 30, 'pause')
            .setInteractive()
            .setScale(0.5)
            .setScrollFactor(0)
            .setDepth(10);

        // Acción al hacer clic
        this.pauseButton.on('pointerdown', () => {
            if (!this.scene.isPaused()) {
                this.scene.launch('PauseMenu');
                this.scene.pause();
            }
        });

        //  Limite de movimiento del submarino (coincide con el área azul visible)
        this.movementBounds = {
            left: 60,
            right: 585,
            top: 110,
            bottom: 385
        };
    }

    update() {
        const speed = 150;

        // Verificar si el juego está pausado con la llave P
        if (Phaser.Input.Keyboard.JustDown(this.keyP)) {
            if (!this.scene.isPaused()) {
                this.scene.launch('PauseMenu');
                this.scene.pause();
            }
        }

        // Movimiento horizontal del submarino
        if (this.cursors.left.isDown || this.keyA.isDown) {
            this.submarine.body.setVelocityX(-speed);
            this.submarine.setFlipX(true);
            this.lastDirection = 'left';
        } else if (this.cursors.right.isDown || this.keyD.isDown) {
            this.submarine.body.setVelocityX(speed);
            this.submarine.setFlipX(false);
            this.lastDirection = 'right';
        } else {
            this.submarine.body.setVelocityX(0);
        }

        // Movimiento vertical del submarino
        if (this.cursors.up.isDown || this.keyW.isDown) {
            this.submarine.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.keyS.isDown) {
            this.submarine.body.setVelocityY(speed);
        } else {
            this.submarine.body.setVelocityY(0);
        }

        //  Limitar la posición del submarino dentro del área permitida (borde azul)
        this.submarine.x = Phaser.Math.Clamp(this.submarine.x, this.movementBounds.left, this.movementBounds.right);
        this.submarine.y = Phaser.Math.Clamp(this.submarine.y, this.movementBounds.top, this.movementBounds.bottom);

        // Disparar balas
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            this.shootBullet();
        }

        this.enemies.update();
    }

    // Método para disparar balas
    shootBullet() {
        const offsetX = this.lastDirection === 'right' ? 20 : -20;
        const bullet = this.bullets.create(this.submarine.x + offsetX, this.submarine.y, 'bullet');
        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
        bullet.setVelocityX(this.lastDirection === 'right' ? 300 : -300);
        bullet.setScale(0.5);
    }

    // Método para crear el overlay de pausa
    showPauseOverlay() {
        this.pauseText.setVisible(true);

        this.input.once('pointerdown', () => {
            this.scene.resume();
            this.physics.resume();
            this.pauseText.setVisible(false);
        });
    }

    // Metodo para mostrar el menú de pausa
    showPauseMenu() {
        // Fondo oscuro translúcido
        this.pauseOverlay = this.add.rectangle(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2,
            this.sys.game.config.width,
            this.sys.game.config.height,
            0x000000,
            0.6
        ).setDepth(50);

        // Botón Reanudar
        this.resumeButton = this.add.text(this.sys.game.config.width / 2, 100, 'Reanudar', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#007700',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setDepth(51);

        this.resumeButton.on('pointerdown', () => {
            this.resumeGame();
        });

        // Botón Salir
        this.exitButton = this.add.text(this.sys.game.config.width / 2, 160, 'Salir', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#770000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setDepth(51);

        this.exitButton.on('pointerdown', () => {
            this.scene.stop(); // Detener GameScene
            this.scene.start('MainMenu'); // Ir al menú principal
        });

        if (Phaser.Input.Keyboard.JustDown(this.keyEsc) && !this.isPaused) {
            this.physics.pause();              // Detener físicas
            this.isPaused = true;             // Marcar como pausado
            this.showPauseMenu();             // Mostrar menú
        }
    }

    // Método para reanudar el juego
    resumeGame() {
        this.scene.resume();
        this.physics.resume();

        // Eliminar elementos del menú
        this.pauseOverlay.destroy();
        this.resumeButton.destroy();
        this.exitButton.destroy();
    }

}

// src/GameScene.js
import Enemies from "./enemies.js";
import MusicController from './MusicManager.js';


export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.playerHealth = 100;
        this.score = 0;
        this.music = null;
    }

    async preload() {
        this.load.image('submarine', 'src/assets/img/submar_cut.png');
        this.load.image('bullet', 'src/assets/img/bullet_cut.png');
        this.load.image('background', 'src/assets/img/drawed_bg.png');
        this.load.image('pause', 'src/assets/img/pause_button.png');

        // Inicializar sistema de enemigos
        this.enemies = new Enemies(this);
        this.enemies.preload();

        //Solo funciona si se pone aqui XD
        this.music = new MusicController(this);
        this.music.preload(); // Sin await!
    }


    //Estas solo en esto bro ☠️☠️☠️

    create() {
        // Salud y puntuación inicial
        this.maxHealth = 100;
        this.playerHealth = this.maxHealth;
        this.score = 0;

        // Configuración inicial
        this.setupBackground();
        this.setupPlayer();
        this.highScore = this.highScore || 0;
        this.setupUI();
        this.setupControls();
        this.setupPhysics();
        this.setupPauseButton();

        // Inicializar enemigos correctamente
        this.enemies = new Enemies(this); // Asegúrate de crear nueva instancia
        this.enemies.setBounds(this.movementBounds, this.enemySpawnBounds); // Si aplica
        this.enemies.create(); // Llama al método interno del sistema de enemigos

        this.music.init();
        this.music.startPlaylist();

        this.events.on('pause', () => this.music.stop());
        this.events.on('resume', () => this.music.startPlaylist());
    }

    setupBackground() {
        this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.background.setDisplaySize(this.game.config.width, this.game.config.height);

        // Área de movimiento DEL SUBMARINO (ajustada al área azul del mar)
        this.movementBounds = {
            left: 80,                   // Margen izquierdo del área navegable
            right: this.game.config.width - 80,  // Margen derecho
            top: 120,                   // Límite superior (bajo la superficie)
            bottom: this.game.config.height - 60 // Fondo del mar
        };

        // Área de spawn de ENEMIGOS (más amplia que los límites del submarino)
        this.enemySpawnBounds = {
            left: -100,                 // Spawn fuera de pantalla por la izquierda
            right: this.game.config.width + 100, // Spawn fuera por la derecha
            top: 100,                   // Spawn arriba del área jugable
            bottom: this.game.config.height - 40 // Spawn cerca del fondo
        };

        // Pasa ambos sets de límites a los enemigos
        this.enemies.setBounds(this.movementBounds, this.enemySpawnBounds);
    }


    setupPlayer() {
        this.submarine = this.physics.add.sprite(80, 100, 'submarine')
            .setScale(1)
            .setOrigin(0.5)
            .setCollideWorldBounds(true);

        this.submarine.body.setDrag(0, 0).setMaxVelocity(200, 200);
    }

    setupUI() {
        // Puntuación
        this.scoreText = this.add.text(16, 16, `Points: ${this.score}`, {
            fontSize: '18px',
            fill: '#ffffff',
        }).setScrollFactor(0);

        this.highScoreText = this.add.text(16, 44, `Record: ${this.highScore}`, {
            fontSize: '18px',
            fill: '#000000',
            backgroundColor: '#eaf4f4',
        }).setScrollFactor(0);

        // Oxígeno
        const barWidth = 200;
        const barHeight = 20;
        const x = (this.game.config.width / 2) - (barWidth / 2);
        const y = this.game.config.height - 40;

        // Borde negro
        this.oxygenBarBorder = this.add.graphics();
        this.oxygenBarBorder.lineStyle(2, 0x000000, 1); // Grosor 2px, negro, opacidad 100%
        this.oxygenBarBorder.strokeRect(x - 1, y - 1, barWidth + 2, barHeight + 2);

        // Contenedor de fondo
        this.oxygenBarBackground = this.add.graphics();
        this.oxygenBarBackground.fillStyle(0x444444, 1);
        this.oxygenBarBackground.fillRect(x, y, barWidth, barHeight);

        // Barra dinámica (cambia con oxígeno actual)
        this.oxygenBar = this.add.graphics();
        this.oxygenBar.setScrollFactor(0);

        this.oxygenBarPosition = { x, y, width: barWidth, height: barHeight };
        this.maxOxygen = 100;
        this.currentOxygen = this.maxOxygen;

        this.updateOxygenBar();

        // Texto "OXYGEN" al lado izquierdo de la barra
        this.oxygenLabel = this.add.text(
            x - 80, // un poco a la izquierda del borde
            y + 2,  // alineado verticalmente
            'OXYGEN',
            {
                fontSize: '16px',
                fill: '#000000',
                fontStyle: 'bold'
            }
        ).setScrollFactor(0);
    }

    updateOxygenBar() {
        const { x, y, width, height } = this.oxygenBarPosition;
        const percentage = Phaser.Math.Clamp(this.currentOxygen / this.maxOxygen, 0, 1);

        this.oxygenBar.clear();
        this.oxygenBar.fillStyle(0x00bfff, 1); // Azul claro
        this.oxygenBar.fillRect(x, y, width * percentage, height);
    }


    setupControls() {
        // Controles de teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        // Teclas WASD alternativas
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    setupPhysics() {
        // Grupo de balas del jugador
        this.bullets = this.physics.add.group();

        // Configurar colisiones con los límites del mundo
        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject && body.gameObject.active) {
                body.gameObject.destroy();
            }
        });
    }

    setupPauseButton() {
        // Botón de pausa en la UI
        this.pauseButton = this.add.image(
            this.game.config.width - 30,
            30,
            'pause'
        )
            .setInteractive()
            .setScale(0.5)
            .setScrollFactor(0)
            .setDepth(10);

        this.pauseButton.on('pointerdown', () => this.togglePause());
    }

    update() {
        if (this.scene.isPaused()) return;

        this.handlePlayerMovement();
        this.handleShooting();
        this.checkPauseInput();
    }

    handlePlayerMovement() {
        const speed = 150;
        let velocityX = 0;
        let velocityY = 0;

        // Movimiento horizontal
        if (this.cursors.left.isDown || this.keyA.isDown) {
            velocityX = -speed;
            this.submarine.setFlipX(true);
            this.lastDirection = 'left';
        } else if (this.cursors.right.isDown || this.keyD.isDown) {
            velocityX = speed;
            this.submarine.setFlipX(false);
            this.lastDirection = 'right';
        }

        // Movimiento vertical
        if (this.cursors.up.isDown || this.keyW.isDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.keyS.isDown) {
            velocityY = speed;
        }

        this.submarine.body.setVelocity(velocityX, velocityY);

        // Limitar movimiento dentro de los bounds
        this.submarine.x = Phaser.Math.Clamp(
            this.submarine.x,
            this.movementBounds.left,
            this.movementBounds.right
        );
        this.submarine.y = Phaser.Math.Clamp(
            this.submarine.y,
            this.movementBounds.top,
            this.movementBounds.bottom
        );
    }

    handleShooting() {
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            this.shootBullet();
        }
    }

    shootBullet() {
        const offsetX = this.lastDirection === 'right' ? 20 : -20;
        const bullet = this.bullets.create(
            this.submarine.x + offsetX,
            this.submarine.y,
            'bullet'
        );

        bullet.setVelocityX(this.lastDirection === 'right' ? 300 : -300);
        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
        bullet.setScale(0.5);

        // Auto-destrucción después de 1 segundo
        this.time.delayedCall(1000, () => {
            if (bullet.active) bullet.destroy();
        });
    }

    shutdown() {
        // Limpiar música al cambiar de escena
        if (this.music) {
            this.music.destroy();
        }
    }

    checkPauseInput() {
        if (Phaser.Input.Keyboard.JustDown(this.keyP)) {
            this.togglePause();
        }
    }

    togglePause() {
        if (this.scene.isPaused()) {
            this.scene.resume();
        } else {
            this.scene.launch('PauseMenu');
            this.scene.pause();
        }
    }

    playerTakeDamage(damage) {
        this.currentOxygen -= damage;

        if (this.currentOxygen < 0) {
            this.currentOxygen = 0;
        }

        this.updateOxygenBar();

        // Feedback visual
        this.submarine.setTint(0xff0000);
        this.time.delayedCall(200, () => this.submarine.clearTint());

        // Verificar game over
        if (this.currentOxygen === 0) {
            this.gameOver();
        }
    }

    replenishOxygen(amount) {
        this.currentOxygen = Phaser.Math.Clamp(this.currentOxygen + amount, 0, this.maxOxygen);
        this.updateOxygenBar();
    }


    updateScore(points) {
        this.score += points;
        this.scoreText.setText(`Points: ${this.score}`);
    }

    gameOver() {
        this.physics.pause();

        if (this.music) {
            this.music.stop();
        }

        // Verificar y actualizar récord si es necesario
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }

        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'GAME OVER',
            {
                fontSize: '64px',
                fill: '#ff0000',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Opción para reiniciar
        const restartText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            'Presiona R para reiniciar',
            { fontSize: '32px', fill: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);

        this.input.keyboard.once('keydown-R', () => {
            this.scene.restart();
        });

        if (this.enemies) {
            this.enemies.stop();    // Detener timers de oleadas
            this.enemies.destroy(); // Eliminar todos los enemigos activos
        }
    }
}
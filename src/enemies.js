// enemies.js
export default class Enemies {
    constructor(scene) {
        this.scene = scene;
        this.enemies = this.scene.physics.add.group();
        this.spawnTimer = null;
        this.difficultyLevel = 1;
        this.spawnRate = 3000; // 3 segundos inicialmente
    }

    create() {
        // Configurar colisiones entre enemigos y jugador
        this.scene.physics.add.collider(
            this.scene.submarine,
            this.enemies,
            this.handleCollision,
            null,
            this
        );

        // Iniciar el spawn de enemigos
        this.startSpawning();
    }

    startSpawning() {
        this.spawnTimer = this.scene.time.addEvent({
            delay: this.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    spawnEnemy() {
        // Posición aleatoria en los bordes de la pantalla
        let x, y;
        if (Phaser.Math.Between(0, 1) === 0) {
            x = Phaser.Math.Between(0, this.scene.game.config.width);
            y = Phaser.Math.Between(0, 1) === 0 ? 0 : this.scene.game.config.height;
        } else {
            x = Phaser.Math.Between(0, 1) === 0 ? 0 : this.scene.game.config.width;
            y = Phaser.Math.Between(0, this.scene.game.config.height);
        }

        // Crear enemigo con propiedades basadas en la dificultad
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setScale(0.8 + (this.difficultyLevel * 0.05));
        
        // Configurar física
        enemy.body.setCollideWorldBounds(true);
        enemy.speed = 50 + (this.difficultyLevel * 10);
        
        // Movimiento hacia el jugador
        this.scene.physics.moveToObject(enemy, this.scene.submarine, enemy.speed);

        // Aumentar dificultad gradualmente
        this.difficultyLevel += 0.1;
        this.spawnRate = Math.max(500, 3000 - (this.difficultyLevel * 100)); // Más frecuente
    }

    handleCollision(submarine, enemy) {
        // Lógica cuando colisionan
        this.scene.cameras.main.shake(200, 0.01); // Efecto de pantalla
        submarine.setTint(0xff0000); // Feedback visual
        this.scene.time.delayedCall(200, () => submarine.clearTint());
        
        // Aquí puedes reducir vida, etc.
        console.log('¡Colisión con enemigo!');
    }

    update() {
        // Actualizar lógica de enemigos si es necesario
    }

    destroy() {
        // Limpieza
        if (this.spawnTimer) this.spawnTimer.destroy();
        this.enemies.clear(true, true);
    }
}
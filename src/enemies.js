export default class Enemies {
    constructor(scene) {
        this.scene = scene;
        this.enemies = this.scene.physics.add.group();
        this.spawnTimer = null;
        this.currentWave = 0;
        this.enemiesInWave = 0;
        this.enemiesDefeated = 0;
        this.waveComplete = false;
        this.waveCooldown = false;

        // Configuración de tipos de enemigos
        this.enemyTypes = [
            { 
                key: 'enemy_basic', 
                health: 1, 
                speed: 80, 
                points: 10, 
                scale: 0.7, 
                spawnWeight: 70,
                behavior: 'direct',
                damage: 10
            },
            { 
                key: 'enemy_fast', 
                health: 1, 
                speed: 120, 
                points: 15, 
                scale: 0.6, 
                spawnWeight: 20,
                behavior: 'zigzag',
                damage: 15
            },
            { 
                key: 'enemy_tank', 
                health: 3, 
                speed: 50, 
                points: 30, 
                scale: 0.9, 
                spawnWeight: 10,
                behavior: 'heavy',
                damage: 20
            }
        ];
    }

    preload() {
        this.scene.load.image('enemy_basic', 'src/assets/bullet.png');
        this.scene.load.image('enemy_fast', 'src/assets/bullet.png');
        this.scene.load.image('enemy_tank', 'src/assets/bullet.png');
    }

    setBounds(playerBounds, spawnBounds) {
        this.playerBounds = playerBounds;
        this.spawnBounds = spawnBounds;
        this.bounds = {
            left: spawnBounds.left,
            right: spawnBounds.right,
            top: spawnBounds.top,
            bottom: spawnBounds.bottom
        };
    }

    create() {
        this.scene.physics.add.overlap(
            this.scene.bullets,
            this.enemies,
            this.handleBulletHit,
            null,
            this
        );

        this.scene.physics.add.collider(
            this.scene.submarine,
            this.enemies,
            this.handleSubmarineCollision,
            null,
            this
        );

        this.startNextWave();
    }

    startNextWave() {
        if (this.waveCooldown) return;
        
        this.currentWave++;
        this.enemiesInWave = this.calculateEnemiesCount(this.currentWave);
        this.enemiesDefeated = 0;
        this.waveComplete = false;
        this.waveCooldown = true;

        this.showWaveText(this.currentWave);
        this.setupSpawnTimer(this.currentWave);

        // Liberar el cooldown después de spawnear todos
        this.scene.time.delayedCall(
            this.enemiesInWave * this.getSpawnDelay(this.currentWave), 
            () => { this.waveCooldown = false; }
        );
    }

    calculateEnemiesCount(wave) {
        return 5 + Math.floor(wave * 1.5) + Math.floor(wave / 3);
    }

    getSpawnDelay(wave) {
        return Phaser.Math.Clamp(1500 - (wave * 80), 600, 1500);
    }

    showWaveText(waveNumber) {
        const waveText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            100,
            `OLEADA ${waveNumber}`,
            { 
                fontSize: '48px', 
                fill: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5).setDepth(100);

        this.scene.tweens.add({
            targets: waveText,
            y: 150,
            alpha: 0,
            duration: 2500,
            ease: 'Power2',
            onComplete: () => waveText.destroy()
        });
    }

    setupSpawnTimer(wave) {
        if (this.spawnTimer) {
            this.spawnTimer.destroy();
        }

        this.spawnTimer = this.scene.time.addEvent({
            delay: this.getSpawnDelay(wave),
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    spawnEnemy() {
        if (this.enemiesInWave <= 0 || this.waveComplete) {
            this.spawnTimer.destroy();
            return;
        }

        const type = this.selectEnemyType();
        const { x, y, side } = this.getSpawnPosition();
        this.createEnemy(x, y, side, type);

        this.enemiesInWave--;

        if (this.enemiesInWave <= 0) {
            this.spawnTimer.destroy();
        }
    }

    selectEnemyType() {
        const totalWeight = this.enemyTypes.reduce((sum, type) => sum + type.spawnWeight, 0);
        let random = Phaser.Math.Between(1, totalWeight);
        
        for (const type of this.enemyTypes) {
            if (random <= type.spawnWeight) return type;
            random -= type.spawnWeight;
        }
        return this.enemyTypes[0];
    }

    getSpawnPosition() {
        const side = Phaser.Math.Between(0, 1) ? 'right' : 'left';
        const x = side === 'left' ? this.bounds.left : this.bounds.right;
        const y = Phaser.Math.Between(
            this.playerBounds.top + 50,
            this.playerBounds.bottom - 50
        );
        return { x, y, side };
    }

    createEnemy(x, y, side, type) {
        const enemy = this.enemies.create(x, y, type.key);
        enemy.setScale(type.scale)
            .setData('type', type.key)
            .setData('points', type.points * this.currentWave)
            .setData('damage', type.damage);
        
        enemy.health = Math.floor(type.health * (1 + (this.currentWave * 0.1)));
        this.setEnemyBehavior(enemy, side, type);
    }

    setEnemyBehavior(enemy, side, type) {
        const speed = type.speed * (1 + (this.currentWave * 0.05));
        const velocityX = side === 'left' ? speed : -speed;
        let velocityY = 0;

        switch(type.behavior) {
            case 'zigzag':
                this.scene.tweens.add({
                    targets: enemy,
                    y: {
                        from: enemy.y - 50,
                        to: enemy.y + 50
                    },
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                break;

            case 'heavy':
                velocityY = speed * 0.3;
                enemy.body.setSize(enemy.width * 0.8, enemy.height * 0.8);
                break;

            case 'direct':
            default:
                velocityY = Phaser.Math.Between(-20, 20);
                break;
        }

        enemy.body.setVelocity(velocityX, velocityY);
    }

    handleBulletHit(bullet, enemy) {
        if (!bullet.active || !enemy.active) return;

        bullet.destroy();
        enemy.health--;

        if (enemy.health <= 0) {
            this.destroyEnemy(enemy);
        }
    }

    destroyEnemy(enemy) {
        this.scene.updateScore(enemy.getData('points'));
        this.enemies.killAndHide(enemy);
        enemy.destroy();
        this.enemiesDefeated++;

        this.checkWaveCompletion();
    }

    checkWaveCompletion() {
        const totalEnemies = this.calculateEnemiesCount(this.currentWave);
        
        if (this.enemiesDefeated >= totalEnemies && this.enemiesInWave <= 0) {
            this.waveComplete = true;
            
            // Esperar a que no haya enemigos activos
            const aliveEnemies = this.enemies.getChildren().filter(e => e.active).length;
            
            if (aliveEnemies === 0) {
                this.scene.time.delayedCall(3000, () => this.startNextWave());
            } else {
                this.scene.time.delayedCall(1000, () => this.checkWaveCompletion());
            }
        }
    }

    handleSubmarineCollision(submarine, enemy) {
        if (!submarine.active || !enemy.active) return;

        this.scene.playerTakeDamage(enemy.getData('damage'));
        
        // Feedback visual
        submarine.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => {
            if (submarine.active) submarine.clearTint();
        });
        
        this.enemies.killAndHide(enemy);
        enemy.destroy();
    }

    update() {
        this.cleanupOffscreenEnemies();
    }

    cleanupOffscreenEnemies() {
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            
            if (enemy.x < this.bounds.left - 300 || 
                enemy.x > this.bounds.right + 300 ||
                enemy.y < this.bounds.top - 300 || 
                enemy.y > this.bounds.bottom + 300) {
                this.enemies.killAndHide(enemy);
                enemy.destroy();
            }
        });
    }

    stop() {
        if (this.spawnTimer) {
            this.spawnTimer.destroy();
            this.spawnTimer = null;
        }
    }

    destroy() {
        this.stop();
        this.enemies.clear(true, true);
    }
}
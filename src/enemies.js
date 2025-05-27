export default class Enemies {
    constructor(scene) {
        this.scene = scene;
        this.enemies = this.scene.physics.add.group();
        this.currentWave = 0;
        this.totalEnemiesInWave = 0;
        this.enemiesSpawned = 0;
        this.enemiesDefeated = 0;
        this.spawnTimer = null;
        this.waveDelay = null;

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
        this.scene.load.image('enemy_basic', 'src/assets/enemies_cut.png');
        this.scene.load.image('enemy_fast', 'src/assets/enemies_cut.png');
        this.scene.load.image('enemy_tank', 'src/assets/enemies_cut.png');
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

        this.startFirstWave();
    }

    // Función añadida para calcular enemigos por oleada
    calculateEnemiesCount(wave) {
        return 5 + (wave * 2) + Math.floor(wave / 2);
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
    startFirstWave() {
        this.currentWave = 0;
        this.startNextWave();
    }

    startNextWave() {
        this.clearTimers();
        
        this.currentWave++;

        // Subir 10 puntos de vida si tiene 90 o menos
        if (this.scene.playerHealth <= 90) {
            this.scene.playerHealth += 10;
            this.scene.healthText.setText(`Salud: ${this.scene.playerHealth}`);

            // Mostrar texto flotante de curación
            const healText = this.scene.add.text(
                this.scene.submarine.x,
                this.scene.submarine.y - 40,
                '+10 Salud',
                {
                    fontSize: '20px',
                    fill: '#00ff00',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5).setDepth(10);

            this.scene.tweens.add({
                targets: healText,
                y: healText.y - 30,
                alpha: 0,
                duration: 1000,
                onComplete: () => healText.destroy()
            });
        }

        this.totalEnemiesInWave = this.calculateEnemiesCount(this.currentWave);
        this.enemiesSpawned = 0;
        this.enemiesDefeated = 0;

        console.log(`COMENZANDO OLEADA ${this.currentWave} con ${this.totalEnemiesInWave} enemigos`);

        this.showWaveText(this.currentWave);
        this.startSpawning();
    }

    clearTimers() {
        if (this.spawnTimer) {
            this.spawnTimer.destroy();
            this.spawnTimer = null;
        }
        if (this.waveDelay) {
            this.waveDelay.destroy();
            this.waveDelay = null;
        }
    }

    startSpawning() {
        const spawnDelay = Phaser.Math.Clamp(1200 - (this.currentWave * 80), 600, 1200);
        
        this.spawnTimer = this.scene.time.addEvent({
            delay: spawnDelay,
            callback: () => {
                if (this.enemiesSpawned < this.totalEnemiesInWave) {
                    this.spawnEnemy();
                    this.enemiesSpawned++;
                    console.log(`Enemigos generados: ${this.enemiesSpawned}/${this.totalEnemiesInWave}`);
                    
                    if (this.enemiesSpawned >= this.totalEnemiesInWave) {
                        this.spawnTimer.destroy();
                    }
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    spawnEnemy() {
        const type = this.selectEnemyType();
        const { x, y, side } = this.getSpawnPosition();
        
        const enemy = this.enemies.create(x, y, type.key);
        enemy.setScale(type.scale)
            .setData('type', type.key)
            .setData('points', type.points * this.currentWave)
            .setData('damage', type.damage);
        
        enemy.health = Math.floor(type.health * (1 + (this.currentWave * 0.1)));

        if (side === 'left') {
            enemy.setFlipX(true);
        }

        this.setEnemyBehavior(enemy, side, type);
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
        if (!enemy.active) return;

        this.scene.updateScore(enemy.getData('points'));
        enemy.destroy();
        this.enemiesDefeated++;

        console.log(`Enemigos derrotados: ${this.enemiesDefeated}/${this.totalEnemiesInWave}`);

        this.checkWaveCompletion();
    }

    checkWaveCompletion() {   
            this.waveDelay = this.scene.time.delayedCall(3000, () => {
                if (this.enemiesSpawned >= this.totalEnemiesInWave) {
                    this.startNextWave();
                } else {
                    this.scene.time.delayedCall(1000, () => this.checkWaveCompletion());
                }
            });
        
    }

    getAliveEnemiesCount() {
        return this.enemies.getChildren().filter(e => e.active).length;
    }

    handleSubmarineCollision(submarine, enemy) {
        if (!submarine.active || !enemy.active) return;

        this.scene.playerTakeDamage(enemy.getData('damage'));
        
        submarine.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => {
            if (submarine.active) submarine.clearTint();
        });
        
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
                enemy.destroy();
            }
        });
    }

    stop() {
        this.clearTimers();
    }

    destroy() {
        this.stop();
        this.enemies.clear(true, true);
    }
}
import Enemies from "./enemies.js"
const config = {
    width: 320*3,
    height: 180*3,
    parent: 'container',
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Sin gravedad para que no se mueva solo
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('submarine', 'src/assets/submar.png');
    this.load.image('bullet', 'src/assets/bullet.png');
    this.load.image("background", "src/assets/drawed_bg.png");
    this.load.image('enemy', 'src/assets/bullet.png')
}

function create() {
    // Fondo (posición centrada)
    this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    this.background.setDisplaySize(config.width, config.height); // Ajusta al tamaño del juego




    // Crear submarino
    this.submarine = this.physics.add.sprite(80, 100, 'submarine');
    this.submarine.setScale(1).setOrigin(0.5, 0.5);
    this.submarine.body.setCollideWorldBounds(true);
    this.submarine.body.setDrag(0, 0); // Sin deslizamiento
    this.submarine.body.setMaxVelocity(200, 200);

    // Dirección actual
    this.lastDirection = 'right';

    // Teclado
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Grupo de balas
    this.bullets = this.physics.add.group();

    // Eliminar balas que salen de pantalla
    this.physics.world.on('worldbounds', function(body) {
        if (body.gameObject) {
            body.gameObject.destroy();
        }
    });

    // Inicializar enemigos
    this.enemies = new Enemies(this);
    this.enemies.create();

}

function update() {
    const speed = 150;
    
    // Movimiento horizontal + flip
    if (this.cursors.left.isDown) {
        this.submarine.body.setVelocityX(-speed);
        this.submarine.setFlipX(true); // Voltea a la izquierda
        this.lastDirection = 'left';
    } else if (this.cursors.right.isDown) {
        this.submarine.body.setVelocityX(speed);
        this.submarine.setFlipX(false); // Orientación original (derecha)
        this.lastDirection = 'right';
    } else {
        this.submarine.body.setVelocityX(0);
    }

    // Movimiento vertical
    if (this.cursors.up.isDown) {
        this.submarine.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
        this.submarine.body.setVelocityY(speed);
    } else {
        this.submarine.body.setVelocityY(0);
    }

    // Disparo con espacio
    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
        shootBullet.call(this);
    }

    this.enemies.update();
}

function shootBullet() {
    const offsetX = this.lastDirection === 'right' ? 20 : -20;
    const bullet = this.bullets.create(this.submarine.x + offsetX, this.submarine.y, 'bullet');
    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;
    bullet.setVelocityX(this.lastDirection === 'right' ? 300 : -300);
    bullet.setScale(0.5); // Ajusta si es necesario
}
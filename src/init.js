const config = {
    width: 320 * 2,
    height: 180 * 2,
    parent: 'container',
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: -100 }, // Gravedad negativa (flotabilidad)
            debug: true // Opcional: ver hitboxes
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
    this.load.image('submarine', 'src/assets/player1.png');
}

function create() {
    // Crear submarino con física
    this.submarine = this.physics.add.sprite(80, 100, 'submarine');
    this.submarine.setScale(1).setOrigin(0.5, 0.5);
    
    // Configurar propiedades del agua
    this.submarine.body.setCollideWorldBounds(true);
    this.submarine.body.setDrag(100, 100); // Resistencia del agua (frenado)
    this.submarine.body.setMaxVelocity(200, 200); // Velocidad máxima

    // Teclas
    this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    const speed = 150;

    if (this.cursors.up.isDown){ //debugin para probar que las tecla de arriba se pulse
        console.log("Tecla Presionada")
    }
    
    // Movimiento horizontal
    if (this.cursors.left.isDown) {
        this.submarine.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
        this.submarine.body.setVelocityX(speed);
    } else {
        this.submarine.body.setVelocityX(0);
    }

    // Movimiento vertical (flotabilidad controlada)
    if (this.cursors.up.isDown) {
        this.submarine.body.setVelocityY(-speed * 1.5); // Subir más rápido
    } else if (this.cursors.down.isDown) {
        this.submarine.body.setVelocityY(speed * 0.8); // Bajar más lento
    }
}
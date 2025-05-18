const config = {
    width: 320 * 2,
    height: 180 * 2,
    parent: 'container',
    type: Phaser.AUTO,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
    // physics: {
    //     default: 'arcade',
    //     arcade: {
    //         gravity: { y: 500 },
    //     }
    // }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('submarine', 'src/assets/submar.png'); // Ruta relativa
}

function create() {
    // Crea el submarino CON física
    this.submarine = this.add.image(80, 100, 'submarine');
    this.submarine.setScale(1)
        .setOrigin(0.5, 0.5)
        // .setFlipX(true)
}

function update() {
}
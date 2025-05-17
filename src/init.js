const config = {
    width: 300,
    height: 180,
    parent: 'container',
    type: Phaser.AUTO,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

var game = new Phaser.Game(config);

function preload() {
    console.log('Preload');
}

function create() {
    console.log('Create');
}

function update(time, delta) {
    //console.log(delta);
}
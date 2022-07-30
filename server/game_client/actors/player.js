class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);

        config.scene.add.existing(this);
        config.scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setScale(1);

        this.attributes = {
            name: config.name,
            playerID: config.playerID,
            moveSpeed: 50,
            isMoving: false,
            portraitIconPath: config.iconPath,
            class: config.class,
            gender: config.gender,
        };

        this.socketID = config.playerID;

        this.targetLocation = {
            x: config.x,
            y: config.y,
        };
    }

    getClass() {
        return this.attributes.class;
    }
}

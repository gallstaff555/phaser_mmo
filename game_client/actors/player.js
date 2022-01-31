class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);

        config.scene.add.existing(this);
        config.scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setScale(1);

        this.attributes = {
            moveSpeed: 50,
            isMoving: false,
            portraitIconPath: config.iconPath,
            class: config.class,
            gender: config.gender,
        };
    }

    getClass() {
        return this.attributes.class;
    }
}

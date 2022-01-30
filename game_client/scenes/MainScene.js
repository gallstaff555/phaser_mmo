class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    preload() {
        //BootScene handles asset loading
    }

    create() {
        //map and tile layers
        map1 = this.make.tilemap({ key: "tilemap", tileWidth: 16, tileHeight: 16 });
        const tileset = map1.addTilesetImage("tiles1", "tiles", 16, 16);
        const backgroundLayer = map1.createLayer("Background", tileset, 0, 0);
        terrainLayer = map1.createLayer("Terrain", tileset, 0, 0);
        terrainLayer.setCollisionByExclusion(-1, true);

        //marker for highlighting tile
        tileMarker = this.add.graphics();
        tileMarker.lineStyle(3, 0xffffff, 1);
        tileMarker.strokeRect(0, 0, map1.tileWidth, map1.tileHeight);

        //new player
        this.player = new Player({
            scene: this,
            key: "druidFemale",
            x: 100,
            y: 200,
            class: "druid",
            gender: "female",
            iconPath: "assets/sprites/icons/druidFemaleIcon.png",
        });

        //add collision detection for player and tile layers
        this.physics.add.collider(this.player, terrainLayer, () => this.player.body.setVelocity(0));

        //set up
        this.setUpDruidAnimations();
        this.setUpControlsAndCamera(backgroundLayer);

        this.scene.add("playerPortraitScene", PlayerPortraitScene, true, {
            x: 50,
            y: 40,
            path: this.player.attributes.portraitIconPath,
        });
    }

    update(time, delta) {
        this.updatePlayerMovement();
        this.updateTileMarker();
    }

    setUpControlsAndCamera(layer) {
        cursors = this.input.keyboard.createCursorKeys();
        this.cameras.main.setBounds(0, 0, 800, 0);

        this.input.on(
            "pointerdown",
            function (pointer) {
                let tile = layer.getTileAtWorldXY(pointer.x, pointer.y);

                //player moves to center of tile
                target.x = tile.getCenterX();
                target.y = tile.getCenterY();

                this.physics.moveToObject(this.player, target, this.player.attributes.moveSpeed);
                this.player.attributes.isMoving = true;
            },
            this
        );
    }

    setUpDruidAnimations() {
        let sprites = ["druidFemale", "druidMale"];
        let directions = ["left", "right"];

        for (let sprite of sprites) {
            //WALK (two directions)
            for (let direction of directions) {
                this.anims.create({
                    key: `walk-${direction}`,
                    frames: this.anims.generateFrameNames(`${sprite}`, {
                        prefix: `${sprite}Walk_`,
                        suffix: ".png",
                        start: 0,
                        end: 3,
                    }),
                    frameRate: 6,
                    repeat: -1,
                });
            }

            //IDLE
            this.anims.create({
                key: `idle`,
                frames: this.anims.generateFrameNames(`${sprite}`, {
                    prefix: `${sprite}Idle_`,
                    suffix: ".png",
                    start: 0,
                    end: 3,
                }),
                frameRate: 1,
                repeat: -1,
            });
        }
    }

    updatePlayerMovement() {
        let angleInDegrees = Phaser.Math.RadToDeg(this.player.body.angle);
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);

        if (this.player.body.speed > 0) {
            if (angleInDegrees >= -90 && angleInDegrees < 90) {
                this.player.play("walk-right", true);
                this.player.flipX = false;
            } else {
                this.player.play("walk-left", true);
                this.player.flipX = true;
            }

            if (distance < 4) {
                this.player.body.reset(target.x, target.y);
                this.player.attributes.isMoving = false;
            }
        } else {
            this.player.play("idle", true);
        }
    }

    updateTileMarker() {
        let worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

        let pointerTileX = map1.worldToTileX(worldPoint.x);
        let pointerTileY = map1.worldToTileY(worldPoint.y);

        tileMarker.x = map1.tileToWorldX(pointerTileX);
        tileMarker.y = map1.tileToWorldY(pointerTileY);
    }
}

/* graveyard

let  controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            speed: 0.5,
        };

        controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig); 

/*if (angleInDegrees > -67.5 && angleInDegrees < -22.5) {
                this.player.play("Walk-Right-Up", true);
            } else if (angleInDegrees >= -112.5 && angleInDegrees <= -67.5) {
                this.player.play("Walk-Up", true);
            } else if (angleInDegrees > -157.5 && angleInDegrees < -112.5) {
                this.player.play("Walk-Left-Up", true);
            } else if (angleInDegrees > 112.5 && angleInDegrees < 157.5) {
                this.player.play("Walk-Left-Down", true);
            } else if (angleInDegrees >= 67.5 && angleInDegrees <= 112.5) {
                this.player.play("Walk-Down", true);
            } else if (angleInDegrees > 22.5 && angleInDegrees < 67.5) {
                this.player.play("Walk-Right-Down", true);
            } else if (angleInDegrees >= -22.5 && angleInDegrees <= 22.5) {
                this.player.play("Walk-Right", true);
            } else {
                this.player.play("Walk-Left", true);


                
    setUpInfernoAnimations() {
        let sprites = ["inferno"];
        let directions = ["Left", "Right", "Up", "Down", "Left-Up", "Right-Up", "Left-Down", "Right-Down"];

        //set up animations for each sprite type and each direction
        for (let sprite of sprites) {
            for (let direction of directions) {
                this.anims.create({
                    key: `Walk-${direction}`,
                    frames: this.anims.generateFrameNames(`${sprite}_male`, {
                        prefix: `${sprite.charAt(0).toUpperCase()}${sprite.slice(1)}SpriteMale-${direction}_`, //e.g. InfernoSpriteMale-Left_
                        suffix: ".png",
                        start: 0,
                        end: 3,
                    }),
                    frameRate: 6,
                    repeat: -1,
                });
            }
        }
    }
            // this.load.image("tiles", "../assets/world/base_tiles.png");
        // this.load.tilemapTiledJSON("tilemap", "../assets/world/map1.json");
            } */

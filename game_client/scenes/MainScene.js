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
            playerSocketID: socket.id,
            playerName: characterName,
            key: "druidFemale",
            x: 100,
            y: 200,
            class: "druid",
            gender: "female",
            iconPath: "assets/sprites/icons/druidFemaleIcon.png",
        });

        //add collision detection for player and tile layers
        this.physics.add.collider(this.player, terrainLayer, () => this.player.body.setVelocity(0));

        //client side socket set up
        console.log(`my id is ${socket.id}`);

        //tell other players that I just joined (but I won't see a message)
        socket.on("newPlayerHasJoinedMessage", (name) => {
            console.log(`Another player has joined: ${name}`);
        });

        //add me to the list of players on the server
        socket.emit("addPlayerToServer", {player: this.player, name: characterName});

        //Print a list of all the players currently on the server
        //add their positions in this scene
        socket.on("getPlayersFromServer", (otherPlayers) => {
            console.log(`The players already on the server are: ${JSON.stringify(Object.keys(otherPlayers))}`);
        });

        //add other players to this game world
        socket.on("addPlayersToGameWorld", (players) => {
            Object.keys(players).forEach((name) => {
                //if another player found
                if (!(name in playerList) && name != characterName) {
                    
                    let otherPlayer = new Player({
                        scene: this,
                        name: Math.random(),
                        playerName: name,
                        key: "druidFemale",
                        x: 100,
                        y: 200,
                        class: "druid",
                        gender: "female",
                        iconPath: "assets/sprites/icons/druidFemaleIcon.png",
                    });

                    playerList[name] = {
                        playerSocketID: name.playerSocketID,
                        character: otherPlayer,
                    };
                }
            });

            //update existing player position in game world so that new player has up to date view
            Object.keys(players).forEach((name) => {
                Object.keys(playerList).forEach((p) => {
                    if (p !== characterName) {
                        playerList[p].character.x = players[p].character.x;
                        playerList[p].character.y = players[p].character.y;
                    }
                });
            });
        });

        socket.on("playerHasMoved", (moved) => {
            console.log('moved test');
            Object.keys(playerList).forEach((player) => {
                if (player === moved.name) {
                    playerList[moved.name].character.x = moved.x;
                    playerList[moved.name].character.y = moved.y;
                }
                console.log(`playerList length: ${Object.keys(playerList).length}`);
            });
        });

        //remove player from playerList and destroy their associated sprite from the game
        socket.on("aPlayerDisconnected", (player) => {
            console.log(`${player} has gone offline.`);
            playerList[player].character.destroy();
            delete playerList[player];
        });

        socket.on("removeOldPlayers", (players) => {
            Object.keys(playerList).forEach((p) => {
                if (!p in players) {
                    playerList[p].character.destroy();
                    delete playerList[p];
                }
            });
        });

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

        socket.emit("checkForNewPlayers");

        // if (typeof socket.id === undefined) {
        //     socket.emit("addPlayerToServer", this.player);
        // }

        if (this.player !== undefined && socket.id !== undefined) {
            socket.emit("playerMoving", {
                id: socket.id,
                x: this.player.x,
                y: this.player.y,
                character: this.player,
                name: characterName,
            });
        } else {
            console.log(`something went wrong with a disconnecting player or the server disconnected.`);
        }
    }

    setUpControlsAndCamera(layer) {
        cursors = this.input.keyboard.createCursorKeys();
        this.cameras.main.setBounds(0, 0, 800, 0);

        this.input.on(
            "pointerdown",
            function (pointer) {
                let tile = layer.getTileAtWorldXY(pointer.x, pointer.y);

                target.x = tile.getCenterX();
                target.y = tile.getCenterY();

                //player moves to center of tile where player clicked
                this.physics.moveToObject(this.player, target, this.player.attributes.moveSpeed);
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
                frameRate: 2,
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

        Object.keys(playerList).forEach((player) => {
            playerList[player].character.play("idle", true);
        });
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
    
        // socket.on("updateSpriteLocation", (player) => {
        //     let playerToMove = playerList[player.id].character;
        //     let tempTarget = new Phaser.Math.Vector2();
        //     tempTarget.x = player.x;
        //     tempTarget.y = player.y;
        //     this.physics.moveToObject(playerToMove, tempTarget, 50);
        // });

                //update position for all players other than self
        /*Object.keys(playerList).forEach((player) => {
            if (player !== this.player.socketID) {
                socket.emit("checkForSpriteLocationChange", {
                    id: player,
                    location: playerList[player].character.targetLocation,
                });
            }
        });*/

// this.load.image("tiles", "../assets/world/base_tiles.png");
// this.load.tilemapTiledJSON("tilemap", "../assets/world/map1.json");

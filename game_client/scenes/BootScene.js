class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        this.load.image("tiles", "../assets/world/base_tiles.png");
        this.load.tilemapTiledJSON("tilemap", "../assets/world/map1.json");
        this.setUpSpriteAtlases();
    }

    create() {
        socket.on("connect", () => {
            socket.send("hello!!!");
        });

        socket.on("message", (message) => {
            console.log(message);
        });

        socket.on("currentPlayers", function (players) {
            console.log("hello, you are: ", players);
        });

        socket.on("newPlayer", function (playerInfo) {
            console.log("Another player has joined.");
        });

        this.scene.launch("MainScene");
        this.scene.stop();
        /*setTimeout(() => {
            this.scene.launch("MainScene");
            this.scene.stop();
        }, 1000); */
    }

    setUpSpriteAtlases() {
        this.load.atlas(
            "druidFemale",
            `../assets/sprites/druid/druidFemaleSpriteSheet.png`,
            `../assets/sprites/druid/druidFemaleSpriteSheet.json`
        );

        const sprites = ["druidFemale", "druidMale"];
        for (let sprite of sprites) {
            this.load.atlas(
                `${sprite}`, //e.g. class: druid_druid
                `../assets/sprites/druid/${sprite}SpriteSheet.png`,
                `../assets/sprites/druid/${sprite}SpriteSheet.json`
            );
        }

        this.load.atlas(
            "inferno_male",
            `../assets/sprites/Inferno/InfernoSpriteSheetMale.png`,
            `../assets/sprites/Inferno/InfernoSpriteSheetMale.json`
        );
    }
}

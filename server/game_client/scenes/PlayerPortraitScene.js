class PlayerPortraitScene extends Phaser.Scene {
    constructor() {
        super();
    }

    init(data) {
        console.log("Init: " + data.path);
        this.path = `../${data.path}`;
    }

    preload() {
        //this.load.image("portrait", `../assets/sprites/Inferno/InfernoIconMale.png`);
        this.load.image("portrait", this.path);
        this.load.image("portrait_bar", "../assets/interface/portrait_bar.png");
    }

    create(data) {
        this.portrait_bar = this.add.image(data.x + 97, data.y + 1, "portrait_bar");
        this.face = this.add.image(data.x, data.y, "portrait");
        this.portrait_bar.setScale(4.1);
        this.face.setScale(4);
    }
}

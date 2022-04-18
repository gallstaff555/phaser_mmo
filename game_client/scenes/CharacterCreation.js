class CharacterCreation extends Phaser.Scene {
    constructor() {
        super("CharacterCreation");
    }

    preload() {}

    create() {
        this.add.text(10, 10, "Enter your name:", { font: "32px Courier", fill: "#ffffff" });

        var textEntry = this.add.text(10, 50, "", { font: "32px Courier", fill: "#ffff00" });

        this.input.keyboard.on(
            "keydown",
            function (event) {
                //handles backspace
                if (event.keyCode === 8 && textEntry.text.length > 0) {
                    textEntry.text = textEntry.text.substr(0, textEntry.text.length - 1);
                    //if valid name is entered and user hits 'Enter', keep this name and start next scene
                } else if (event.keyCode === 13 && textEntry.text.length > 0) {
                    //auto capitalize first letter only
                    characterName = textEntry.text
                        .substr(0, 1)
                        .toUpperCase()
                        .concat(textEntry.text.substr(1, textEntry.length).toLowerCase());
                    this.scene.launch("BootScene");
                    this.scene.stop();
                } else if (event.keyCode === 32 || (event.keyCode >= 65 && event.keyCode <= 90)) {
                    textEntry.text += event.key;
                } else {
                    console.log("Please enter valid character");
                }
            },
            this
        );
    }
}

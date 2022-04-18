const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: [BootScene, MainScene],
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
            fps: 60,
            gravity: { y: 0 },
        },
    },
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    dom: {
        createContainer: true,
    },
};

var controls;
var cursors;
var map1;
var tileMarker;
var terrainLayer;
var socket = io();
var playerList = {};
var target = new Phaser.Math.Vector2();
var distanceText;
var characterName = "";
var game = new Phaser.Game(config);

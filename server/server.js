const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const PORT = 8080;

app.use(express.static(__dirname + "/../game_client"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/../game_client/index.html");
});

var players = {};

//socket.io connection:
io.on("connection", (socket) => {
    console.log(`a player connected.`);

    socket.emit("getPlayersFromServer", players);

    socket.on("addPlayerToServer", (character) => {
        players[socket.id] = {
            playerID: socket.id,
            character: character,
            //location should be character.location.x
        };
        socket.broadcast.emit("newPlayerHasJoinedMessage", socket.id);
        socket.emit("getPlayersFromServer", players);
        socket.emit("addPlayersToGameWorld", players);
    });

    //print a message to server console
    socket.on("logMessageOnServer", (message) => {
        console.log(message);
    });

    //add new player to list of players
    socket.on("checkForNewPlayers", () => {
        socket.emit("addPlayersToGameWorld", players);
    });

    //
    socket.on("playerMoving", (player) => {
        //assign new location for character with this socket.id
        // Object.keys(players).forEach((player) => {
        //     if (socket.id === player) {
        //         console.log(`${player} new location: ${JSON.stringify(newLocation)}`);
        //         players[socket.id].character.x = newLocation.x;
        //         players[socket.id].character.y = newLocation.y;
        //         //console.log(`${JSON.stringify(players[socket.id].character)}`);
        //     }
        // });
        if (
            players[player.id].character.x !== player.character.x ||
            players[player.id].character.y !== player.character.y
        ) {
            //console.log("code reached");
            players[player.id].character.x = player.character.x;
            players[player.id].character.y = player.character.y;
            socket.broadcast.emit("playerHasMoved", {
                id: player.id,
                x: player.character.x,
                y: player.character.y,
            });
        }
    });

    //might need to do player.targetLocation.x instead of player.x
    /*socket.on("checkForSpriteLocationChange", (player) => {
        if (
            players[player.id].character.x !== player.location.x ||
            players[player.id].character.y !== player.location.y
        ) {
            //need to update the client that player location has changed
            socket.emit("updateSpriteLocation", {
                id: player.id,
                x: players[player.id].character.x,
                y: players[player.id].character.y,
            });
        }
    }); */

    //remove player from player list after their socket disconnects
    socket.on("disconnect", () => {
        console.log("a player disconnected.");
        delete players[socket.id];
        //io.emit("disconnect", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port: http://localhost:${PORT}`);
});

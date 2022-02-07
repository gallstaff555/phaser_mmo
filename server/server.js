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

    //remove player from player list after their socket disconnects
    socket.on("disconnect", () => {
        console.log("a player disconnected.");
        io.emit("aPlayerDisconnected", socket.id);
        delete players[socket.id];
        //io.emit("disconnect", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port: http://localhost:${PORT}`);
});

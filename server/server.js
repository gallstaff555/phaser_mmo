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
    console.log(`${socket.id} has connected`);

    socket.emit("getPlayersFromServer", players);

    socket.on("addPlayerToServer", (character) => {
        players[socket.id] = {
            playerID: socket.id, //this might be useful as alternative ID should socket ID change
            character: character,
            // playerID: character.id, //this might be useful as alternative ID should socket ID change
            // character: character.player,
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

    socket.on("playerMoving", (player) => {
        if (!players.hasOwnProperty(player.id)) {
            //console.log(`${player.id} not found on server yet`);
            socket.emit("addPlayersToGameWorld", players);
            socket.emit("removeOldPlayers", players);

            players[player.id] = {
                playerID: player.id,
                character: player.character,
            };
            console.log(`${JSON.stringify(Object.keys(players))}`);
            //socket.emit("getPlayersFromServer", players);
        }

        if (
            players[player.id].character.x !== player.character.x ||
            players[player.id].character.y !== player.character.y
        ) {
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
        console.log(`${socket.id} has disconnected.`);
        io.emit("aPlayerDisconnected", socket.id);
        delete players[socket.id];
        //io.emit("disconnect", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port: http://localhost:${PORT}`);
});

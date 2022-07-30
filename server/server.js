const express = require("express");
const { Socket } = require("socket.io");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const PORT = 8080;

app.use(express.static(__dirname + "/game_client"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/game_client/index.html");
});

var players = {};

/*
players is a list of players with their name and socketID 
0. When a player initially joins, we only know their socket ID; not their name
1. when player joins server, add their name and ID to list of players
>>>also need to update client with full list of players
2. when player disconnects, remove their entry from list of players 
>>>>also need to update client with removed player
*/

io.on("connection", (socket) => {
    //device way to seemlessly add players whose clients were connected before server was online
    //socket.emit("checkForClientsOnlineBeforeServer", ())

    console.log(`${socket.id} has connected`);

    socket.on("addPlayerToServer", (player) => {
        players[player.name] = {
            playerSocketID: socket.id,
            character: player.player,
        };
        socket.broadcast.emit("newPlayerHasJoinedMessage", player.name);
        socket.emit("getPlayersFromServer", players);
        socket.emit("addPlayersToGameWorld", players);
    });

    socket.on("checkForNewPlayers", () => {
        socket.emit("addPlayersToGameWorld", players);
    });

    socket.on("playerMoving", (player) => {
        if (!players.hasOwnProperty(player.id)) {
            socket.emit("addPlayersToGameWorld", players);
            socket.emit("removeOldPlayers", players);

            players[player.name] = {
                playerSocketID: player.id,
                character: player.character,
            };
        }

        if (
            players[player.name].character.x !== player.character.x ||
            players[player.name].character.y !== player.character.y
        ) {
            players[player.name].character.x = player.character.x;
            players[player.name].character.y = player.character.y;
            socket.broadcast.emit("playerHasMoved", {
                name: player.name,
                id: player.id,
                x: player.character.x,
                y: player.character.y,
            });
        }
    });

    socket.on("disconnect", () => {
        //delete the player from players list corresponding to the socket.id that just disconnected
        Object.keys(players).forEach((name) => {
            if (players[name].playerSocketID == socket.id) {
                io.emit("aPlayerDisconnected", name);
                delete players[name];
                console.log(`${name} with id ${socket.id} has left the server.`);
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port: http://localhost:${PORT}`);
});

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
        };
        //console.log(`Added ${JSON.stringify(character)} to the server.`);
        socket.broadcast.emit("newPlayerHasJoinedMessage", socket.id);
        socket.emit("getPlayersFromServer", players);
        socket.emit("addPlayersToGameWorld", players);
    });

    socket.on("message", (message) => {
        console.log(message + "!");
    });

    //need to add receiver for this in MainScene on "update"
    socket.on("checkForNewPlayers", () => {
        socket.emit("addPlayersToGameWorld", players);
    });

    socket.on("disconnect", () => {
        console.log("a player disconnected.");
        delete players[socket.id];
        //io.emit("disconnect", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port: http://localhost:${PORT}`);
});

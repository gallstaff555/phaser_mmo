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

    players[socket.id] = {
        playerID: socket.id,
    };

    socket.emit("currentPlayers", players);
    socket.broadcast.emit("newPlayer", players[socket.id]);

    socket.on("message", (message) => {
        //io.emit("message", message);
        socket.broadcast.emit("i am broadcasting to everyone but sender");
        console.log(message);
    });

    socket.on("disconnect", () => {
        console.log("a player disconnected.");
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port: http://localhost:${PORT}`);
});

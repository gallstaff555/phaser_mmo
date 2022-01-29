const express = require("express");
const app = express();

const PORT = 8080;

app.use(express.static(__dirname + "/../game_client"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/../game_client/index.html");
});

app.listen(PORT, () => {
    console.log(`Server listening on port: http://localhost:${PORT}`);
});

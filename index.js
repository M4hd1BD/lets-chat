const express = require("express");
const socket = require("socket.io");

// App setup
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8080;
}
const app = express();
const server = app.listen(port, function () {
  console.log(`Listening on port ${port}`);
  console.log(`http://localhost:${port}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);

const activeUsers = new Set();
let alreadyHas = false;

io.on("connection", function (socket) {
  console.log("Made socket connection");

  socket.on("new user", function (data) {
    if (!activeUsers.has(data)) {
      socket.userId = data;
      activeUsers.add(data);
      io.emit("new user", [...activeUsers]);
    }
    else {
      alreadyHas = true;
      io.emit("new user", alreadyHas);
      console.log("emitted");
    }
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
  });

  socket.on("chat message", function (data) {
    io.emit("chat message", data);
  });

});

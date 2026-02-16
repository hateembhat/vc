const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const MAX_USERS = 8;

app.use(express.static("public"));

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {

    const room = io.sockets.adapter.rooms.get(roomId);
    const userCount = room ? room.size : 0;

    if (userCount >= MAX_USERS) {
      socket.emit("room-full");
      return;
    }

    socket.join(roomId);

    socket.emit("joined-success", socket.id);
    socket.to(roomId).emit("user-connected", socket.id);

    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("disconnecting", () => {

    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("user-disconnected", socket.id);
      }
    });

    console.log("User disconnected:", socket.id);
  });

});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

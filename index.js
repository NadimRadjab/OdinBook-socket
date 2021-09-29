if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const port = process.env.PORT || 8900;
const clientPort = process.env.CLIENT_PORT;
const io = require("socket.io")(port, {
  cors: {
    origin: clientPort,
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};
const getUser = (senderId) => {
  return users.find((user) => user.userId === senderId);
};

io.on("connection", (socket) => {
  console.log("connected");
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });
  socket.on("sendMessage", ({ senderId, reciverId, message }) => {
    const user = getUser(reciverId);

    if (!user) return;
    io.to(user.socketId).emit("getMessage", {
      senderId,
      message,
    });
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

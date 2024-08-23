"use strict";
/* --------------------------------------
          | Modern Chat API |
----------------------------------------- */
const app = require("./app");
/* ------------------------------------------------------- */
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
/* ------------------------------------------------------- */

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("UNCAUGHT Exception! Shutting down ...");
  process.exit(1);
});

const http = require("http");

const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methots: ["GET", "POST"],
  },
});

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("DB connection is successful");
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 8000;

// RUN SERVER:

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// socket io:
io.on("connection", async (socket) => {
  console.log(socket);
  const user_id = socket.handshake.query["user_id"];

  const socket_id = socket.id;

  console.log(`User connected${socket_id}`);

  if (user_id) {
    await User.findByIdAndUpdate(user_id, { socket_id });
  }

  // We can write our socket event listeners here...
  socket.on("friend_request", async (data) => {
    console.log(data.to);
    const to = await User.findById(data.to);

    // TODO => create a friend request
    io.to(to?.socket_id).emit("new_friend_request");
  });
});
process.on("unhandledRejection", (err) => {
  console.log(err),
    server.close(() => {
      process.exit(1);
    });
});

/* ------------------------------------------------------- */

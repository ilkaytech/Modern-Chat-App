"use strict";
/* --------------------------------------
          | Modern Chat API |
----------------------------------------- */
const app = require("./app");
/* ------------------------------------------------------- */
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const FriendRequest = require("./models/friendRequest");

/* ------------------------------------------------------- */
dotenv.config();

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("UNCAUGHT Exception! Shutting down ...");
  process.exit(1);
});

const server = http.createServer(app);

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
    console.log("DB connection error:", err);
  });

const port = process.env.PORT || 8000;

// RUN SERVER:

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// socket io:
io.on("connection", async (socket) => {
  // console.log(JSON.stringify(socket.handshake.query));
  // console.log(socket);
  const user_id = socket.handshake.query["user_id"];

  const socket_id = socket.id;

  console.log(`User connected${socket_id}`);

  if (Boolean(user_id)) {
    await User.findByIdAndUpdate(user_id, { socket_id, status: "Online" });
  }

  // We can write our socket event listeners here...
  socket.on("friend_request", async (data) => {
    console.log(data.to);

    // data => {to, from}

    const to_user = await User.findById(data.to).select("socket_id");
    const from_user = await User.findById(data.from).select("socket_id");

    // create a friend request

    await FriendRequest.create({
      sender: data.from,
      recipient: data.to,
    });

    // TODO => create a friend request
    // emit event => "new_friend_request"
    io.to(to_user.socket_id).emit("new_friend_request", {
      //
      message: "New Friend Request Received",
    });
    // emit event => "request_sent"
    io.to(from_user.socket_id).emit("request_sent", {
      //
      message: "Request send successfully!",
    });
  });

  socket.on("accept_request", async (data) => {
    console.log(data);

    const request_doc = await FriendRequest.findById(data.request_id);

    console.log(request_doc);

    // request_id
    const sender = await User.findById(request_doc.sender);
    const receiver = await User.findById(request_doc.recipient);

    sender.friends.push(request_doc.recipient);
    receiver.friends.push(request_doc.sender);

    await receiver.save({ new: true, validateModifiedOnly: true });
    await sender.save({ new: true, validateModifiedOnly: true });

    await FriendRequest.findByIdAndDelete(data.request_id);

    io.to(sender.socket_id).emit("request_accepted", {
      message: "Friend Request Accepted",
    });
    io.to(receiver.socket_id).emit("request_accepted", {
      message: "Friend Request Accepted",
    });
  });

  socket.on("get_direct_conversations", async ({ user_id }, callback) => {
    const existing_conversations = await OneToOneMessage.find({
      participants: { $all: [user_id] },
    }).populate("participants", "firstName lastName _id email status");
    console.log(existing_conversations);
    callback(existing_conversations);
  });

  socket.on("start_conversation", async (data) => {
    //data: {to,from}
    const { to, from } = data;
    // check if there is any existing conversation between these users
    const existing_conversations = await OneToOneMessage.find({
      participants: { $size: 2, $all: [to, from] },
    }).populate("participants", "firstName lastName _id email status");
    console.log(existing_conversations[0], "Existing Conversation");
    // if no existing_conversation
    if (existing_conversations.lenght === 0) {
      let new_chat = await OneToOneMessage.create({
        participants: [to, from],
      });
      new_chat = await OneToOneMessage.findById(new_chat._id).populate(
        "participants",
        "firstName lastName _id email status"
      );

      console.log(new_chat);
      socket.emit("start_chat", new_chat);
    }
    //if there is existing_conversation
    else {
      socket.emit("open_chat", existing_conversations[0]);
    }
  });

  // Handle text/link messages
  socket.on("text_message", (data) => {
    console.log("Received Message", data);

    // data: {to,from,text}

    // create a new conversation if it doesn't exist yet or add new message to the message list

    // save to db

    // emit incoming_message -> to user

    // emit outgoing_message -> from user
  });
  socket.on("file_message", (data) => {
    console.log("Received Message", data);

    // data: {to,from,text,file}

    // get the file extension
    const fileExtension = path.extname(data.file.name);
    // generate a unique filename
    const fileName = `${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}${fileExtension}`;

    // upload file AWS s3

    // create a new conversation if it dosen't exist yet or add new message to the message list

    // save to db

    // emit incoming_message -> to user

    // emit outgoing_message -> from user
  });

  socket.on("end", async (data) => {
    // Find user by _id and set the status to Offline
    if (data.user_id) {
      await User.findByIdAndUpdate(data.user_id, { status: "Offline" });
    }
    // TODO => broadcast user_disconnected
    console.log("Closing connection");
    socket.disconnect(0);
  });
});
process.on("unhandledRejection", (err) => {
  console.log(err), console.log("UNHANDLED REJECTION! Shutting down");
  server.close(() => {
    process.exit(1);
  });
});

/* ------------------------------------------------------- */

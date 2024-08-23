"use strict";
/* --------------------------------------
          | Modern Chat API |
----------------------------------------- */
const mongoose = require("mongoose");
/* ------------------------------------------------------- */
// friend Model:
const requestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

/* ------------------------------------------------------- */
module.exports = mongoose.model("FriendRequest", requestSchema);

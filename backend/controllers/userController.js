"use strict";
/* --------------------------------------
          | Modern Chat API |
----------------------------------------- */
// User Controller:
const User = require("../models/user");
const filterObj = require("../utils/filterObj");
const FriendRequest = require("../models/friendRequest");
/* ------------------------------------------------------- */

exports.updateMe = async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "about",
    "avatar"
  );

  const userDoc = await User.findByIdAndUpdate(req.user._id, filteredBody);
  res.status(200).json({
    status: "success",
    data: update_user,
    message: "Profile Updated successfully!",
  });
};

exports.getUsers = async (req, res, next) => {
  const all_users = await User.find({
    verified: true,
  }).select("firstName lastName _id");

  const this_user = req.user;

  const remaining_users = all_users.filter(
    (user) =>
      !this_user.friends.includes(user._id) &&
      user._id.toString() !== req.user._id.toString()
  );
  res.status(200).json({
    status: "success",
    data: remaining_users,
    message: "Users found successfully!",
  });
};

exports.getRequests = async (req, res, next) => {
  const requests = await FriendRequest.find({
    recipient: req.user._id,
  }).populate("sender", "_id firstName lastName");
  res.status(200).json({
    status: "success",
    data: requests,
    message: "Friends requests Found successfully!",
  });
};

exports.getFriends = async (req, res, next) => {
  const friends = await User.findById(req.user._id).populate(
    "friends",
    "_id firstName lastName"
  );
  res.status(200).json({
    status: "success",
    data: friends,
    message: "Friends Found successfully!",
  });
};

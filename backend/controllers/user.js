"use strict";
/* --------------------------------------
          | Modern Chat API |
----------------------------------------- */
// User Controller:
const User = require("../models/user");
/* ------------------------------------------------------- */

exports.updateMe = async (req, res, next) => {
  const { user } = req;

  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "about",
    "avatar"
  );

  const update_user = await User.findByIdAndUpdate(user._id, filteredBody, {
    new: true,
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: "error",
    data: update_user,
    message: "Profile Updated successfully!",
  });
};

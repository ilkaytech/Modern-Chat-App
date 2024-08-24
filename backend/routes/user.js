"use strict";
/* --------------------------------------
          | Modern Chat API |
----------------------------------------- */
const router = require("express").Router();
/* ------------------------------------------------------- */
// routes:

const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

// URL: /

router.patch("/update-me", authController.protect, userController.updateMe);

router.get("get-users", authController.protect, userController.getUsers);
router.get("get-friends", authController.protect, userController.getFriends);
router.get(
  "get-friend-requests",
  authController.protect,
  userController.getRequests
);

/* ------------------------------------------------------- */
module.exports = router;

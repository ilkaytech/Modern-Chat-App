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

router.post("get-users", authController.protect, userController.getUsers);

/* ------------------------------------------------------- */
module.exports = router;

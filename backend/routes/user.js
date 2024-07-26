"use strict";
/* --------------------------------------
          | Modern Chat API |
----------------------------------------- */
const router = require("express").Router();
/* ------------------------------------------------------- */
// routes:

const authController = require("../controllers/auth");
const userController = require("../controllers/user");

// URL: /

router.patch("/update-me", authController.protect, userController.updateMe);

/* ------------------------------------------------------- */
module.exports = router;

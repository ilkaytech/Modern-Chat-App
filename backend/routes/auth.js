"use strict";
/* --------------------------------------
          | Modern Chat API |
----------------------------------------- */
const router = require("express").Router();
/* ------------------------------------------------------- */
// routes/:

const auth = require("../controllers/auth");

// URL: /

router.post("/login", auth.login);
router.post("/register", auth.register, auth.sendOTP);
router.post("/send-otp", auth.sendOTP);
router.post("/verify", auth.verifyOTP);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);

/* ------------------------------------------------------- */
module.exports = router;

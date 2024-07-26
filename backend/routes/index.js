"use strict";
/* --------------------------------------
          | Modern Chat API |
----------------------------------------- */
const router = require("express").Router();
/* ------------------------------------------------------- */
// routes/

const authRoute = require("./auth");
const userRoute = require("./user");

router.use("/auth", authRoute);
router.use("/user", userRoute);

/* ------------------------------------------------------- */
module.exports = router;

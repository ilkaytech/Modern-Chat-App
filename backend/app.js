"use strict";
/* --------------------------------------
          | Modern Chat API |
----------------------------------------- */
const express = require("express");
const morgan = require("morgan");

/* ------------------------------------------------------- */
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");
const cors = require("cors");
const xss = require("xss-clean");

const app = express();

/* ------------------------------------------------------- */
// CORS Middleware

const corsOptions = {
  origin: "*",
  methods: ["GET", "PATCH", "POST", "DELETE", "PUT"],
  credentials: true,
};
app.use(cors(corsOptions));

//Body Parser
app.use(express.json({ limit: "10kb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Security Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

//Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Rate Limiting
const limiter = rateLimit({
  max: 3000,
  windowMs: 60 * 60 * 1000, // In one hour
  message: "Too many Requests from this IP, please try again in an hour!",
});
app.use("/tawk", limiter);

//Routes

//Error Handling

/* ------------------------------------------------------- */
module.exports = app;

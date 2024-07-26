"use strict";
/* --------------------------------------
          | Modern Chat API |
----------------------------------------- */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/* ------------------------------------------------------- */
// User Model:

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First Name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is required"],
  },
  avatar: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: {
      validator: function (email) {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      },
      message: (props) => `Email (${props.value}) is invalid!`,
    },
  },
  password: {
    type: String,
  },
  passwordConfirm: {
    type: String,
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: Number,
  },
  opt_expiry_time: {
    type: Date,
  },
});

userSchema.pre("save", async function (next) {
  // Only run this fxn if OTP is actually modified

  if (!this.isModified("otp")) return next();

  // Hash the OTP with the cost of 12
  this.otp = await bcrypt.hash(this.otp, 12);
  next();
});

userSchema.pre("save", async function (next) {
  // Only run this fxn if OTP is actually modified

  if (!this.isModified("password")) return next();

  // Hash the OTP with the cost of 12
  this.otp = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (
  canditatePassword, // 123456
  userPassword
) {
  return await bcrypt.compare(canditatePassword, userPassword);
};

userSchema.methods.correctOTP = async function (
  canditateOTP, // 123456
  userOTP
) {
  return await bcrypt.compare(canditateOTP, userOTP);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.changedPasswordAfter = function (timestamp) {
  return timestamp < this.passwordChangedAt;
};

/* ------------------------------------------------------- */
module.exports = mongoose.model("User", userSchema);

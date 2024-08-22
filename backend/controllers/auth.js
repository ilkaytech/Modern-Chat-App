"use strict";
/* --------------------------------------
          | Modern Chat API |
----------------------------------------- */
// Auth Controller:

const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);
const crypto = require("crypto");

const User = require("../models/user");
const filterObj = require("../utils/filterObj");
const { promisify } = require("util");
const mailService = require("../services/mailler");
const otp = require("../Templates/Mail/otp");
const resetPassword = require("../Templates/Mail/resetPassword");

/* ------------------------------------------------------- */

// Signup => register - sendOTP - verifyOTP

// https://chatbop.com.tr/auth/register

// Register New User:

exports.register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "password",
    "email"
  );

  // check if a verified user with given email exists
  const existing_user = await User.findOne({ email: email });

  if (existing_user && existing_user.verified) {
    res.status(400).json({
      status: "error",
      message: "Email is already in use, Please login",
    });
  } else if (existing_user) {
    await User.findOneAndUpdate({ email: email }, filteredBody, {
      new: true,
      validateModifiedOnly: true,
    });

    // Generate OTP and send email to user
    req.userId = existing_user._id;
    next();
  } else {
    // if user record is not available in DB
    const new_user = await User.create(filteredBody);
    // Generate OTP and send email to user
    req.userId = new_user._id;
    next();
  }
};

// sendOTP

exports.sendOTP = async (req, res, next) => {
  const { userId } = req;

  const new_otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const otp_expiry_time = Date.now() + 10 * 60 * 1000; // 10 mins after otp is sent

  const user = await User.findByIdAndUpdate(userId, {
    otp_expiry_time: otp_expiry_time,
  });
  user.otp = new_otp.toString();

  await user.save({ new: true, validateModifiedOnly: true });
  console.log(new_otp);

  // Send Mail
  mailService.sendEmail({
    from: "info@chatbop.com.tr",
    to: user.email,
    subject: "OTP for Chatbop",
    html: otp(user.firstName, new_otp),
    text: `Your OTP is ${new_otp}. This is valid for 10 Mins.`,
    attachments: [],
  });
  res.status(200).json({
    status: "success",
    message: "OTP Sent Successfully!",
  });
};

// verifyOTP

exports.verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    otp_expiry_time: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Email is Invalid or OTP expired",
    });
  }
  if (user.verified) {
    return res.status(400).json({
      status: "error",
      message: "Email is already verified",
    });
  }
  if (!(await user.correctOTP(otp, user.otp))) {
    res.status(400).json({
      status: "error",
      message: "OTP is incorrect",
    });

    return;
  }

  // OTP is correct
  user.verified = true;
  user.otp = undefined;

  await user.save({ new: true, validateModifiedOnly: true });

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    message: "OTP verified Successfully!",
    token,
    user_id: user._id,
  });
};

// Login:

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      status: "error",
      message: "Both email and password are required",
    });
    return;
  }

  const userDoc = await User.findOne({ email: email }).select("+password");

  if (
    !userDoc ||
    !(await userDoc.correctPassword(password, userDoc.password))
  ) {
    res.status(400).json({
      status: "error",
      message: "Email or password is incorrect",
    });
    return;
  }

  const token = signToken(userDoc._id);

  res.status(200).json({
    status: "success",
    message: "Logged in successfully",
    token,
  });
};

exports.protect = async (req, res, next) => {
  // 1) Getting token (JWT) and check if it's there

  let token;

  // Bearer:
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    res.status(400).json({
      status: "error",
      message: "You are not logged In! Please log in to get access",
    });
    return;
  }

  // 2) Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exist
  const this_user = await User.findById(decoded.userId);

  if (!this_user) {
    res.status(400).json({
      status: "error",
      message: "The user doesn't exist",
    });
    return;
  }
  // 4) Check if user changed their password after token was issued

  if (this_user.changedPasswordAfter(decoded.iat)) {
    res.status(400).json({
      status: "error",
      message: "User recently updated password! Please log in again",
    });
    return;
  }

  req.user = this_user;
  next();
};

// Types of routes => Protected (Only logged in users can access these) & UnProducted

exports.forgotPassword = async (req, res, next) => {
  // 1) Get users email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).json({
      status: "error",
      message: "There is no user with given email address",
    });
    return;
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `http://localhost:3001/auth/new-password?token=${resetToken}`;
    // TODO => Send Email with this Reset URL to user's email address

    console.log(resetURL);

    // Send Email with this Reset URL
    await mailService.sendEmail({
      from: "info@chatbop.com.tr",
      to: req.body.email,
      subject: "Password Reset",
      html: resetPassword(user.firstName, resetURL),

      text: `Reset your password using the following link: ${resetURL}. This link is valid for 10 minutes.`,
    });

    res.status(200).json({
      status: "success",
      message: "Reset Password link sent to Email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      status: "error",
      message: "There was an error sending the email, Please try again later!",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has expired or submission is out of time window
  if (!user) {
    res.status(400).json({
      status: "error",
      message: "Token is Invalid or Expired",
    });
    return;
  }

  // 3) Update users password and set resetToken & expiry to undefined
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 4) Log in the user and Send new JWT
  const token = signToken(user._id);

  try {
    await mailService.sendEmail({
      from: "info@chatbop.com.tr",
      to: user.email,
      subject: "Password Reset Successfully",
      text: `Password has been successfully updated!`,
    });
    res.status(200).json({
      status: "success",
      message: "Password updated successfully!",
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error sending email notification. Please try again later.",
    });
  }
};

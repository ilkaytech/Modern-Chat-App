"use strict";
/* --------------------------------------
          | Modern Chat API |
----------------------------------------- */
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
/* ------------------------------------------------------- */
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "atalante.alastyr.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, sender, subject, html, text, attachments }) => {
  try {
    const from = sender || "info@chatbop.com.tr";
    const msg = {
      from: from,
      to: to,
      subject: subject,
      text: text,
      html: html,
      attachments,
    };
    return await transporter.sendMail(msg);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

exports.sendEmail = async (args) => {
  if (process.env.NODE_ENV === "development") {
    return Promise.resolve();
  } else {
    return sendEmail(args);
  }
};

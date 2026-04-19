const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

router.post("/partnership", async (req, res) => {
  const { name, organization, email, partnership_type, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and message are required.",
    });
  }

  const transporter = createTransporter();

  if (!transporter) {
    return res.status(500).json({
      success: false,
      message: "Email is not configured yet. Add GMAIL_USER and GMAIL_APP_PASSWORD in the server environment.",
    });
  }

  const inbox = process.env.PARTNERSHIP_TO_EMAIL || process.env.GMAIL_USER;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    replyTo: email,
    to: inbox,
    subject: `New Partnership Inquiry: ${organization || name}`,
    text:
      `Name: ${name}\n` +
      `Organization: ${organization || "Not provided"}\n` +
      `Email: ${email}\n` +
      `Type: ${partnership_type || "Not provided"}\n\n` +
      `Message:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Inquiry sent successfully!" });
  } catch (error) {
    console.error("Email error:", error);

    if (error && error.code === "EAUTH") {
      return res.status(500).json({
        success: false,
        message: "Gmail rejected the login. Use the Gmail address plus a valid App Password or switch this integration to OAuth.",
      });
    }

    res.status(500).json({ success: false, message: "Failed to send inquiry." });
  }
});

module.exports = router;

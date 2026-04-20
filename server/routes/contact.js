const express = require("express");
const fs = require("fs");
const path = require("path");
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

router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newContact = {
    id: Date.now(),
    name,
    email,
    phone,
    message,
    date: new Date().toISOString()
  };

  const filePath = path.join(__dirname, "..", "data", "contacts.json");
  const existing = JSON.parse(fs.readFileSync(filePath, "utf8"));
  existing.push(newContact);

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

  const transporter = createTransporter();

  if (!transporter) {
    return res.status(500).json({
      error: "Email is not configured yet. Add GMAIL_USER and GMAIL_APP_PASSWORD in the server environment.",
    });
  }

  const inbox = process.env.PARTNERSHIP_TO_EMAIL || process.env.GMAIL_USER;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      replyTo: email,
      to: inbox,
      subject: `New Contact Message: ${name}`,
      text:
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Phone: ${phone || "Not provided"}\n\n` +
        `Message:\n${message}`,
    });

    res.json({ success: true, message: "Message received" });
  } catch (error) {
    console.error("Email error:", error);

    if (error && error.code === "EAUTH") {
      return res.status(500).json({
        error: "Gmail rejected the login. Use the Gmail address plus a valid App Password or switch this integration to OAuth.",
      });
    }

    res.status(500).json({ error: "Failed to send message." });
  }
});

module.exports = router;

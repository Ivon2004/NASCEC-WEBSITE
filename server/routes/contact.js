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
    host: "smtp.gmail.com",
    //port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: true,
      //ciphers: "SSLv3",
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

    if (error.code === "ESOCKET" || error.code === "ETIMEDOUT") {
      return res.status(500).json({
        error: "Unable to reach the email server. Your message has been saved locally and will be sent when service is restored.",
      });
    }

    if (error.code === "EAUTH") {
      return res.status(500).json({
        error: "Gmail rejected the login. Verify the App Password is correct.",
      });
    }

    res.status(500).json({
      error: "Failed to send message, but your submission has been saved.",
    });
  }
});

module.exports = router;

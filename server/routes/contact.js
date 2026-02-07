const express = require("express");
const fs = require("fs");
const router = express.Router();

router.post("/", (req, res) => {
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

  const filePath = "./data/contacts.json";
  const existing = JSON.parse(fs.readFileSync(filePath));
  existing.push(newContact);

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

  res.json({ success: true, message: "Message received" });
});

module.exports = router;

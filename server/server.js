require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const contactRouter = require('./routes/contact');
const partnershipRouter = require('./routes/partnership'); 

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api', contactRouter);

/* =========================
   GET STORIES
========================= */
app.get("/api/stories", (req, res) => {
  const stories = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data", "stories.json"), "utf8")
  );
  res.json(stories);
});

/* =========================
   GET GALLERY
========================= */
app.get("/api/gallery", (req, res) => {
  const gallery = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data", "gallery.json"), "utf8")
  );
  res.json(gallery);
});


app.use('/api', partnershipRouter); 




/* =========================
   START SERVER
========================= */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`NASCEC backend running on http://localhost:${PORT}`);
});

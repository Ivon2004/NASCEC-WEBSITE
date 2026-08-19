require("dotenv").config({ path: __dirname + '/.env' });

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const { Pool } = require('pg');

const contactRouter = require('./routes/contact');
const partnershipRouter = require('./routes/partnership'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Debug raw body for auth routes
app.use((req, res, next) => {
  if (req.path === '/login' || req.path === '/admin/create-user') {
    console.log('AUTH REQUEST', req.method, req.path, 'content-type:', req.headers['content-type']);
  }
  next();
});

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: 'lax',
    secure: false
  }
}));

// ===== DATABASE CONNECTION =====
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'P0$tgre1',
  database: process.env.DB_NAME || 'Field_Data',
  port: process.env.DB_PORT || 5432
});

// Test the connection
db.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('✅ Successfully connected to PostgreSQL database!');
  release();
});

// ===== HOME ROUTES =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin_panel.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_panel.html'));
});

app.get('/field_data.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'field_data.html'));
});

// ===== EXISTING ROUTES =====
app.use('/api', contactRouter);
app.use('/api', partnershipRouter);

// Stories
app.get("/api/stories", (req, res) => {
  try {
    const stories = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data", "stories.json"), "utf8")
    );
    res.json(stories);
  } catch (err) {
    console.error('Error reading stories:', err);
    res.status(500).json({ error: 'Failed to load stories' });
  }
});

// Gallery
app.get("/api/gallery", (req, res) => {
  try {
    const gallery = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data", "gallery.json"), "utf8")
    );
    res.json(gallery);
  } catch (err) {
    console.error('Error reading gallery:', err);
    res.status(500).json({ error: 'Failed to load gallery' });
  }
});

/* =========================
   AUTHENTICATION & ADMIN
========================= */

// Middleware to check admin role
function isAdmin(req, res, next) {
  const role = String(req.session.userRole || '').toLowerCase();
  if (role === 'admin') {
    next();
  } else {
    console.log('isAdmin failed. role=', req.session.userRole);
    res.status(403).send("Access denied");
  }
}

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log('LOGIN payload username=', username);
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const normalizedRole = String(user.role || '').toLowerCase();
      req.session.userRole = normalizedRole;
      req.session.userId = user.id;
      req.session.user = { username: user.username, role: normalizedRole };
      req.session.save(err => {
        if (err) {
          console.error('Session save failed:', err);
          return res.status(500).json({ success: false, message: 'Error saving session' });
        }

        res.json({
          success: true,
          role: normalizedRole,
          redirectTo: normalizedRole === 'admin' ? '/admin_panel.html' : '/field_data.html'
        });
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Create user (admin only)
app.post('/admin/create-user', isAdmin, async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, password, role, status) VALUES ($1, $2, $3, 'active')",
      [username, hashedPassword, role]
    );
    res.send("User created successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

// Delete user (admin only)
app.post('/admin/delete-user', isAdmin, async (req, res) => {
  const { username } = req.body;
  try {
    await db.query("DELETE FROM users WHERE username = $1", [username]);
    res.send("User deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
});

// List users (admin only)
app.get('/admin/users', isAdmin, async (req, res) => {
  try {
    const result = await db.query("SELECT id, username, role, status, created_at FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  }
});


// =============================================================
// ===== FIELD DATA ENTRY - UPDATED =====
// =============================================================
app.post('/data-entry', async (req, res) => {
  try {
    const {
      // General Info
      natureOfEvent,
      location,
      latitude,
      longitude,
      durationType,
      eventDate,
      startDate,
      endDate,
      programLeader,
      partners,
      
      // Environmental Action
      species,
      tree_names,
      number_of_trees,
      seedling_source,
      followup_note,
      
      // Storytelling
      storyDescription,
      narrativeTitles,
      voiceNotes,
      
      // Files
      files
    } = req.body;

    // Validate required fields
    if (!natureOfEvent || !location || !programLeader) {
      return res.status(400).json({
        success: false,
        message: 'Nature of Event, Location, and Program Leader are required'
      });
    }

    // Validate date based on duration type
    if (durationType === 'single' && !eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Event date is required for single day event'
      });
    }

    if (durationType === 'multiple' && (!startDate || !endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required for multiple days event'
      });
    }

    // Build the query
    const query = `
      INSERT INTO data_entries (
        nature_of_event,
        location,
        latitude,
        longitude,
        duration_type,
        event_date,
        start_date,
        end_date,
        program_leader,
        partners,
        species,
        tree_names,
        number_of_trees,
        seedling_source,
        followup_note,
        story_description,
        narrative_titles,
        voice_notes,
        file_uploads,
        submitted_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING id;
    `;

    // Process file uploads (store file names/paths)
    let fileUploads = null;
    if (files && files.length > 0) {
      fileUploads = JSON.stringify(files.map(f => f.filename || f.originalname));
    }

    const values = [
      natureOfEvent,
      location,
      latitude || null,
      longitude || null,
      durationType || 'single',
      eventDate || null,
      startDate || null,
      endDate || null,
      programLeader,
      partners || null,
      species || null,
      tree_names || null,
      number_of_trees || 0,
      seedling_source || null,
      followup_note || null,
      storyDescription || null,
      narrativeTitles || null,
      voiceNotes || null,
      fileUploads,
      req.session.user?.username || 'anonymous'
    ];

    const result = await db.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Data submitted successfully!',
      id: result.rows[0].id
    });

  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit data',
      error: error.message
    });
  }
});
// Remove or disable Permissions-Policy header
app.use((req, res, next) => {
  res.removeHeader('Permissions-Policy');
  next();
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 NASCEC backend running on http://localhost:${PORT}`);
});
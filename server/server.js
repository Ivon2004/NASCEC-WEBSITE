// server.js
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

// ===== MIDDLEWARE =====
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static("public"));

// Debug raw body for auth routes
app.use((req, res, next) => {
    if (req.path === '/login' || req.path === '/admin/create-user') {
        console.log('AUTH REQUEST', req.method, req.path, 'content-type:', req.headers['content-type']);
    }
    next();
});

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        sameSite: 'lax',
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// ===== DATABASE CONNECTION =====
const db = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'P0$tgre1',
    database: process.env.DB_NAME || 'Field_Data',
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test the connection
db.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Error connecting to PostgreSQL:', err.stack);
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
        const storiesPath = path.join(__dirname, "data", "stories.json");
        if (!fs.existsSync(storiesPath)) {
            return res.json([]);
        }
        const stories = JSON.parse(fs.readFileSync(storiesPath, "utf8"));
        res.json(stories);
    } catch (err) {
        console.error('Error reading stories:', err);
        res.status(500).json({ error: 'Failed to load stories' });
    }
});

// Gallery
app.get("/api/gallery", (req, res) => {
    try {
        const galleryPath = path.join(__dirname, "data", "gallery.json");
        if (!fs.existsSync(galleryPath)) {
            return res.json([]);
        }
        const gallery = JSON.parse(fs.readFileSync(galleryPath, "utf8"));
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
        res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
}

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log('LOGIN attempt for username:', username);
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const normalizedRole = String(user.role || '').toLowerCase();
            req.session.userRole = normalizedRole;
            req.session.userId = user.id;
            req.session.user = { 
                username: user.username, 
                role: normalizedRole,
                id: user.id
            };
            
            req.session.save(err => {
                if (err) {
                    console.error('Session save failed:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error saving session' 
                    });
                }

                res.json({
                    success: true,
                    role: normalizedRole,
                    redirectTo: normalizedRole === 'admin' ? '/admin_panel.html' : '/field_data.html',
                    user: req.session.user
                });
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error logging in: ' + err.message 
        });
    }
});

// Get current user
app.get('/api/current-user', (req, res) => {
    if (req.session.user) {
        res.json({ 
            authenticated: true, 
            user: req.session.user 
        });
    } else {
        res.json({ 
            authenticated: false, 
            user: null 
        });
    }
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Logout failed' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    });
});

// Create user (admin only)
app.post('/admin/create-user', isAdmin, async (req, res) => {
    const { username, password, role } = req.body;
    try {
        if (!username || !password || !role) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username, password, and role are required' 
            });
        }

        // Check if user already exists
        const existing = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            "INSERT INTO users (username, password, role, status) VALUES ($1, $2, $3, 'active')",
            [username, hashedPassword, role]
        );
        
        res.json({ 
            success: true, 
            message: 'User created successfully' 
        });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating user: ' + err.message 
        });
    }
});

// Delete user (admin only)
app.post('/admin/delete-user', isAdmin, async (req, res) => {
    const { username } = req.body;
    try {
        // Prevent deleting yourself
        if (username === req.session.user?.username) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete your own account' 
            });
        }

        const result = await db.query("DELETE FROM users WHERE username = $1 RETURNING *", [username]);
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'User deleted successfully' 
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting user: ' + err.message 
        });
    }
});

// List users (admin only)
app.get('/admin/users', isAdmin, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, username, role, status, created_at FROM users ORDER BY created_at DESC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching users' 
        });
    }
});

/* =========================
   FIELD DATA ENTRY
========================= */
    const multer = require('multer');
   //const upload = multer();
     const upload = multer({ dest: 'uploads/' }); // Limit to 10 files
app.post('/data-entry', upload.array('files[]', 10), async (req, res) => {

    console.log("Body: ",req.body)
    try {
        const {
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
            species,
            tree_names,
            number_of_trees,
            seedling_source,
            followup_note,
            storyDescription,
            narrativeTitles,
            voiceNotes,
            files
        } = req.body;
     console.log("Body: ", req.body.natureOfEvent);
        console.log("Var: ",location=="")
        // Validate required fields
        if (natureOfEvent=="" || location=="" || programLeader=="") {
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
            programLeader || null,
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

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
    console.log(`📧 Email configured for: ${process.env.GMAIL_USER || 'Not set'}`);
    console.log(`🔑 SMTP Password: ${process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Not set'}`);
    console.log(`📊 Database: ${process.env.DB_NAME || 'Field_Data'}`);
    console.log('✅ Server is ready!');
});
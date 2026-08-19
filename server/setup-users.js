require("dotenv").config();
const bcrypt = require("bcrypt");
const { Pool } = require('pg');

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'P0$tgre1',
  database: process.env.DB_NAME || 'Field_Data',
  port: process.env.DB_PORT || 5432
});

async function setupUsers() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash("AdminPass123", 10);
    
    // Delete existing admin user if any
    await db.query("DELETE FROM users WHERE username = 'admin'");
    
    // Insert new admin user
    await db.query(
      "INSERT INTO users (username, password, role, status) VALUES ($1, $2, $3, 'active')",
      ['admin', hashedPassword, 'admin']
    );
    
    console.log("✓ Admin user created successfully");
    console.log("  Username: admin");
    console.log("  Password: AdminPass123");
    
    // Verify
    const result = await db.query("SELECT id, username, role FROM users WHERE username = 'admin'");
    console.log("  Verified in database:", result.rows[0]);
    
    db.end();
  } catch (err) {
    console.error("Error:", err.message);
    db.end();
    process.exit(1);
  }
}

setupUsers();

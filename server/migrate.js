// migrate.js - Run this ONCE to update your database schema
const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'P0$tgre1',
  database: process.env.DB_NAME || 'Field_Data',
  port: process.env.DB_PORT || 5432
});

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');

    // Add new columns to data_entries table
    const columns = [
      { name: 'nature_of_event', type: 'VARCHAR(50)' },
      { name: 'latitude', type: 'VARCHAR(20)' },
      { name: 'longitude', type: 'VARCHAR(20)' },
      { name: 'duration_type', type: 'VARCHAR(10) DEFAULT \'single\'' },
      { name: 'event_date', type: 'DATE' },
      { name: 'start_date', type: 'DATE' },
      { name: 'end_date', type: 'DATE' },
      { name: 'program_leader', type: 'VARCHAR(100)' },
      { name: 'followup_note', type: 'TEXT' },
      { name: 'story_description', type: 'TEXT' },
      { name: 'narrative_titles', type: 'TEXT' },
      { name: 'voice_notes', type: 'VARCHAR(255)' },
      { name: 'file_uploads', type: 'TEXT' }
    ];

    for (const col of columns) {
      try {
        await db.query(`ALTER TABLE data_entries ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
        console.log(`✅ Added column: ${col.name}`);
      } catch (err) {
        console.log(`⚠️ Column ${col.name} may already exist:`, err.message);
      }
    }

    // Create indexes for better performance
    try {
      await db.query('CREATE INDEX IF NOT EXISTS idx_data_entries_location ON data_entries(location)');
      console.log('✅ Created index: idx_data_entries_location');
    } catch (err) {
      console.log('⚠️ Index may already exist:', err.message);
    }

    try {
      await db.query('CREATE INDEX IF NOT EXISTS idx_data_entries_nature_of_event ON data_entries(nature_of_event)');
      console.log('✅ Created index: idx_data_entries_nature_of_event');
    } catch (err) {
      console.log('⚠️ Index may already exist:', err.message);
    }

    try {
      await db.query('CREATE INDEX IF NOT EXISTS idx_data_entries_event_date ON data_entries(event_date)');
      console.log('✅ Created index: idx_data_entries_event_date');
    } catch (err) {
      console.log('⚠️ Index may already exist:', err.message);
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
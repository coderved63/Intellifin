const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function wipeDatabase() {
    console.log('--- CRITICAL ACTION: Wiping Financial Database ---');
    try {
        await pool.query('TRUNCATE financial_statements RESTART IDENTITY CASCADE');
        await pool.query('TRUNCATE valuation_results RESTART IDENTITY CASCADE');
        await pool.query('TRUNCATE valuation_assumptions RESTART IDENTITY CASCADE');

        console.log('✅ Success: All tables truncated.');
        console.log('Ready for clean CSV ingestion.');
    } catch (err) {
        console.error('❌ Error during database wipe:', err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

wipeDatabase();

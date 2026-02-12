const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    console.log('Starting IntelliFin V2 Step 3 valuation tables migration...');
    const migrationPath = path.join(__dirname, '..', '..', 'database', 'migrations', 'v2_step3_valuation_tables.sql');

    try {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        await pool.query(sql);
        console.log('V2 Step 3 Migration successful.');
    } catch (err) {
        console.error('V2 Step 3 Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();

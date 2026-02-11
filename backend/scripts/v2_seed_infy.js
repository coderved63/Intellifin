const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function seed() {
    console.log('Seeding Infosys into registry...');
    await pool.query(`
        INSERT INTO companies (company_code, name, sector, industry, currency, country, is_active)
        VALUES ('INFY', 'Infosys Ltd', 'IT', 'Software Services', 'INR', 'India', true)
        ON CONFLICT (company_code) DO NOTHING
    `);
    console.log('✅ Infosys seeded.');
    await pool.end();
}

seed();

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function seed() {
    console.log('Seeding initial assumption sets...');

    const scenarios = [
        {
            company_code: 'BAJAJ_FINANCE',
            sector: 'NBFC',
            name: 'Base Case (FY26)',
            revenue_growth: 0.18,
            wacc: 0.125,
            terminal_growth: 0.05,
            notes: 'Steady growth based on historical trends for Bajaj Finance.'
        },
        {
            company_code: 'BAJAJ_FINANCE',
            sector: 'NBFC',
            name: 'Stress Case (FY26)',
            revenue_growth: 0.12,
            wacc: 0.14,
            terminal_growth: 0.04,
            notes: 'High interest rate environment impacting NBFC spreads.'
        },
        {
            company_code: 'INFY',
            sector: 'IT',
            name: 'Base Case (FY26)',
            revenue_growth: 0.10,
            wacc: 0.11,
            terminal_growth: 0.04,
            notes: 'Moderate growth for IT services with stable margins.'
        },
        {
            company_code: 'INFY',
            sector: 'IT',
            name: 'Bull Case (FY26)',
            revenue_growth: 0.15,
            wacc: 0.10,
            terminal_growth: 0.05,
            notes: 'Rapid AI adoption leading to higher billing rates and volume.'
        }
    ];

    try {
        for (const s of scenarios) {
            await pool.query(`
                INSERT INTO assumption_sets (company_code, sector, name, revenue_growth, wacc, terminal_growth, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [s.company_code, s.sector, s.name, s.revenue_growth, s.wacc, s.terminal_growth, s.notes]);
        }
        console.log('✅ Assumption sets seeded.');
    } catch (err) {
        console.error('Seeding failed:', err.message);
    } finally {
        await pool.end();
    }
}

seed();

const { Pool } = require('pg');
const ValuationEngine = require('../src/services/valuationEngine');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function test() {
    console.log('--- TESTING TERMINAL GROWTH CAP ENFORCEMENT ---');

    try {
        const engine = new ValuationEngine(pool);

        // Find or create hyper growth assumption
        const { rows: findAset } = await pool.query("SELECT id FROM assumption_sets WHERE name = 'Hyper Growth Test'");
        let asetId;

        if (findAset.length > 0) {
            asetId = findAset[0].id;
        } else {
            const { rows: newAset } = await pool.query(`
                INSERT INTO assumption_sets (company_code, sector, name, revenue_growth, wacc, terminal_growth, notes)
                VALUES ('INFY', 'IT', 'Hyper Growth Test', 0.20, 0.10, 0.10, 'Testing terminal growth cap logic')
                RETURNING id
            `);
            asetId = newAset[0].id;
        }

        console.log(`Using Assumption Set ID: ${asetId} (Terminal Growth: 10%)`);

        const result = await engine.run({
            companyCode: 'INFY',
            model: 'DCF',
            assumptionSetId: asetId
        });

        console.log(`Requested Terminal Growth: 0.10`);
        console.log(`Applied Terminal Growth: ${result.breakdown.applied_terminal_growth}`);

        if (result.breakdown.applied_terminal_growth === 0.05) {
            console.log('✅ PASS: Terminal growth was capped at 5% for IT sector.');
        } else {
            console.log('❌ FAIL: Terminal growth was NOT capped.');
        }

    } catch (err) {
        console.error('Test crashed:', err.message);
    } finally {
        await pool.end();
    }
}

test();

const { Pool } = require('pg');
const ValuationEngine = require('../src/services/valuationEngine');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    const engine = new ValuationEngine(pool);

    try {
        console.log('--- EXECUTING VALUATION RUNS ---');

        // 1. Fetch available assumption sets
        const { rows: assumptions } = await pool.query("SELECT id, company_code, name FROM assumption_sets");

        for (const assumption of assumptions) {
            console.log(`\nProcessing Scenario: ${assumption.name} for ${assumption.company_code}`);

            await engine.run({
                companyCode: assumption.company_code,
                model: 'DCF',
                assumptionSetId: assumption.id
            });
        }

        console.log('\nAll valuation runs completed.');
    } catch (err) {
        console.error('Valuation execution failed:', err.message);
    } finally {
        await pool.end();
    }
}

run();

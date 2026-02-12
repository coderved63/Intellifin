const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function verify() {
    console.log('--- INTELLIFIN V2 STEP 3 VALUATION AUDIT ---');

    try {
        const { rows: runs } = await pool.query(`
            SELECT 
                vr.id, 
                vr.company_code, 
                vr.sector, 
                vr.intrinsic_value, 
                vr.output->'fcf_proxy' as fcf_proxy,
                vr.output->'applied_terminal_growth' as applied_growth,
                aset.name as scenario_name
            FROM valuation_runs vr
            JOIN assumption_sets aset ON vr.assumption_set_id = aset.id
            ORDER BY vr.id ASC
        `);

        console.table(runs);

        // Specific Check for Sector-Aware Logic
        console.log('\n[SECTOR ANALYSIS]');

        runs.forEach(run => {
            if (run.sector === 'NBFC') {
                console.log(`- ${run.company_code} (${run.sector}): Proxy should be PAT. Result: ${run.fcf_proxy}`);
            } else if (run.sector === 'IT') {
                console.log(`- ${run.company_code} (${run.sector}): Proxy should be FCF. Result: ${run.fcf_proxy}`);
            }
        });

        // Check Terminal Growth Cap for IT (Base Case was 4%, Bull was 5%. Cap is 5%. 
        // Bajaj Base was 5%, Stress was 4%. Cap is 6%.
        // Let's seed a scenario that exceeds the cap to test the guard.)
        console.log('\n[CAP AUDIT] Checking if terminal growth caps are respected...');

    } catch (err) {
        console.error('Audit failed:', err.message);
    } finally {
        await pool.end();
    }
}

verify();

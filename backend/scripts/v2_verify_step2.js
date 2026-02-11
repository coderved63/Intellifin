const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function verify() {
    console.log('--- INTELLIFIN V2 STEP 2 ARCHITECTURE AUDIT ---');

    try {
        console.log('\n[REGISTRY] Registered Companies:');
        const { rows: registry } = await pool.query('SELECT company_code, name, sector, industry FROM companies');
        console.table(registry);

        console.log('\n[METRICS] Sector-Aware Metric Check:');

        // Check Bajaj (NBFC)
        const { rows: bajaj } = await pool.query(
            "SELECT metric_name, sector FROM derived_metrics WHERE company_code = 'BAJAJ_FINANCE' LIMIT 3"
        );
        console.log('Bajaj Finance (NBFC):');
        console.table(bajaj);

        // Check Infosys (IT)
        const { rows: infy } = await pool.query(
            "SELECT metric_name, sector FROM derived_metrics WHERE company_code = 'INFY' LIMIT 3"
        );
        console.log('Infosys (IT):');
        console.table(infy);

        // Explicit Check for FCF_MARGIN (should only be in IT)
        const { rows: fcfCheck } = await pool.query(
            "SELECT company_code FROM derived_metrics WHERE metric_name = 'FCF_MARGIN'"
        );
        console.log('\n[ISOLATION] Rows with FCF_MARGIN (Should only be INFY):');
        console.table(fcfCheck);

    } catch (err) {
        console.error('Audit failed:', err.message);
    } finally {
        await pool.end();
    }
}

verify();

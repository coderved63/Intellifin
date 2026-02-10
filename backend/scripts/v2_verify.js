const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function verify() {
    console.log('--- INTELLIFIN V2 STEP 1 DATA AUDIT ---');

    try {
        const { rows: raw } = await pool.query('SELECT count(*) FROM raw_financials');
        console.log(`[LAYER 1] Raw Financials: ${raw[0].count} rows`);

        const { rows: clean } = await pool.query('SELECT count(*) FROM clean_financials');
        console.log(`[LAYER 2] Clean Financials: ${clean[0].count} rows`);

        const { rows: derived } = await pool.query('SELECT count(*) FROM derived_metrics');
        console.log(`[LAYER 3] Derived Metrics: ${derived[0].count} rows`);

        console.log('\n--- SAMPLE METRICS (BAJAJ_FINANCE) ---');
        const { rows: sample } = await pool.query(
            "SELECT metric_name, metric_value, based_on_periods FROM derived_metrics WHERE company_code = 'BAJAJ_FINANCE' LIMIT 5"
        );
        console.table(sample);

        const { rows: failed } = await pool.query("SELECT count(*) FROM raw_financials WHERE status = 'FAILED'");
        console.log(`\n[DATA QUALITY] Failed Validations: ${failed[0].count}`);

    } catch (err) {
        console.error('Verification failed:', err.message);
    } finally {
        await pool.end();
    }
}

verify();

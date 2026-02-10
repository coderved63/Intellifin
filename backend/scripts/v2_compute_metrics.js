const { Pool } = require('pg');
const MetricsService = require('../src/services/metricsService');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        const metricsService = new MetricsService(pool);
        await metricsService.computeMetrics('BAJAJ_FINANCE');
        console.log('Metrics computation process completed.');
    } catch (err) {
        console.error('Metrics computation failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();

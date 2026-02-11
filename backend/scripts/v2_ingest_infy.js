const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const crypto = require('crypto');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

function calculateChecksum(payload) {
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

async function ingestCSV(filePath, companyCode, sourceName) {
    console.log(`Ingesting ${sourceName} from ${filePath}...`);

    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const periods = Object.keys(data[0]).filter(key => key !== 'Metric');

        for (const period of periods) {
            const payload = {};
            data.forEach(row => {
                payload[row.Metric] = row[period];
            });

            const checksum = calculateChecksum({ companyCode, period, sourceName, payload });

            try {
                await pool.query(
                    `INSERT INTO raw_financials (company_code, source, period, payload, checksum, status)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [companyCode, sourceName, period, payload, checksum, 'INGESTED']
                );
                console.log(`✅ Ingested ${companyCode} - ${sourceName} - ${period}`);
            } catch (err) {
                if (err.code === '23505') {
                    console.log(`⏭️ Duplicate skipped: ${companyCode} - ${sourceName} - ${period}`);
                } else {
                    console.error(`❌ Failed to ingest ${period}:`, err.message);
                }
            }
        }
    } catch (err) {
        console.error(`❌ Error reading ${filePath}:`, err.message);
    }
}

async function main() {
    const companyCode = 'INFY';
    const filePath = path.join(__dirname, '..', '..', 'database', 'raw_data', 'infy_income_statement.csv');
    await ingestCSV(filePath, companyCode, 'INCOME_STATEMENT');
    await pool.end();
}

main();

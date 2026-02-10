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

        // Group data by period (Year)
        // The CSV structure is Metric, TTM, 2025-03-31, 2024-03-31, etc.
        // We want to store each column as a separate payload in raw_financials

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
                if (err.code === '23505') { // Unique violation
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
    const companyCode = 'BAJAJ_FINANCE';
    const rawDataDir = path.join(__dirname, '..', '..', 'database', 'raw_data');

    const files = [
        { name: 'income_statement.csv', source: 'INCOME_STATEMENT' },
        { name: 'balance_sheet.csv', source: 'BALANCE_SHEET' },
        { name: 'cash_flow.csv', source: 'CASH_FLOW' }
    ];

    for (const file of files) {
        await ingestCSV(path.join(rawDataDir, file.name), companyCode, file.source);
    }

    await pool.end();
}

main();

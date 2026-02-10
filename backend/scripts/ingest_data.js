const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const rawDataDir = path.join(__dirname, '..', '..', 'database', 'raw_data');
const files = fs.readdirSync(rawDataDir).filter(f => f.endsWith('.xlsx'));

async function ingest() {
    console.log('Starting ingestion...');

    for (const file of files) {
        console.log(`Processing ${file}...`);
        const workbook = XLSX.readFile(path.join(rawDataDir, file));

        // We'll process P&L, Balance Sheet, and Cash Flow per year found in the file
        const dataMap = {}; // { year: { IS: {}, BS: {}, CF: {} } }

        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            let type = '';
            if (sheetName.toLowerCase().includes('p&l') || sheetName.toLowerCase().includes('profit')) type = 'INCOME_STATEMENT';
            else if (sheetName.toLowerCase().includes('balance')) type = 'BALANCE_SHEET';
            else if (sheetName.toLowerCase().includes('cash')) type = 'CASH_FLOW';

            if (!type) return;

            // Find header row with years
            let headerRowIndex = -1;
            let years = [];
            for (let i = 0; i < 10; i++) {
                if (rows[i] && rows[i].some(cell => typeof cell === 'number' && cell > 2000 && cell < 2100)) {
                    headerRowIndex = i;
                    years = rows[i].filter(cell => typeof cell === 'number' && cell > 2000 && cell < 2100);
                    break;
                }
            }

            if (headerRowIndex === -1) return;

            years.forEach(year => {
                if (!dataMap[year]) dataMap[year] = { INCOME_STATEMENT: {}, BALANCE_SHEET: {}, CASH_FLOW: {} };

                const colIndex = rows[headerRowIndex].indexOf(year);

                rows.slice(headerRowIndex + 1).forEach(row => {
                    const label = String(row[0] || '').trim();
                    const value = row[colIndex];
                    if (label && typeof value === 'number') {
                        dataMap[year][type][label] = value;
                    }
                });
            });
        });

        // Insert into DB
        for (const [year, statements] of Object.entries(dataMap)) {
            for (const [type, metrics] of Object.entries(statements)) {
                if (Object.keys(metrics).length > 0) {
                    try {
                        await pool.query(
                            `INSERT INTO financial_statements (fiscal_year, statement_type, metrics)
                             VALUES ($1, $2, $3)
                             ON CONFLICT (company_name, fiscal_year, statement_type, is_forecast) DO UPDATE
                             SET metrics = EXCLUDED.metrics`,
                            [parseInt(year), type, JSON.stringify(metrics)]
                        );
                        console.log(`Inserted ${type} for year ${year}`);
                    } catch (err) {
                        console.error(`Error inserting ${type} for ${year}:`, err.message);
                    }
                }
            }
        }
    }

    await pool.end();
    console.log('Ingestion complete.');
}

ingest().catch(console.error);

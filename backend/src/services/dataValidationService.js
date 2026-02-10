const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

class DataValidationService {
    static async validateAndMigrate() {
        console.log('Starting Data Validation and Migration to Clean Layer...');

        // 1. Fetch INGESTED raw financials
        const { rows: rawRows } = await pool.query(
            "SELECT * FROM raw_financials WHERE status = 'INGESTED' ORDER BY fetched_at ASC"
        );

        if (rawRows.length === 0) {
            console.log('No new raw data to validate.');
            return;
        }

        // We need to consolidate data by Company and Period across different sources
        // For Step 1, we specifically looking for Revenue and PAT
        const consolidated = {};

        for (const row of rawRows) {
            const key = `${row.company_code}_${row.period}`;
            if (!consolidated[key]) {
                consolidated[key] = {
                    company_code: row.company_code,
                    period: row.period,
                    raw_ids: [],
                    data: {}
                };
            }
            consolidated[key].raw_ids.push(row.id);
            Object.assign(consolidated[key].data, row.payload);
        }

        for (const key in consolidated) {
            const entry = consolidated[key];
            const validationNotes = [];
            let isValid = true;

            const revenue = parseFloat(entry.data["Total Revenue"] || 0);
            const pat = parseFloat(entry.data["Net Income"] || 0);

            // Validation Rule 1: Revenue must be non-negative
            if (revenue < 0) {
                isValid = false;
                validationNotes.push('CRITICAL: Revenue is negative');
            }

            // Validation Rule 2: PAT can be negative but with warning
            if (pat < 0) {
                validationNotes.push('WARNING: PAT is negative');
            }

            // Validation Rule 3: Abnormal Jump Detection (@TODO: Needs historical comparison)
            // For now, we'll mark it as validated if Revenue is >= 0

            if (isValid) {
                try {
                    // Start transaction
                    const client = await pool.connect();
                    try {
                        await client.query('BEGIN');

                        // Insert into clean_financials
                        await client.query(
                            `INSERT INTO clean_financials (raw_id, company_code, period, revenue, pat, validation_notes)
                             VALUES ($1, $2, $3, $4, $5, $6)`,
                            [entry.raw_ids[0], entry.company_code, entry.period, revenue, pat, JSON.stringify(validationNotes)]
                        );

                        // Mark raw rows as VALIDATED
                        await client.query(
                            "UPDATE raw_financials SET status = 'VALIDATED' WHERE id = ANY($1)",
                            [entry.raw_ids]
                        );

                        await client.query('COMMIT');
                        console.log(`✅ Validated and Migrated: ${entry.company_code} - ${entry.period}`);
                    } catch (err) {
                        await client.query('ROLLBACK');
                        throw err;
                    } finally {
                        client.release();
                    }
                } catch (err) {
                    console.error(`❌ Transaction failed for ${key}:`, err.message);
                }
            } else {
                // Mark raw rows as FAILED
                await pool.query(
                    "UPDATE raw_financials SET status = 'FAILED' WHERE id = ANY($1)",
                    [entry.raw_ids]
                );
                console.log(`❌ Validation Failed: ${entry.company_code} - ${entry.period} - Notes: ${validationNotes.join(', ')}`);
            }
        }
    }
}

module.exports = DataValidationService;

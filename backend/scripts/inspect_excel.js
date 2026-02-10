const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const rawDataDir = path.join(__dirname, '..', '..', 'database', 'raw_data');
const files = fs.readdirSync(rawDataDir).filter(f => f.endsWith('.xlsx'));

files.forEach(file => {
    console.log(`\n--- Inspecting file: ${file} ---`);
    try {
        const workbook = XLSX.readFile(path.join(rawDataDir, file));
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            console.log(`\nSheet: ${sheetName}`);
            // Print rows until we find meaningful data or 20 rows
            data.slice(0, 20).forEach((row, i) => {
                if (row.length > 0) {
                    console.log(`Row ${i}:`, JSON.stringify(row));
                }
            });
        });
    } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
    }
});

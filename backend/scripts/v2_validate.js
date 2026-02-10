const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const DataValidationService = require('../src/services/dataValidationService');

async function run() {
    try {
        await DataValidationService.validateAndMigrate();
        console.log('Validation and Migration process completed.');
    } catch (err) {
        console.error('Validation process failed:', err.message);
        process.exit(1);
    }
}

run();

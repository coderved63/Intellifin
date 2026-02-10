const ValuationService = require('../src/services/valuationService');

async function run() {
    console.log('Running valuation for Bajaj Finance Ltd...');
    try {
        const result = await ValuationService.performValuation();
        console.log('\n--- Valuation Results ---');
        console.log(`Intrinsic Value: ₹${result.intrinsicValuePerShare.toFixed(2)}`);
        console.log(`Current Price: ₹${result.currentPrice}`);
        console.log(`Recommendation: ${result.recommendation}`);
        console.log(`Explanation: ${result.explanation}`);

        await ValuationService.saveValuation(result);
        console.log('\nResults saved to database.');
        process.exit(0);
    } catch (err) {
        console.error('Error during valuation:', err.message);
        process.exit(1);
    }
}

run();

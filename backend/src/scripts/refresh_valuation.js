const ValuationService = require('../services/valuationService');

async function refresh() {
    console.log('--- REFRESHING VALUATION MODEL ---');
    try {
        console.log('Calculating fresh DCF for Bajaj Finance Ltd...');
        const result = await ValuationService.performValuation();

        console.log('Success! New Intrinsic Value:', result.intrinsic_value_per_share.toFixed(2));
        console.log('Forecast Horizon:', result.forecast[0].year, '-', result.forecast[4].year);

        console.log('Saving to database...');
        await ValuationService.saveValuation(result);

        console.log('--- REFRESH COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('REFRESH FAILED:', err.message);
        process.exit(1);
    }
}

refresh();

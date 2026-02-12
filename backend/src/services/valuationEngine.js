const { sectorProfiles } = require('../config/sectorProfiles');

class ValuationEngine {
    constructor(pool) {
        this.pool = pool;
    }

    async run({ companyCode, model = 'DCF', assumptionSetId }) {
        console.log(`🚀 Starting Valuation Run: ${companyCode} | Model: ${model} | AssumptionSet: ${assumptionSetId}`);

        // 1. Fetch Company & Sector
        const { rows: companyRows } = await this.pool.query(
            "SELECT company_code, sector, name FROM companies WHERE company_code = $1",
            [companyCode]
        );

        if (companyRows.length === 0) throw new Error(`Company ${companyCode} not found.`);
        const company = companyRows[0];
        const sector = company.sector;

        // 2. Load Sector Profile
        const profile = sectorProfiles[sector];
        if (!profile) throw new Error(`Sector profile not found for ${sector}`);

        // 3. Sector Guards: Model Check
        if (!profile.valuationModelsAllowed.includes(model)) {
            throw new Error(`Valuation model ${model} not allowed for sector ${sector}`);
        }

        // 4. Fetch Assumption Set
        const { rows: assumptionRows } = await this.pool.query(
            "SELECT * FROM assumption_sets WHERE id = $1",
            [assumptionSetId]
        );
        if (assumptionRows.length === 0) throw new Error(`Assumption set ${assumptionSetId} not found.`);
        const assumption = assumptionRows[0];

        // 5. Fetch Latest Derived Metrics & Clean Data
        const { rows: metrics } = await this.pool.query(
            "SELECT metric_name, metric_value FROM derived_metrics WHERE company_code = $1",
            [companyCode]
        );

        const { rows: latestFinancials } = await this.pool.query(
            "SELECT revenue, pat, period FROM clean_financials WHERE company_code = $1 ORDER BY period DESC LIMIT 1",
            [companyCode]
        );

        if (latestFinancials.length === 0) throw new Error(`No clean financial data found for ${companyCode}`);
        const baseFinancials = latestFinancials[0];

        // 6. Data Snapshot for Explainability
        const dataSnapshot = {
            base_revenue: parseFloat(baseFinancials.revenue),
            base_period: baseFinancials.period,
            metrics: metrics.reduce((acc, m) => ({ ...acc, [m.metric_name]: parseFloat(m.metric_value) }), {})
        };

        // 7. Apply Sector Constraints: Terminal Growth Cap
        const terminalGrowth = Math.min(
            parseFloat(assumption.terminal_growth),
            profile.terminalGrowthCap / 100 // profile cap is e.g. 6 (6%)
        );

        // 8. Execute Valuation Model (DCF)
        let result;
        if (model === 'DCF') {
            result = await this.calculateDCF(dataSnapshot, assumption, terminalGrowth, profile);
        } else {
            throw new Error(`Model ${model} logic not implemented.`);
        }

        // 9. Store Valuation Run (Immutable)
        const { rows: runResult } = await this.pool.query(
            `INSERT INTO valuation_runs (company_code, sector, model_type, assumption_set_id, data_snapshot, output, intrinsic_value)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [
                companyCode,
                sector,
                model,
                assumptionSetId,
                JSON.stringify(dataSnapshot),
                JSON.stringify(result.breakdown),
                result.intrinsicValue
            ]
        );

        console.log(`✅ Valuation successful. Run ID: ${runResult[0].id} | Intrinsic Value: ${result.intrinsicValue}`);
        return { runId: runResult[0].id, ...result };
    }

    async calculateDCF(data, assumption, terminalGrowth, profile) {
        const revGrowth = parseFloat(assumption.revenue_growth);
        const wacc = parseFloat(assumption.wacc);

        // Determine Base CF using sector-specific Proxy
        const marginMetric = profile.fcfProxy === 'PAT' ? 'PAT_MARGIN' : 'FCF_MARGIN';
        const margin = data.metrics[marginMetric];

        if (margin === undefined) {
            throw new Error(`Required metric ${marginMetric} missing for ${profile.fcfProxy} proxy (Sector: ${profile.sector})`);
        }

        const baseCF = data.base_revenue * margin;

        const forecasts = [];
        let totalPV = 0;

        for (let i = 1; i <= 5; i++) {
            const projectedCF = baseCF * Math.pow(1 + revGrowth, i);
            const pv = projectedCF / Math.pow(1 + wacc, i);
            forecasts.push({
                year: i,
                projectedCF,
                pv
            });
            totalPV += pv;
        }

        // Terminal Value
        const year5CF = forecasts[4].projectedCF;
        const terminalValue = (year5CF * (1 + terminalGrowth)) / (wacc - terminalGrowth);
        const discountedTV = terminalValue / Math.pow(1 + wacc, 5);

        const intrinsicValue = totalPV + discountedTV;

        return {
            intrinsicValue: parseFloat(intrinsicValue.toFixed(2)),
            breakdown: {
                base_cf: baseCF,
                fcf_proxy: profile.fcfProxy,
                applied_terminal_growth: terminalGrowth,
                forecasts,
                terminal_value: terminalValue,
                discounted_tv: discountedTV,
                present_value_of_forecasts: totalPV
            }
        };
    }
}

module.exports = ValuationEngine;

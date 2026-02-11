const { Pool } = require('pg');
const { sectorProfiles } = require('../config/sectorProfiles');

class MetricsService {
    constructor(pool) {
        this.pool = pool;
    }

    async computeMetrics(companyCode) {
        console.log(`Computing Derived Metrics for ${companyCode}...`);

        // 1. Fetch Company Sector
        const { rows: companyRows } = await this.pool.query(
            "SELECT sector FROM companies WHERE company_code = $1",
            [companyCode]
        );

        if (companyRows.length === 0) {
            console.error(`❌ Company ${companyCode} not found in master registry.`);
            return;
        }

        const sector = companyRows[0].sector;
        const profile = sectorProfiles[sector];

        if (!profile) {
            console.warn(`⚠️ No sector profile found for ${sector}. Skipping metrics.`);
            return;
        }

        console.log(`Using sector profile: ${sector}`);

        // 2. Fetch clean financials
        const { rows: financialRows } = await this.pool.query(
            "SELECT * FROM clean_financials WHERE company_code = $1 ORDER BY period ASC",
            [companyCode]
        );

        if (financialRows.length === 0) {
            console.log(`No clean data found for ${companyCode}`);
            return;
        }

        const metricsToInsert = [];

        for (let i = 0; i < financialRows.length; i++) {
            const current = financialRows[i];
            const prev = i > 0 ? financialRows[i - 1] : null;

            const revenue = parseFloat(current.revenue);
            const pat = parseFloat(current.pat);

            // Logic 1: PAT Margin (if allowed)
            if (profile.allowedMetrics.includes('PAT_MARGIN') && revenue > 0) {
                metricsToInsert.push({
                    company_code: companyCode,
                    sector: sector,
                    metric_name: 'PAT_MARGIN',
                    metric_value: (pat / revenue),
                    based_on_periods: [current.period]
                });
            }

            // Logic 2: Revenue Growth (if allowed)
            if (profile.allowedMetrics.includes('REVENUE_GROWTH_YOY') && prev) {
                const prevRevenue = parseFloat(prev.revenue);
                if (prevRevenue > 0) {
                    metricsToInsert.push({
                        company_code: companyCode,
                        sector: sector,
                        metric_name: 'REVENUE_GROWTH_YOY',
                        metric_value: (revenue - prevRevenue) / prevRevenue,
                        based_on_periods: [prev.period, current.period]
                    });
                }
            }

            // Logic 3: FCF Margin (Place-holder for IT sector proof)
            // (In a real scenario, this would fetch from clean_financials.fcf)
            if (profile.allowedMetrics.includes('FCF_MARGIN') && revenue > 0) {
                const fcf = pat * 0.85; // Dummy FCF for proof of concept
                metricsToInsert.push({
                    company_code: companyCode,
                    sector: sector,
                    metric_name: 'FCF_MARGIN',
                    metric_value: (fcf / revenue),
                    based_on_periods: [current.period]
                });
            }
        }

        // 3. Clear existing metrics for this company to prevent duplicates (Step 2 logic)
        await this.pool.query("DELETE FROM derived_metrics WHERE company_code = $1", [companyCode]);

        // 4. Insert metrics
        for (const m of metricsToInsert) {
            await this.pool.query(
                `INSERT INTO derived_metrics (company_code, sector, metric_name, metric_value, based_on_periods)
                 VALUES ($1, $2, $3, $4, $5)`,
                [m.company_code, m.sector, m.metric_name, m.metric_value, JSON.stringify(m.based_on_periods)]
            );
        }

        console.log(`✅ Computed ${metricsToInsert.length} metrics for ${companyCode} (Sector: ${sector})`);
    }
}

module.exports = MetricsService;

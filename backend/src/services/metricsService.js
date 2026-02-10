const { Pool } = require('pg');

class MetricsService {
    constructor(pool) {
        this.pool = pool;
    }

    async computeMetrics(companyCode) {
        console.log(`Computing Derived Metrics for ${companyCode}...`);

        // 1. Fetch clean financials ordered by period
        const { rows } = await this.pool.query(
            "SELECT * FROM clean_financials WHERE company_code = $1 ORDER BY period ASC",
            [companyCode]
        );

        if (rows.length === 0) {
            console.log(`No clean data found for ${companyCode}`);
            return;
        }

        const metrics = [];

        for (let i = 0; i < rows.length; i++) {
            const current = rows[i];
            const prev = i > 0 ? rows[i - 1] : null;

            const revenue = parseFloat(current.revenue);
            const pat = parseFloat(current.pat);

            // Metric 1: PAT Margin
            if (revenue > 0) {
                metrics.push({
                    company_code: companyCode,
                    metric_name: 'PAT_MARGIN',
                    metric_value: (pat / revenue),
                    based_on_periods: [current.period]
                });
            }

            // Metric 2: Revenue Growth (YoY)
            if (prev) {
                const prevRevenue = parseFloat(prev.revenue);
                if (prevRevenue > 0) {
                    metrics.push({
                        company_code: companyCode,
                        metric_name: 'REVENUE_GROWTH_YOY',
                        metric_value: (revenue - prevRevenue) / prevRevenue,
                        based_on_periods: [prev.period, current.period]
                    });
                }
            }
        }

        // 2. Insert metrics into derived_metrics
        for (const m of metrics) {
            await this.pool.query(
                `INSERT INTO derived_metrics (company_code, metric_name, metric_value, based_on_periods)
                 VALUES ($1, $2, $3, $4)`,
                [m.company_code, m.metric_name, m.metric_value, JSON.stringify(m.based_on_periods)]
            );
        }

        console.log(`✅ Computed ${metrics.length} metrics for ${companyCode}`);
    }
}

module.exports = MetricsService;

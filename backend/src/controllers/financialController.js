const db = require('../db');

exports.getHistoricalFinancials = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT fiscal_year, statement_type, metrics FROM financial_statements WHERE company_name = $1 AND is_forecast = FALSE ORDER BY fiscal_year ASC',
            ['Bajaj Finance Ltd']
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getValuationResults = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM valuation_results WHERE company_name = $1 ORDER BY valuation_date DESC, created_at DESC LIMIT 1',
            ['Bajaj Finance Ltd']
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAssumptions = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM valuation_assumptions ORDER BY created_at DESC LIMIT 1'
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

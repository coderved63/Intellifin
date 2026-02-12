-- IntelliFin V2 Step 3 Migration: Valuation Engine & Versioned Analysis

-- 1. Assumption Sets Table
CREATE TABLE IF NOT EXISTS assumption_sets (
    id SERIAL PRIMARY KEY,
    company_code VARCHAR(20) REFERENCES companies(company_code),
    sector VARCHAR(100),
    name VARCHAR(255) NOT NULL,                -- e.g., Base Case, Bull Case
    revenue_growth NUMERIC(10, 4) NOT NULL,    -- e.g., 0.15 for 15%
    wacc NUMERIC(10, 4) NOT NULL,              -- e.g., 0.12 for 12%
    terminal_growth NUMERIC(10, 4) NOT NULL,    -- e.g., 0.05 for 5%
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Valuation Runs Table
CREATE TABLE IF NOT EXISTS valuation_runs (
    id SERIAL PRIMARY KEY,
    company_code VARCHAR(20) REFERENCES companies(company_code),
    sector VARCHAR(100),
    model_type VARCHAR(50) DEFAULT 'DCF',      -- e.g., DCF
    assumption_set_id INTEGER REFERENCES assumption_sets(id),
    data_snapshot JSONB NOT NULL,              -- metrics used for this specific run
    output JSONB NOT NULL,                     -- full valuation breakdown (forecasts, TV, etc.)
    intrinsic_value NUMERIC(20, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

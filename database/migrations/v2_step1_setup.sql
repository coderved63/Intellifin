-- IntelliFin V2 Step 1 Migration: Governed Financial Data Pipeline

-- 1. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    company_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    currency VARCHAR(10),
    country VARCHAR(100)
);

-- 2. RAW DATA LAYER (Immutable Data Lake)
CREATE TABLE IF NOT EXISTS raw_financials (
    id SERIAL PRIMARY KEY,
    company_code VARCHAR(20) REFERENCES companies(company_code),
    source VARCHAR(255) NOT NULL,
    period VARCHAR(20) NOT NULL,
    payload JSONB NOT NULL,
    checksum VARCHAR(64) UNIQUE NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'INGESTED' -- INGESTED, DUPLICATE, FAILED, VALIDATED
);

-- 3. CLEAN DATA LAYER (Validated and Structured)
CREATE TABLE IF NOT EXISTS clean_financials (
    id SERIAL PRIMARY KEY,
    raw_id INTEGER REFERENCES raw_financials(id),
    company_code VARCHAR(20) REFERENCES companies(company_code),
    period VARCHAR(20) NOT NULL,
    revenue NUMERIC(20, 2),
    pat NUMERIC(20, 2),
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    validation_notes JSONB
);

-- 4. DERIVED METRICS LAYER
CREATE TABLE IF NOT EXISTS derived_metrics (
    id SERIAL PRIMARY KEY,
    company_code VARCHAR(20) REFERENCES companies(company_code),
    sector VARCHAR(100),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(20, 4),
    based_on_periods JSONB, -- List of periods used for calculation (e.g., ["2023", "2024"])
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Company context
INSERT INTO companies (company_code, name, sector, currency, country)
VALUES ('BAJAJ_FINANCE', 'Bajaj Finance Ltd', 'Financial Services', 'INR', 'India')
ON CONFLICT (company_code) DO NOTHING;

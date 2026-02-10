-- Database Schema for Intelligent Financial Modelling & Valuation Platform
-- Target: PostgreSQL

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_statements (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) DEFAULT 'Bajaj Finance Ltd',
    fiscal_year INTEGER NOT NULL,
    statement_type VARCHAR(50) NOT NULL, -- 'INCOME_STATEMENT', 'BALANCE_SHEET', 'CASH_FLOW'
    is_forecast BOOLEAN DEFAULT FALSE,
    metrics JSONB NOT NULL, -- Stores all financial line items
    currency VARCHAR(10) DEFAULT 'INR',
    unit VARCHAR(20) DEFAULT 'Cr',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_name, fiscal_year, statement_type, is_forecast)
);

CREATE TABLE IF NOT EXISTS valuation_assumptions (
    id SERIAL PRIMARY KEY,
    description TEXT,
    wacc DECIMAL(5, 4), -- e.g., 0.1200 for 12%
    terminal_growth_rate DECIMAL(5, 4),
    revenue_growth_forecast JSONB, -- Array of growth rates for 5 years
    operating_margin_forecast JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS valuation_results (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) DEFAULT 'Bajaj Finance Ltd',
    valuation_date DATE DEFAULT CURRENT_TIMESTAMP,
    intrinsic_value_per_share DECIMAL(15, 2),
    current_market_price DECIMAL(15, 2),
    recommendation VARCHAR(10), -- 'BUY', 'HOLD', 'SELL'
    explanation_summary TEXT,
    dcf_details JSONB, -- Breakdown of PV of FCFF, Terminal Value, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

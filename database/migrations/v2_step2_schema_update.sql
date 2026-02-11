-- IntelliFin V2 Step 2 Migration: Schema Enhancements

-- Update companies table for better granularity
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing Bajaj record
UPDATE companies 
SET industry = 'Consumer Finance', sector = 'NBFC'
WHERE company_code = 'BAJAJ_FINANCE';

-- Seed Infosys
INSERT INTO companies (company_code, name, sector, industry, currency, country, is_active)
VALUES ('INFY', 'Infosys Ltd', 'IT', 'Software Services', 'INR', 'India', true)
ON CONFLICT (company_code) DO NOTHING;

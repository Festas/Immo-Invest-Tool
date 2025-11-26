-- ImmoCalc Pro Database Schema
-- PostgreSQL (Supabase compatible)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE afa_type AS ENUM (
    'ALTBAU_VOR_1925',
    'ALTBAU_AB_1925',
    'NEUBAU_AB_2023',
    'DENKMALSCHUTZ'
);

CREATE TYPE bundesland AS ENUM (
    'BADEN_WUERTTEMBERG',
    'BAYERN',
    'BERLIN',
    'BRANDENBURG',
    'BREMEN',
    'HAMBURG',
    'HESSEN',
    'MECKLENBURG_VORPOMMERN',
    'NIEDERSACHSEN',
    'NORDRHEIN_WESTFALEN',
    'RHEINLAND_PFALZ',
    'SAARLAND',
    'SACHSEN',
    'SACHSEN_ANHALT',
    'SCHLESWIG_HOLSTEIN',
    'THUERINGEN'
);

-- Properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    address TEXT,
    postal_code VARCHAR(10),
    city VARCHAR(100),
    bundesland bundesland,
    
    -- Purchase & Costs
    purchase_price DECIMAL(12, 2) NOT NULL,
    broker_percent DECIMAL(5, 2) DEFAULT 3.57,
    notary_percent DECIMAL(5, 2) DEFAULT 2.0,
    property_transfer_tax_percent DECIMAL(5, 2) DEFAULT 3.5,
    renovation_costs DECIMAL(12, 2) DEFAULT 0,
    
    -- Financing
    equity DECIMAL(12, 2) NOT NULL,
    interest_rate DECIMAL(5, 3) DEFAULT 3.5,
    repayment_rate DECIMAL(5, 3) DEFAULT 2.0,
    fixed_interest_period INTEGER DEFAULT 15,
    
    -- Operations
    cold_rent_actual DECIMAL(10, 2) NOT NULL,
    cold_rent_target DECIMAL(10, 2),
    non_recoverable_costs DECIMAL(10, 2) DEFAULT 100,
    maintenance_reserve DECIMAL(10, 2) DEFAULT 50,
    vacancy_risk_percent DECIMAL(5, 2) DEFAULT 2.0,
    
    -- Tax
    personal_tax_rate DECIMAL(5, 2) DEFAULT 35.0,
    building_share_percent DECIMAL(5, 2) DEFAULT 75.0,
    afa_type afa_type DEFAULT 'ALTBAU_AB_1925',
    
    -- Calculated fields (cached for quick portfolio overview)
    total_investment DECIMAL(12, 2),
    monthly_cashflow DECIMAL(10, 2),
    annual_cashflow DECIMAL(12, 2),
    gross_rental_yield DECIMAL(5, 2),
    net_rental_yield DECIMAL(5, 2),
    return_on_equity DECIMAL(6, 2),
    
    -- Metadata
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_is_active ON properties(is_active);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);

-- Scenarios table for comparison feature
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Financing variations
    equity DECIMAL(12, 2),
    interest_rate DECIMAL(5, 3),
    repayment_rate DECIMAL(5, 3),
    fixed_interest_period INTEGER,
    
    -- Rent variations
    cold_rent_actual DECIMAL(10, 2),
    
    -- Calculated results
    monthly_cashflow DECIMAL(10, 2),
    annual_cashflow DECIMAL(12, 2),
    return_on_equity DECIMAL(6, 2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scenarios_property_id ON scenarios(property_id);
CREATE INDEX idx_scenarios_user_id ON scenarios(user_id);

-- Amortization schedules (optional, for detailed storage)
CREATE TABLE amortization_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    
    year INTEGER NOT NULL,
    starting_balance DECIMAL(12, 2) NOT NULL,
    interest_payment DECIMAL(12, 2) NOT NULL,
    principal_payment DECIMAL(12, 2) NOT NULL,
    ending_balance DECIMAL(12, 2) NOT NULL,
    cumulative_interest DECIMAL(12, 2) NOT NULL,
    cumulative_principal DECIMAL(12, 2) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_amortization_property_id ON amortization_schedules(property_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at
    BEFORE UPDATE ON scenarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) for Supabase
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE amortization_schedules ENABLE ROW LEVEL SECURITY;

-- Policies for properties
CREATE POLICY "Users can view own properties"
    ON properties FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties"
    ON properties FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
    ON properties FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
    ON properties FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for scenarios
CREATE POLICY "Users can view own scenarios"
    ON scenarios FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scenarios"
    ON scenarios FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scenarios"
    ON scenarios FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scenarios"
    ON scenarios FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for amortization schedules (linked to properties)
CREATE POLICY "Users can view own amortization schedules"
    ON amortization_schedules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM properties
            WHERE properties.id = amortization_schedules.property_id
            AND properties.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own amortization schedules"
    ON amortization_schedules FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM properties
            WHERE properties.id = amortization_schedules.property_id
            AND properties.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own amortization schedules"
    ON amortization_schedules FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM properties
            WHERE properties.id = amortization_schedules.property_id
            AND properties.user_id = auth.uid()
        )
    );

-- View for portfolio summary
CREATE VIEW portfolio_summary AS
SELECT 
    user_id,
    COUNT(*) as total_properties,
    SUM(total_investment) as total_investment,
    SUM(equity) as total_equity,
    SUM(total_investment - equity) as total_debt,
    SUM(monthly_cashflow) as total_monthly_cashflow,
    SUM(annual_cashflow) as total_annual_cashflow,
    AVG(gross_rental_yield) as avg_gross_yield,
    AVG(net_rental_yield) as avg_net_yield,
    AVG(return_on_equity) as avg_roe
FROM properties
WHERE is_active = true
GROUP BY user_id;

-- Sample insert for testing (without auth)
-- INSERT INTO properties (
--     name,
--     purchase_price,
--     equity,
--     cold_rent_actual,
--     total_investment,
--     monthly_cashflow
-- ) VALUES (
--     'Musterwohnung München',
--     300000,
--     60000,
--     1000,
--     335700,
--     150
-- );

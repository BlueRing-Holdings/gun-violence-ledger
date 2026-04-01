-- Gun Violence Ledger — Initial Schema
-- All tables: append-only, public read, RLS enabled
-- No UPDATE. No DELETE. Ever.

-- Annual deaths from CDC WONDER (1968–2024)
CREATE TABLE IF NOT EXISTS annual_deaths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  deaths INTEGER NOT NULL,
  population BIGINT,
  rate_per_100k NUMERIC(6,1),
  source TEXT NOT NULL DEFAULT 'CDC WONDER',
  source_url TEXT NOT NULL DEFAULT 'https://wonder.cdc.gov/',
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily YTD from Gun Violence Archive
CREATE TABLE IF NOT EXISTS daily_ytd (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  total_incidents INTEGER NOT NULL DEFAULT 0,
  total_deaths INTEGER NOT NULL DEFAULT 0,
  total_injuries INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'Gun Violence Archive',
  source_url TEXT NOT NULL DEFAULT 'https://www.gunviolencearchive.org/',
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demographic breakdown
CREATE TABLE IF NOT EXISTS demographic_deaths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  category TEXT NOT NULL, -- 'age_group', 'race', 'sex', 'intent'
  group_name TEXT NOT NULL,
  deaths INTEGER NOT NULL,
  rate_per_100k NUMERIC(6,1),
  source TEXT NOT NULL DEFAULT 'CDC WONDER',
  source_url TEXT NOT NULL DEFAULT 'https://wonder.cdc.gov/',
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- State-level data
CREATE TABLE IF NOT EXISTS state_deaths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  state TEXT NOT NULL,
  state_fips TEXT,
  deaths INTEGER NOT NULL,
  population BIGINT,
  rate_per_100k NUMERIC(6,1),
  source TEXT NOT NULL DEFAULT 'CDC WONDER',
  source_url TEXT NOT NULL DEFAULT 'https://wonder.cdc.gov/',
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Economic costs
CREATE TABLE IF NOT EXISTS economic_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  amount_usd BIGINT NOT NULL,
  description TEXT,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy events timeline
CREATE TABLE IF NOT EXISTS policy_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'mass_shooting', 'legislation', 'court_ruling', 'executive_action'
  deaths INTEGER,
  policy_outcome TEXT,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  record_count INTEGER,
  checksum TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE annual_deaths ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_ytd ENABLE ROW LEVEL SECURITY;
ALTER TABLE demographic_deaths ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_deaths ENABLE ROW LEVEL SECURITY;
ALTER TABLE economic_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read" ON annual_deaths FOR SELECT USING (true);
CREATE POLICY "Public read" ON daily_ytd FOR SELECT USING (true);
CREATE POLICY "Public read" ON demographic_deaths FOR SELECT USING (true);
CREATE POLICY "Public read" ON state_deaths FOR SELECT USING (true);
CREATE POLICY "Public read" ON economic_costs FOR SELECT USING (true);
CREATE POLICY "Public read" ON policy_events FOR SELECT USING (true);
CREATE POLICY "Public read" ON audit_events FOR SELECT USING (true);

-- Service role insert policies
CREATE POLICY "Service insert" ON annual_deaths FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert" ON daily_ytd FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert" ON demographic_deaths FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert" ON state_deaths FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert" ON economic_costs FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert" ON policy_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert" ON audit_events FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_annual_deaths_year ON annual_deaths(year);
CREATE INDEX idx_daily_ytd_date ON daily_ytd(date);
CREATE INDEX idx_demographic_year_cat ON demographic_deaths(year, category);
CREATE INDEX idx_state_deaths_year ON state_deaths(year);
CREATE INDEX idx_policy_events_date ON policy_events(date);
CREATE INDEX idx_audit_events_created ON audit_events(created_at);

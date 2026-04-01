-- Gladius — Global Schema Extension
-- Adds WHO country-level data, UCDP conflict data, and gap entries
-- All tables: append-only, public read, RLS enabled
-- No UPDATE. No DELETE. Ever.

-- Country-level firearm mortality (WHO Global Health Observatory)
CREATE TABLE IF NOT EXISTS country_deaths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  country_name TEXT NOT NULL,
  country_iso3 TEXT NOT NULL, -- ISO 3166-1 alpha-3
  deaths INTEGER, -- NULL if data not reported
  population BIGINT,
  rate_per_100k NUMERIC(6,1),
  data_reported BOOLEAN NOT NULL DEFAULT true, -- false = gap entry
  source TEXT NOT NULL DEFAULT 'WHO GHO',
  source_url TEXT NOT NULL DEFAULT 'https://www.who.int/data/gho/',
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conflict-related firearm deaths (UCDP)
CREATE TABLE IF NOT EXISTS conflict_deaths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  conflict_name TEXT NOT NULL,
  country_name TEXT NOT NULL,
  country_iso3 TEXT NOT NULL,
  deaths_total INTEGER NOT NULL,
  deaths_firearms INTEGER, -- NULL if breakdown not available
  conflict_type TEXT NOT NULL, -- 'state-based', 'non-state', 'one-sided'
  source TEXT NOT NULL DEFAULT 'UCDP',
  source_url TEXT NOT NULL DEFAULT 'https://ucdp.uu.se/',
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add scope column to economic_costs for global vs country-level
ALTER TABLE economic_costs ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'united_states';

-- Add country columns to policy_events for global events
ALTER TABLE policy_events ADD COLUMN IF NOT EXISTS country_name TEXT NOT NULL DEFAULT 'United States';
ALTER TABLE policy_events ADD COLUMN IF NOT EXISTS country_iso3 TEXT NOT NULL DEFAULT 'USA';

-- Enable RLS
ALTER TABLE country_deaths ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_deaths ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read" ON country_deaths FOR SELECT USING (true);
CREATE POLICY "Public read" ON conflict_deaths FOR SELECT USING (true);

-- Service role insert policies
CREATE POLICY "Service insert" ON country_deaths FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert" ON conflict_deaths FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_country_deaths_year ON country_deaths(year);
CREATE INDEX idx_country_deaths_iso3 ON country_deaths(country_iso3);
CREATE INDEX idx_country_deaths_year_iso3 ON country_deaths(year, country_iso3);
CREATE INDEX idx_conflict_deaths_year ON conflict_deaths(year);
CREATE INDEX idx_conflict_deaths_iso3 ON conflict_deaths(country_iso3);

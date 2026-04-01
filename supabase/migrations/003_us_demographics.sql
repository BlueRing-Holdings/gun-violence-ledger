-- Gladius — US Demographics Deep Dive
-- Race, age, region, condition, and trafficking tables
-- All tables: append-only, public read, RLS enabled
-- No UPDATE. No DELETE. Ever.

-- Deaths by race/ethnicity
CREATE TABLE IF NOT EXISTS us_deaths_by_race (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  race_ethnicity TEXT NOT NULL,
  intent TEXT NOT NULL, -- 'homicide', 'suicide', 'all'
  deaths INTEGER NOT NULL,
  rate_per_100k NUMERIC(6,1),
  population BIGINT,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deaths by census region / state
CREATE TABLE IF NOT EXISTS us_deaths_by_region (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  state TEXT,
  state_fips TEXT,
  census_division TEXT NOT NULL,
  census_region TEXT,
  urban_rural TEXT NOT NULL, -- 'metro', 'rural', 'fringe'
  intent TEXT NOT NULL, -- 'homicide', 'suicide', 'all'
  deaths INTEGER NOT NULL,
  rate_per_100k NUMERIC(6,1),
  population BIGINT,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deaths by age group
CREATE TABLE IF NOT EXISTS us_deaths_by_age (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  age_group TEXT NOT NULL,
  intent TEXT NOT NULL DEFAULT 'all',
  deaths INTEGER NOT NULL,
  rate_per_100k NUMERIC(6,1),
  population BIGINT,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deaths by condition / context
CREATE TABLE IF NOT EXISTS us_deaths_by_condition (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  condition_type TEXT NOT NULL,
  deaths INTEGER,
  incidents INTEGER,
  children_involved BOOLEAN,
  notes TEXT,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interstate gun trafficking traces
CREATE TABLE IF NOT EXISTS us_gun_trafficking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  destination_state TEXT,
  origin_state TEXT,
  trace_count INTEGER,
  pct_out_of_state NUMERIC(5,2),
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE us_deaths_by_race ENABLE ROW LEVEL SECURITY;
ALTER TABLE us_deaths_by_region ENABLE ROW LEVEL SECURITY;
ALTER TABLE us_deaths_by_age ENABLE ROW LEVEL SECURITY;
ALTER TABLE us_deaths_by_condition ENABLE ROW LEVEL SECURITY;
ALTER TABLE us_gun_trafficking ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read" ON us_deaths_by_race FOR SELECT USING (true);
CREATE POLICY "Public read" ON us_deaths_by_region FOR SELECT USING (true);
CREATE POLICY "Public read" ON us_deaths_by_age FOR SELECT USING (true);
CREATE POLICY "Public read" ON us_deaths_by_condition FOR SELECT USING (true);
CREATE POLICY "Public read" ON us_gun_trafficking FOR SELECT USING (true);

-- Service role insert policies
CREATE POLICY "Service insert" ON us_deaths_by_race FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert" ON us_deaths_by_region FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert" ON us_deaths_by_age FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert" ON us_deaths_by_condition FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert" ON us_gun_trafficking FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_race_year ON us_deaths_by_race(year);
CREATE INDEX idx_race_ethnicity ON us_deaths_by_race(race_ethnicity);
CREATE INDEX idx_race_year_ethnicity ON us_deaths_by_race(year, race_ethnicity);

CREATE INDEX idx_region_year ON us_deaths_by_region(year);
CREATE INDEX idx_region_division ON us_deaths_by_region(census_division);
CREATE INDEX idx_region_year_division ON us_deaths_by_region(year, census_division);

CREATE INDEX idx_age_year ON us_deaths_by_age(year);
CREATE INDEX idx_age_group ON us_deaths_by_age(age_group);
CREATE INDEX idx_age_year_group ON us_deaths_by_age(year, age_group);

CREATE INDEX idx_condition_year ON us_deaths_by_condition(year);
CREATE INDEX idx_condition_type ON us_deaths_by_condition(condition_type);

CREATE INDEX idx_trafficking_year ON us_gun_trafficking(year);
CREATE INDEX idx_trafficking_dest ON us_gun_trafficking(destination_state);

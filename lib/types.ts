// === GLOBAL (WHO) ===

export interface CountryRecord {
  id: string;
  year: number;
  country_name: string;
  country_iso3: string;
  deaths: number | null;
  population: number | null;
  rate_per_100k: number | null;
  data_reported: boolean;
  source: string;
  source_url: string;
  ingested_at: string;
}

// === US (CDC WONDER) ===

export interface AnnualRecord {
  id: string;
  year: number;
  deaths: number;
  population: number | null;
  rate_per_100k: number | null;
  source: string;
  source_url: string;
  ingested_at: string;
}

export interface DailyYTD {
  id: string;
  date: string;
  total_incidents: number;
  total_deaths: number;
  total_injuries: number;
  source: string;
  source_url: string;
  ingested_at: string;
}

export interface StateRecord {
  id: string;
  year: number;
  state: string;
  state_fips: string;
  deaths: number;
  population: number | null;
  rate_per_100k: number | null;
  source: string;
  source_url: string;
  ingested_at: string;
}

export interface DemographicRecord {
  id: string;
  year: number;
  category: string;
  group_name: string;
  deaths: number;
  rate_per_100k: number | null;
  source: string;
  source_url: string;
  ingested_at: string;
}

// === CONFLICTS (UCDP) ===

export interface ConflictRecord {
  id: string;
  year: number;
  conflict_name: string;
  country_name: string;
  country_iso3: string;
  deaths_total: number;
  deaths_firearms: number | null;
  conflict_type: string; // "state-based" | "non-state" | "one-sided"
  source: string;
  source_url: string;
  ingested_at: string;
}

// === ECONOMIC ===

export interface EconomicCost {
  id: string;
  year: number;
  scope: string; // "global" | "united_states" | country_iso3
  category: string;
  amount_usd: number;
  description: string;
  source: string;
  source_url: string;
  ingested_at: string;
}

// === POLICY ===

export interface PolicyEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  country_name: string;
  country_iso3: string;
  event_type: string; // "mass_shooting" | "legislation" | "court_ruling" | "executive_action" | "treaty"
  deaths: number | null;
  policy_outcome: string | null;
  source: string;
  source_url: string;
  ingested_at: string;
}

// === AUDIT ===

export interface AuditEvent {
  id: string;
  event_type: string;
  description: string;
  record_count: number | null;
  checksum: string | null;
  created_at: string;
}

// === LEDGER SNAPSHOT ===

export interface LedgerSnapshot {
  total_records: number;
  country_records: number;
  us_annual_records: number;
  us_daily_records: number;
  conflict_records: number;
  countries_reporting: number;
  countries_gap: number;
  last_ingestion: string | null;
  checksum: string | null;
}

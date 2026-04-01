/**
 * Ingest WHO Global Health Observatory homicide mortality data.
 *
 * WHO GHO API:
 *   VIOLENCE_HOMICIDERATE — homicide rate per 100k by country (2000–2021)
 *   VIOLENCE_HOMICIDENUM  — homicide count by country (2000–2019)
 *   DIMENSION/COUNTRY     — country code → name mapping
 *
 * No API key required. Public REST API.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/ingest-who.ts
 */

import { createClient } from "@supabase/supabase-js";

// ISO 3166-1 alpha-3 codes for all 193 UN member states
const ALL_UN_COUNTRIES = [
  "AFG","ALB","DZA","AND","AGO","ATG","ARG","ARM","AUS","AUT","AZE","BHS","BHR","BGD",
  "BRB","BLR","BEL","BLZ","BEN","BTN","BOL","BIH","BWA","BRA","BRN","BGR","BFA","BDI",
  "CPV","KHM","CMR","CAN","CAF","TCD","CHL","CHN","COL","COM","COG","COD","CRI","CIV",
  "HRV","CUB","CYP","CZE","DNK","DJI","DMA","DOM","ECU","EGY","SLV","GNQ","ERI","EST",
  "SWZ","ETH","FJI","FIN","FRA","GAB","GMB","GEO","DEU","GHA","GRC","GRD","GTM","GIN",
  "GNB","GUY","HTI","HND","HUN","ISL","IND","IDN","IRN","IRQ","IRL","ISR","ITA","JAM",
  "JPN","JOR","KAZ","KEN","KIR","PRK","KOR","KWT","KGZ","LAO","LVA","LBN","LSO","LBR",
  "LBY","LIE","LTU","LUX","MDG","MWI","MYS","MDV","MLI","MLT","MHL","MRT","MUS","MEX",
  "FSM","MDA","MCO","MNG","MNE","MAR","MOZ","MMR","NAM","NRU","NPL","NLD","NZL","NIC",
  "NER","NGA","MKD","NOR","OMN","PAK","PLW","PAN","PNG","PRY","PER","PHL","POL","PRT",
  "QAT","ROU","RUS","RWA","KNA","LCA","VCT","WSM","SMR","STP","SAU","SEN","SRB","SYC",
  "SLE","SGP","SVK","SVN","SLB","SOM","ZAF","SSD","ESP","LKA","SDN","SUR","SWE","CHE",
  "SYR","TJK","TZA","THA","TLS","TGO","TON","TTO","TUN","TUR","TKM","TUV","UGA","UKR",
  "ARE","GBR","USA","URY","UZB","VUT","VEN","VNM","YEM","ZMB","ZWE",
];

interface WHORateRecord {
  SpatialDimType: string;
  SpatialDim: string;
  Dim1: string;
  TimeDim: number;
  NumericValue: number | null;
  Low: number | null;
  High: number | null;
}

interface WHOCountRecord {
  SpatialDimType: string;
  SpatialDim: string;
  Dim1: string;
  TimeDim: number;
  NumericValue: number | null;
}

interface WHOCountryDim {
  Code: string;
  Title: string;
}

const GHO_BASE = "https://ghoapi.azureedge.net/api";
const SOURCE = "WHO GHO";
const SOURCE_URL = "https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/violence-prevention";

async function fetchJSON<T>(url: string): Promise<T[]> {
  console.log(`  Fetching: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const data = await res.json();
  return data.value ?? [];
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  // ── Step 1: Fetch country name mapping ──
  console.log("\n[1/5] Fetching country names from WHO...");
  const countryDims = await fetchJSON<WHOCountryDim>(
    `${GHO_BASE}/DIMENSION/COUNTRY/DimensionValues`
  );
  const countryNames: Record<string, string> = {};
  for (const c of countryDims) {
    countryNames[c.Code] = c.Title;
  }
  console.log(`  → ${Object.keys(countryNames).length} country names loaded.`);

  // ── Step 2: Fetch homicide RATES (per 100k) ──
  console.log("\n[2/5] Fetching homicide rates (VIOLENCE_HOMICIDERATE)...");
  const rateRecords = await fetchJSON<WHORateRecord>(
    `${GHO_BASE}/VIOLENCE_HOMICIDERATE`
  );

  // Filter: country-level, both sexes only
  const ratesBTSX = rateRecords.filter(
    (r) => r.SpatialDimType === "COUNTRY" && r.Dim1 === "SEX_BTSX"
  );
  console.log(`  → ${ratesBTSX.length} both-sex country rate records.`);

  // ── Step 3: Fetch homicide COUNTS ──
  console.log("\n[3/5] Fetching homicide counts (VIOLENCE_HOMICIDENUM)...");
  const countRecords = await fetchJSON<WHOCountRecord>(
    `${GHO_BASE}/VIOLENCE_HOMICIDENUM`
  );

  const countsBTSX = countRecords.filter(
    (r) => r.SpatialDimType === "COUNTRY" && r.Dim1 === "SEX_BTSX"
  );
  console.log(`  → ${countsBTSX.length} both-sex country count records.`);

  // Build a lookup: (iso3, year) → deaths count
  const deathsLookup: Record<string, number> = {};
  for (const c of countsBTSX) {
    if (c.NumericValue != null) {
      deathsLookup[`${c.SpatialDim}_${c.TimeDim}`] = Math.round(c.NumericValue);
    }
  }

  // ── Step 4: Merge and insert ──
  console.log("\n[4/5] Inserting into country_deaths...");

  // Build rows from rate records (rates have the widest year coverage: 2000–2021)
  const rows: Array<{
    year: number;
    country_name: string;
    country_iso3: string;
    deaths: number | null;
    rate_per_100k: number | null;
    data_reported: boolean;
    source: string;
    source_url: string;
  }> = [];

  // Track which (iso3, year) combos we have data for
  const reportedSet = new Set<string>();

  for (const r of ratesBTSX) {
    const iso3 = r.SpatialDim;
    const year = r.TimeDim;
    const name = countryNames[iso3] ?? iso3;
    const rate = r.NumericValue != null ? Math.round(r.NumericValue * 10) / 10 : null;
    const deaths = deathsLookup[`${iso3}_${year}`] ?? null;

    rows.push({
      year,
      country_name: name,
      country_iso3: iso3,
      deaths,
      rate_per_100k: rate,
      data_reported: true,
      source: SOURCE,
      source_url: SOURCE_URL,
    });

    reportedSet.add(`${iso3}_${year}`);
  }

  console.log(`  → ${rows.length} reporting records prepared.`);

  // ── Step 5: Build gap entries for most recent year ──
  // Find the latest year in the rate data
  const allYears = ratesBTSX.map((r) => r.TimeDim);
  const latestYear = Math.max(...allYears);
  console.log(`  Latest WHO year: ${latestYear}`);

  let gapCount = 0;
  for (const iso3 of ALL_UN_COUNTRIES) {
    const key = `${iso3}_${latestYear}`;
    if (!reportedSet.has(key)) {
      rows.push({
        year: latestYear,
        country_name: countryNames[iso3] ?? iso3,
        country_iso3: iso3,
        deaths: null,
        rate_per_100k: null,
        data_reported: false,
        source: SOURCE,
        source_url: SOURCE_URL,
      });
      gapCount++;
    }
  }

  console.log(`  → ${gapCount} gap entries for ${latestYear}.`);

  // Insert in batches of 500
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("country_deaths").insert(batch);
    if (error) {
      console.error(`  Insert error at batch ${i}: ${error.message}`);
      process.exit(1);
    }
    inserted += batch.length;
    process.stdout.write(`\r  Inserted ${inserted}/${rows.length}...`);
  }
  console.log(`\n  → ${inserted} total records inserted.`);

  // ── Audit log ──
  const reportingCountries = new Set(
    ratesBTSX.filter((r) => r.TimeDim === latestYear).map((r) => r.SpatialDim)
  ).size;

  await supabase.from("audit_events").insert({
    event_type: "ingestion",
    description: `WHO GHO homicide data ingested: ${inserted} records (${Math.min(...allYears)}–${latestYear}), ${reportingCountries} countries reporting, ${gapCount} gap entries`,
    record_count: inserted,
  });

  console.log(`\nDone. ${reportingCountries} countries reporting, ${gapCount} gaps.`);
}

main();

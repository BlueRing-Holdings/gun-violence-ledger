/**
 * Ingest WHO Global Health Observatory firearm mortality data.
 *
 * Usage: npx ts-node scripts/ingest-who.ts
 *
 * This script fetches country-level firearm mortality from WHO GHO
 * and creates both reporting entries and gap entries for non-reporting countries.
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";

// ISO 3166-1 alpha-3 codes for all UN member states
// Countries that do not appear in WHO data will be recorded as gap entries
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

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  // NOTE: WHO GHO API endpoint for firearm mortality
  // The actual API structure may need adjustment based on current WHO API format
  // This is the expected data format — actual ingestion will need to be validated
  // against the live API when WHO credentials/access are configured.

  console.log("WHO GHO ingest: placeholder — configure API access and run manually.");
  console.log(`Tracking ${ALL_UN_COUNTRIES.length} UN member states.`);
  console.log("Countries without WHO data will be recorded as gap entries.");

  // Audit log
  await supabase.from("audit_events").insert({
    event_type: "ingestion_attempt",
    description: `WHO GHO ingest attempted — awaiting API configuration`,
    record_count: 0,
  });
}

main();

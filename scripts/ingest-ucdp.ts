/**
 * Ingest UCDP (Uppsala Conflict Data Program) conflict-related deaths.
 *
 * Data source: UCDP CSV downloads v25.1
 *   - Battle-related deaths (state-based): BattleDeaths_v25_1.csv
 *   - Non-state violence:                  NonState_v25_1.csv
 *   - One-sided violence:                  OneSided_v25_1.csv
 *
 * Download from: https://ucdp.uu.se/downloads/
 * License: CC BY 4.0
 *
 * UCDP uses Gleditsch-Ward (GW) country codes — mapped to ISO 3166-1 alpha-3.
 * Deaths breakdown by weapon type is not available; deaths_firearms = null.
 *
 * Usage:
 *   # First download CSVs to /tmp/ucdp-data/:
 *   curl -sL https://ucdp.uu.se/downloads/brd/ucdp-brd-dyadic-251-csv.zip -o /tmp/ucdp-data/brd.zip && unzip -o /tmp/ucdp-data/brd.zip -d /tmp/ucdp-data/
 *   curl -sL https://ucdp.uu.se/downloads/nsos/ucdp-nonstate-251-csv.zip -o /tmp/ucdp-data/nonstate.zip && unzip -o /tmp/ucdp-data/nonstate.zip -d /tmp/ucdp-data/
 *   curl -sL https://ucdp.uu.se/downloads/nsos/ucdp-onesided-251-csv.zip -o /tmp/ucdp-data/onesided.zip && unzip -o /tmp/ucdp-data/onesided.zip -d /tmp/ucdp-data/
 *
 *   # Then run:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/ingest-ucdp.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// ── Gleditsch-Ward → ISO 3166-1 alpha-3 mapping ──
const GW_TO_ISO3: Record<number, string> = {
  2:"USA",20:"CAN",31:"BHS",40:"CUB",41:"HTI",42:"DOM",51:"JAM",52:"TTO",
  53:"BRB",54:"DMA",55:"GRD",56:"LCA",57:"VCT",58:"ATG",60:"KNA",70:"MEX",
  80:"BLZ",90:"GTM",91:"HND",92:"SLV",93:"NIC",94:"CRI",95:"PAN",100:"COL",
  101:"VEN",110:"GUY",115:"SUR",130:"ECU",135:"PER",140:"BRA",145:"BOL",
  150:"PRY",155:"CHL",160:"ARG",165:"URY",200:"GBR",205:"IRL",210:"NLD",
  211:"BEL",212:"LUX",220:"FRA",225:"CHE",230:"ESP",235:"PRT",255:"DEU",
  260:"DEU",265:"DEU",290:"POL",305:"AUT",310:"HUN",315:"CZE",316:"CZE",
  317:"SVK",325:"ITA",331:"SMR",338:"MLT",339:"ALB",341:"MNE",343:"MKD",
  344:"HRV",345:"SRB",346:"BIH",347:"XKX",349:"SVN",350:"GRC",352:"CYP",
  355:"BGR",359:"MDA",360:"ROU",365:"RUS",366:"EST",367:"LVA",368:"LTU",
  369:"UKR",370:"BLR",371:"ARM",372:"GEO",373:"AZE",375:"FIN",380:"SWE",
  385:"NOR",390:"DNK",395:"ISL",402:"CPV",403:"STP",404:"GNB",411:"GNQ",
  420:"GMB",432:"MLI",433:"SEN",434:"BEN",435:"MRT",436:"NER",437:"CIV",
  438:"GIN",439:"BFA",450:"LBR",451:"SLE",452:"GHA",461:"TGO",471:"CMR",
  475:"NGA",481:"GAB",482:"CAF",483:"TCD",484:"COG",490:"COD",500:"UGA",
  501:"KEN",510:"TZA",516:"BDI",517:"RWA",520:"SOM",522:"DJI",530:"ETH",
  531:"ERI",540:"AGO",541:"MOZ",551:"ZMB",552:"ZWE",553:"MWI",560:"ZAF",
  565:"NAM",570:"LSO",571:"BWA",572:"SWZ",580:"MDG",581:"COM",590:"MUS",
  591:"SYC",600:"MAR",615:"DZA",616:"TUN",620:"LBY",625:"SDN",626:"SSD",
  630:"IRN",640:"TUR",645:"IRQ",651:"EGY",652:"SYR",660:"LBN",663:"JOR",
  666:"ISR",670:"SAU",678:"YEM",679:"YEM",680:"YEM",690:"KWT",692:"BHR",
  694:"QAT",696:"ARE",698:"OMN",700:"AFG",701:"TKM",702:"TJK",703:"KGZ",
  704:"UZB",705:"KAZ",710:"CHN",711:"TWN",712:"MNG",713:"TWN",730:"KOR",
  731:"PRK",740:"JPN",750:"IND",760:"BTN",770:"PAK",771:"BGD",775:"MMR",
  780:"LKA",781:"MDV",790:"NPL",800:"THA",811:"KHM",812:"LAO",816:"VNM",
  817:"VNM",820:"MYS",830:"SGP",835:"BRN",840:"PHL",850:"IDN",860:"TLS",
  900:"AUS",910:"PNG",920:"NZL",935:"VUT",940:"SLB",946:"KIR",947:"TUV",
  950:"FJI",955:"TON",970:"NRU",971:"MHL",972:"PLW",973:"FSM",983:"WSM",
};

const SOURCE = "UCDP";
const SOURCE_URL = "https://ucdp.uu.se/";
const CSV_DIR = "/tmp/ucdp-data";

interface Row {
  year: number;
  conflict_name: string;
  country_name: string;
  country_iso3: string;
  deaths_total: number;
  deaths_firearms: null;
  conflict_type: string;
  source: string;
  source_url: string;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { vals.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    vals.push(current.trim());
    const rec: Record<string, string> = {};
    for (let j = 0; j < headers.length && j < vals.length; j++) {
      rec[headers[j]] = vals[j];
    }
    records.push(rec);
  }
  return records;
}

function gwToISO3(gwStr: string, location: string): string {
  const gw = parseInt(gwStr, 10);
  if (isNaN(gw)) return "UNK";
  return GW_TO_ISO3[gw] ?? "UNK";
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const rows: Row[] = [];

  // ── 1. Battle-related deaths (state-based) ──
  console.log("\n[1/3] Parsing battle-related deaths...");
  const brdPath = `${CSV_DIR}/BattleDeaths_v25_1.csv`;
  if (!fs.existsSync(brdPath)) {
    console.error(`File not found: ${brdPath}`);
    console.error("Download first: curl -sL https://ucdp.uu.se/downloads/brd/ucdp-brd-dyadic-251-csv.zip ...");
    process.exit(1);
  }

  const brdRecords = parseCSV(fs.readFileSync(brdPath, "utf-8"));
  console.log(`  → ${brdRecords.length} raw battle-death records.`);

  for (const r of brdRecords) {
    const deaths = parseInt(r.bd_best, 10);
    if (isNaN(deaths) || deaths <= 0) continue;

    const typeNum = parseInt(r.type_of_conflict, 10);
    // All battle deaths are state-based armed conflicts
    rows.push({
      year: parseInt(r.year, 10),
      conflict_name: r.location_inc || r.territory_name || "Unknown",
      country_name: r.battle_location || r.location_inc || "Unknown",
      country_iso3: gwToISO3(r.gwno_loc || r.gwno_battle, r.location_inc),
      deaths_total: deaths,
      deaths_firearms: null,
      conflict_type: "state-based",
      source: SOURCE,
      source_url: SOURCE_URL,
    });
  }

  // ── 2. Non-state violence ──
  console.log("\n[2/3] Parsing non-state violence...");
  const nsPath = `${CSV_DIR}/NonState_v25_1.csv`;
  if (!fs.existsSync(nsPath)) {
    console.error(`File not found: ${nsPath}`);
    process.exit(1);
  }

  const nsRecords = parseCSV(fs.readFileSync(nsPath, "utf-8"));
  console.log(`  → ${nsRecords.length} raw non-state records.`);

  for (const r of nsRecords) {
    const deaths = parseInt(r.best_fatality_estimate, 10);
    if (isNaN(deaths) || deaths <= 0) continue;

    rows.push({
      year: parseInt(r.year, 10),
      conflict_name: r.side_a_name || r.conflict_id || "Unknown",
      country_name: r.location || "Unknown",
      country_iso3: gwToISO3(r.gwno_location, r.location),
      deaths_total: deaths,
      deaths_firearms: null,
      conflict_type: "non-state",
      source: SOURCE,
      source_url: SOURCE_URL,
    });
  }

  // ── 3. One-sided violence ──
  console.log("\n[3/3] Parsing one-sided violence...");
  const osPath = `${CSV_DIR}/OneSided_v25_1.csv`;
  if (!fs.existsSync(osPath)) {
    console.error(`File not found: ${osPath}`);
    process.exit(1);
  }

  const osRecords = parseCSV(fs.readFileSync(osPath, "utf-8"));
  console.log(`  → ${osRecords.length} raw one-sided records.`);

  for (const r of osRecords) {
    const deaths = parseInt(r.best_fatality_estimate, 10);
    if (isNaN(deaths) || deaths <= 0) continue;

    rows.push({
      year: parseInt(r.year, 10),
      conflict_name: r.actor_name || "Unknown",
      country_name: r.location || "Unknown",
      country_iso3: gwToISO3(r.gwno_location || r.gwnoa, r.location),
      deaths_total: deaths,
      deaths_firearms: null,
      conflict_type: "one-sided",
      source: SOURCE,
      source_url: SOURCE_URL,
    });
  }

  console.log(`\nTotal rows to insert: ${rows.length}`);

  // ── Insert in batches ──
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("conflict_deaths").insert(batch);
    if (error) {
      console.error(`Insert error at batch ${i}: ${error.message}`);
      process.exit(1);
    }
    inserted += batch.length;
    process.stdout.write(`\r  Inserted ${inserted}/${rows.length}...`);
  }

  console.log(`\n  → ${inserted} records inserted into conflict_deaths.`);

  // ── Audit ──
  const years = rows.map((r) => r.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const countries = Array.from(new Set(rows.map((r) => r.country_iso3))).length;

  await supabase.from("audit_events").insert({
    event_type: "ingestion",
    description: `UCDP v25.1 conflict deaths ingested: ${inserted} records (${minYear}–${maxYear}), ${countries} countries, 3 types (state-based, non-state, one-sided)`,
    record_count: inserted,
  });

  console.log(`Done. ${inserted} records across ${countries} countries (${minYear}–${maxYear}).`);
}

main();

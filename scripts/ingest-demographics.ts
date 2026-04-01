/**
 * Ingest US demographics data from data/us-demographics.json into Supabase.
 *
 * Usage: npx ts-node scripts/ingest-demographics.ts
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

interface RaceRecord {
  year: number;
  race_ethnicity: string;
  intent: string;
  deaths: number;
  rate_per_100k: number;
  population: number;
  source: string;
  source_url: string;
}

interface AgeRecord {
  year: number;
  age_group: string;
  intent: string;
  deaths: number;
  rate_per_100k: number;
  population: number;
  source: string;
  source_url: string;
}

interface RegionRecord {
  year: number;
  census_division: string;
  urban_rural: string;
  intent: string;
  deaths: number;
  rate_per_100k: number;
  source: string;
  source_url: string;
}

interface ConditionRecord {
  year: number;
  condition_type: string;
  deaths: number | null;
  incidents: number | null;
  children_involved: boolean | null;
  notes: string | null;
  source: string;
  source_url: string;
}

interface DemographicsData {
  race: RaceRecord[];
  age: AgeRecord[];
  region: RegionRecord[];
  conditions: ConditionRecord[];
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const dataPath = new URL("../data/us-demographics.json", import.meta.url).pathname;
  const raw = fs.readFileSync(dataPath, "utf-8");
  const data: DemographicsData = JSON.parse(raw);

  let totalInserted = 0;

  // Race
  console.log(`Ingesting ${data.race.length} race/ethnicity records...`);
  const { error: raceErr } = await supabase.from("us_deaths_by_race").insert(data.race);
  if (raceErr) {
    console.error("Race insert error:", raceErr.message);
    process.exit(1);
  }
  totalInserted += data.race.length;

  // Age
  console.log(`Ingesting ${data.age.length} age group records...`);
  const { error: ageErr } = await supabase.from("us_deaths_by_age").insert(data.age);
  if (ageErr) {
    console.error("Age insert error:", ageErr.message);
    process.exit(1);
  }
  totalInserted += data.age.length;

  // Region
  console.log(`Ingesting ${data.region.length} region records...`);
  const { error: regionErr } = await supabase.from("us_deaths_by_region").insert(data.region);
  if (regionErr) {
    console.error("Region insert error:", regionErr.message);
    process.exit(1);
  }
  totalInserted += data.region.length;

  // Conditions
  console.log(`Ingesting ${data.conditions.length} condition records...`);
  const { error: condErr } = await supabase.from("us_deaths_by_condition").insert(data.conditions);
  if (condErr) {
    console.error("Condition insert error:", condErr.message);
    process.exit(1);
  }
  totalInserted += data.conditions.length;

  // Audit log
  await supabase.from("audit_events").insert({
    event_type: "ingestion",
    description: `US demographics data ingested: ${totalInserted} records (race: ${data.race.length}, age: ${data.age.length}, region: ${data.region.length}, conditions: ${data.conditions.length})`,
    record_count: totalInserted,
  });

  console.log(`Done. ${totalInserted} total records inserted across 4 tables.`);
}

main();

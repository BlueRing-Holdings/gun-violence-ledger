/**
 * Ingest CDC annual death data from data/cdc-annual.json into Supabase.
 *
 * Usage: npx ts-node scripts/ingest-cdc.ts
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const dataPath = new URL("../data/cdc-annual.json", import.meta.url).pathname;
  const raw = fs.readFileSync(dataPath, "utf-8");
  const records: Array<{
    year: number;
    deaths: number;
    source: string;
    source_url: string;
  }> = JSON.parse(raw);

  console.log(`Ingesting ${records.length} annual records...`);

  const { data, error } = await supabase.from("annual_deaths").insert(records);

  if (error) {
    console.error("Insert error:", error.message);
    process.exit(1);
  }

  // Audit log
  await supabase.from("audit_events").insert({
    event_type: "ingestion",
    description: `CDC WONDER annual data ingested: ${records.length} records (${records[0].year}–${records[records.length - 1].year})`,
    record_count: records.length,
  });

  console.log(`Done. ${records.length} records inserted.`);
}

main();

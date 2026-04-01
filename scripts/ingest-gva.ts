/**
 * Ingest Gun Violence Archive daily YTD summary.
 *
 * Usage: npx ts-node scripts/ingest-gva.ts
 *
 * This script fetches the current YTD totals from gunviolencearchive.org
 * and appends a daily snapshot to the daily_ytd table.
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  // Fetch the GVA homepage for YTD stats
  const res = await fetch("https://www.gunviolencearchive.org/");
  if (!res.ok) {
    console.error(`GVA fetch failed: ${res.status}`);
    process.exit(1);
  }

  const html = await res.text();

  // Parse totals from the homepage HTML
  // GVA displays stats in a specific format — extract with regex
  const deathsMatch = html.match(/Deaths<\/span>\s*<span[^>]*>([\d,]+)/i);
  const injuriesMatch = html.match(/Injuries<\/span>\s*<span[^>]*>([\d,]+)/i);
  const incidentsMatch = html.match(/Incidents<\/span>\s*<span[^>]*>([\d,]+)/i);

  const deaths = deathsMatch ? parseInt(deathsMatch[1].replace(/,/g, ""), 10) : null;
  const injuries = injuriesMatch ? parseInt(injuriesMatch[1].replace(/,/g, ""), 10) : null;
  const incidents = incidentsMatch ? parseInt(incidentsMatch[1].replace(/,/g, ""), 10) : null;

  if (deaths === null) {
    console.error("Could not parse death count from GVA homepage");
    process.exit(1);
  }

  const today = new Date().toISOString().split("T")[0];

  console.log(`GVA ${today}: ${incidents ?? "?"} incidents, ${deaths} deaths, ${injuries ?? "?"} injuries`);

  const { error } = await supabase.from("daily_ytd").insert({
    date: today,
    total_incidents: incidents ?? 0,
    total_deaths: deaths,
    total_injuries: injuries ?? 0,
    source: "Gun Violence Archive",
    source_url: "https://www.gunviolencearchive.org/",
  });

  if (error) {
    console.error("Insert error:", error.message);
    process.exit(1);
  }

  // Audit log
  await supabase.from("audit_events").insert({
    event_type: "ingestion",
    description: `GVA daily YTD snapshot: ${deaths} deaths, ${injuries ?? 0} injuries, ${incidents ?? 0} incidents (${today})`,
    record_count: 1,
  });

  console.log("Done.");
}

main();

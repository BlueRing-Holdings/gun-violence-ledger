export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();

  // US latest year
  const { data: usLatest } = await supabase
    .from("annual_deaths")
    .select("year, deaths")
    .order("year", { ascending: false })
    .limit(1)
    .single();

  // US cumulative
  const { data: usCumRows } = await supabase.from("annual_deaths").select("deaths");
  const usCumulative = usCumRows?.reduce((s: number, r: { deaths: number }) => s + r.deaths, 0) ?? 0;

  // Global latest year from WHO
  const { data: globalLatest } = await supabase
    .from("country_deaths")
    .select("year")
    .eq("data_reported", true)
    .order("year", { ascending: false })
    .limit(1)
    .single();

  const globalYear = globalLatest?.year ?? null;
  let globalDeaths = 0;
  let countriesReporting = 0;
  let countriesGap = 0;

  if (globalYear) {
    const { data: globalRows } = await supabase
      .from("country_deaths")
      .select("deaths, data_reported")
      .eq("year", globalYear);

    for (const row of globalRows ?? []) {
      if (row.data_reported) {
        countriesReporting++;
        globalDeaths += row.deaths ?? 0;
      } else {
        countriesGap++;
      }
    }
  }

  // Total records across all tables
  const counts = await Promise.all([
    supabase.from("country_deaths").select("*", { count: "exact", head: true }),
    supabase.from("annual_deaths").select("*", { count: "exact", head: true }),
    supabase.from("daily_ytd").select("*", { count: "exact", head: true }),
    supabase.from("conflict_deaths").select("*", { count: "exact", head: true }),
    supabase.from("economic_costs").select("*", { count: "exact", head: true }),
    supabase.from("policy_events").select("*", { count: "exact", head: true }),
  ]);

  const totalRecords = counts.reduce((s, c) => s + (c.count ?? 0), 0);

  // Last audit
  const { data: lastAudit } = await supabase
    .from("audit_events")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({
    global_deaths_latest_year: globalYear,
    global_deaths_latest: globalDeaths || null,
    us_deaths_latest_year: usLatest?.year ?? null,
    us_deaths_latest: usLatest?.deaths ?? null,
    us_cumulative: usCumulative || null,
    countries_reporting: countriesReporting,
    countries_gap: countriesGap,
    total_records: totalRecords,
    last_ingestion: lastAudit?.created_at ?? null,
  });
}

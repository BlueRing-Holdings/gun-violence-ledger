export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

async function countTable(supabase: ReturnType<typeof getSupabase>, table: string): Promise<number> {
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

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

  // Global latest year from WHO (rates — widest coverage)
  const { data: globalLatest } = await supabase
    .from("country_deaths")
    .select("year")
    .eq("data_reported", true)
    .order("year", { ascending: false })
    .limit(1)
    .single();

  const globalYear = globalLatest?.year ?? null;
  let countriesReporting = 0;
  let countriesGap = 0;

  if (globalYear) {
    const { data: globalRows } = await supabase
      .from("country_deaths")
      .select("data_reported")
      .eq("year", globalYear);

    for (const row of globalRows ?? []) {
      if (row.data_reported) countriesReporting++;
      else countriesGap++;
    }
  }

  // Global deaths sum — use latest year that has actual death counts
  // (WHO HOMICIDENUM lags behind HOMICIDERATE by ~2 years)
  let globalDeaths = 0;
  let globalDeathsYear: number | null = null;

  const { data: deathsLatest } = await supabase
    .from("country_deaths")
    .select("year")
    .not("deaths", "is", null)
    .order("year", { ascending: false })
    .limit(1)
    .single();

  if (deathsLatest?.year) {
    globalDeathsYear = deathsLatest.year;
    const { data: deathRows } = await supabase
      .from("country_deaths")
      .select("deaths")
      .eq("year", deathsLatest.year)
      .not("deaths", "is", null);

    for (const row of deathRows ?? []) {
      globalDeaths += row.deaths ?? 0;
    }
  }

  // Total records across all tables
  const [countryCount, annualCount, dailyCount, conflictCount, costCount, policyCount] =
    await Promise.all([
      countTable(supabase, "country_deaths"),
      countTable(supabase, "annual_deaths"),
      countTable(supabase, "daily_ytd"),
      countTable(supabase, "conflict_deaths"),
      countTable(supabase, "economic_costs"),
      countTable(supabase, "policy_events"),
    ]);

  const totalRecords = countryCount + annualCount + dailyCount + conflictCount + costCount + policyCount;

  // Last audit
  const { data: lastAudit } = await supabase
    .from("audit_events")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({
    global_deaths_latest_year: globalDeathsYear,
    global_deaths_latest: globalDeaths || null,
    global_rates_year: globalYear,
    us_deaths_latest_year: usLatest?.year ?? null,
    us_deaths_latest: usLatest?.deaths ?? null,
    us_cumulative: usCumulative || null,
    countries_reporting: countriesReporting,
    countries_gap: countriesGap,
    total_records: totalRecords,
    last_ingestion: lastAudit?.created_at ?? null,
  });
}

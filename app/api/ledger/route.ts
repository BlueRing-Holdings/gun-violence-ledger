export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

async function countTable(supabase: ReturnType<typeof getSupabase>, table: string): Promise<number> {
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function GET() {
  const supabase = getSupabase();

  // Counts
  const [countryCount, annualCount, dailyCount, conflictCount] = await Promise.all([
    countTable(supabase, "country_deaths"),
    countTable(supabase, "annual_deaths"),
    countTable(supabase, "daily_ytd"),
    countTable(supabase, "conflict_deaths"),
  ]);

  // Countries reporting vs gap — latest year
  const { data: latestRow } = await supabase
    .from("country_deaths")
    .select("year")
    .order("year", { ascending: false })
    .limit(1)
    .single();

  const latestYear = latestRow?.year ?? null;
  let countriesReporting = 0;
  let countriesGap = 0;

  if (latestYear) {
    const { data: yearRows } = await supabase
      .from("country_deaths")
      .select("data_reported")
      .eq("year", latestYear);

    for (const row of yearRows ?? []) {
      if (row.data_reported) countriesReporting++;
      else countriesGap++;
    }
  }

  // Last audit
  const { data: lastAudit } = await supabase
    .from("audit_events")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Recent audits
  const { data: audits } = await supabase
    .from("audit_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  const totalRecords = countryCount + annualCount + dailyCount + conflictCount;

  return NextResponse.json({
    snapshot: {
      total_records: totalRecords,
      country_records: countryCount,
      us_annual_records: annualCount,
      us_daily_records: dailyCount,
      conflict_records: conflictCount,
      countries_reporting: countriesReporting,
      countries_gap: countriesGap,
      last_ingestion: lastAudit?.created_at ?? null,
      checksum: null,
    },
    audits: audits ?? [],
  });
}

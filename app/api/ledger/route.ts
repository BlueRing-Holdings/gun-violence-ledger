export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();

  // Counts
  const [countryRes, annualRes, dailyRes, conflictRes] = await Promise.all([
    supabase.from("country_deaths").select("*", { count: "exact", head: true }),
    supabase.from("annual_deaths").select("*", { count: "exact", head: true }),
    supabase.from("daily_ytd").select("*", { count: "exact", head: true }),
    supabase.from("conflict_deaths").select("*", { count: "exact", head: true }),
  ]);

  // Countries reporting vs gap
  const { data: countryRows } = await supabase
    .from("country_deaths")
    .select("data_reported, year")
    .order("year", { ascending: false });

  // Get latest year
  const latestYear = countryRows?.[0]?.year ?? null;
  let countriesReporting = 0;
  let countriesGap = 0;
  if (latestYear) {
    for (const row of countryRows ?? []) {
      if (row.year !== latestYear) continue;
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

  const totalRecords =
    (countryRes.count ?? 0) + (annualRes.count ?? 0) + (dailyRes.count ?? 0) + (conflictRes.count ?? 0);

  return NextResponse.json({
    snapshot: {
      total_records: totalRecords,
      country_records: countryRes.count ?? 0,
      us_annual_records: annualRes.count ?? 0,
      us_daily_records: dailyRes.count ?? 0,
      conflict_records: conflictRes.count ?? 0,
      countries_reporting: countriesReporting,
      countries_gap: countriesGap,
      last_ingestion: lastAudit?.created_at ?? null,
      checksum: null,
    },
    audits: audits ?? [],
  });
}

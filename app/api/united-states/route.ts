export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();

  // Annual deaths
  const { data: annual } = await supabase
    .from("annual_deaths")
    .select("*")
    .order("year", { ascending: true });

  // States — latest year
  const { data: latestState } = await supabase
    .from("state_deaths")
    .select("year")
    .order("year", { ascending: false })
    .limit(1)
    .single();

  const statesYear = latestState?.year ?? null;
  let states: typeof annual = [];
  if (statesYear) {
    const { data: stateData } = await supabase
      .from("state_deaths")
      .select("*")
      .eq("year", statesYear)
      .order("rate_per_100k", { ascending: false });
    states = stateData ?? [];
  }

  // Demographics — latest year
  const { data: latestDemo } = await supabase
    .from("demographic_deaths")
    .select("year")
    .order("year", { ascending: false })
    .limit(1)
    .single();

  const demoYear = latestDemo?.year ?? null;
  const demographics: Record<string, unknown[]> = {};
  if (demoYear) {
    const { data: demoData } = await supabase
      .from("demographic_deaths")
      .select("*")
      .eq("year", demoYear)
      .order("deaths", { ascending: false });

    for (const row of demoData ?? []) {
      if (!demographics[row.category]) demographics[row.category] = [];
      demographics[row.category].push(row);
    }
  }

  return NextResponse.json({
    annual: annual ?? [],
    states: states ?? [],
    demographics,
    states_year: statesYear,
    demo_year: demoYear,
  });
}

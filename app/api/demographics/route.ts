export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();

  // Find the most recent year across the race table
  const { data: latestRow } = await supabase
    .from("us_deaths_by_race")
    .select("year")
    .order("year", { ascending: false })
    .limit(1)
    .single();

  const year = latestRow?.year ?? null;

  if (!year) {
    return NextResponse.json({ race: [], age: [], region: [], conditions: [], year: null });
  }

  // Fetch all 4 tables for the most recent year
  const [raceRes, ageRes, regionRes, condRes] = await Promise.all([
    supabase
      .from("us_deaths_by_race")
      .select("*")
      .eq("year", year)
      .order("deaths", { ascending: false }),
    supabase
      .from("us_deaths_by_age")
      .select("*")
      .eq("year", year)
      .order("age_group", { ascending: true }),
    supabase
      .from("us_deaths_by_region")
      .select("*")
      .eq("year", year)
      .order("rate_per_100k", { ascending: false }),
    supabase
      .from("us_deaths_by_condition")
      .select("*")
      .eq("year", year)
      .order("deaths", { ascending: false }),
  ]);

  return NextResponse.json({
    race: raceRes.data ?? [],
    age: ageRes.data ?? [],
    region: regionRes.data ?? [],
    conditions: condRes.data ?? [],
    year,
  });
}

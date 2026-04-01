export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();

  // Get the most recent year with country data
  const { data: latestRow } = await supabase
    .from("country_deaths")
    .select("year")
    .order("year", { ascending: false })
    .limit(1)
    .single();

  const year = latestRow?.year ?? null;

  if (!year) {
    return NextResponse.json({ records: [], year: null });
  }

  const { data, error } = await supabase
    .from("country_deaths")
    .select("*")
    .eq("year", year)
    .order("rate_per_100k", { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json({ records: [], year, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ records: data ?? [], year });
}

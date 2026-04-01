export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("economic_costs")
    .select("*")
    .order("amount_usd", { ascending: false });

  if (error) {
    return NextResponse.json({ records: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ records: data ?? [] });
}

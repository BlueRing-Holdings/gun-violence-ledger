"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/layout/PageShell";
import { AnnualRecord, StateRecord, DemographicRecord } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface USData {
  annual: AnnualRecord[];
  states: StateRecord[];
  demographics: Record<string, DemographicRecord[]>;
  states_year: number | null;
  demo_year: number | null;
}

export default function UnitedStatesPage() {
  const [data, setData] = useState<USData>({
    annual: [], states: [], demographics: {}, states_year: null, demo_year: null,
  });
  const [lang, setLang] = useState<"en" | "es">("en");
  const [tab, setTab] = useState<"timeline" | "states" | "demographics">("timeline");

  useEffect(() => {
    fetch("/api/united-states")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const totalDeaths = data.annual.reduce((s, r) => s + r.deaths, 0);
  const peakYear = data.annual.reduce(
    (max, r) => (r.deaths > (max?.deaths ?? 0) ? r : max),
    data.annual[0]
  );

  const statesSorted = [...data.states].sort((a, b) => (b.rate_per_100k ?? 0) - (a.rate_per_100k ?? 0));
  const maxRate = Math.max(...data.states.map((r) => r.rate_per_100k ?? 0), 1);

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#f2ede4] mb-2">
          {lang === "en" ? "United States" : "Estados Unidos"}
        </h1>
        <p className="text-[#6b5a45] text-sm">
          {lang === "en"
            ? "CDC WONDER annual data (1968–2024), Gun Violence Archive daily counts, state and demographic breakdowns."
            : "Datos anuales de CDC WONDER (1968–2024), conteos diarios de Gun Violence Archive, desgloses por estado y demográficos."}
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="text-xs text-[#6b5a45] hover:text-[#b8860b] transition-colors border border-[#2a2008] rounded px-3 py-1"
          >
            {lang === "en" ? "Ver en español" : "View in English"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-[#2a2008]">
        {(["timeline", "states", "demographics"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm transition-colors ${
              tab === t
                ? "text-[#b8860b] border-b-2 border-[#b8860b]"
                : "text-[#6b5a45] hover:text-[#b8860b]"
            }`}
          >
            {t === "timeline"
              ? (lang === "en" ? "Timeline 1968–2024" : "Línea de Tiempo")
              : t === "states"
              ? (lang === "en" ? "State by State" : "Estado por Estado")
              : (lang === "en" ? "Demographics" : "Demográficos")}
          </button>
        ))}
      </div>

      {/* Timeline Tab */}
      {tab === "timeline" && (
        <>
          {data.annual.length === 0 ? (
            <div className="bg-[#111108] rounded-lg p-12 text-center border border-[#2a2008]">
              <p className="text-[#6b5a45]">Awaiting data...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#111108] rounded-lg p-6 text-center border border-[#2a2008]">
                  <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">
                    {lang === "en" ? "Total Deaths" : "Total de Muertes"}
                  </p>
                  <p className="text-3xl font-serif text-[#f2ede4] tabular-nums">
                    {totalDeaths.toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#111108] rounded-lg p-6 text-center border border-[#2a2008]">
                  <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">
                    {lang === "en" ? "Years on Record" : "Años Registrados"}
                  </p>
                  <p className="text-3xl font-serif text-[#f2ede4] tabular-nums">{data.annual.length}</p>
                </div>
                <div className="bg-[#111108] rounded-lg p-6 text-center border border-[#2a2008]">
                  <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">
                    {lang === "en" ? "Peak Year" : "Año Pico"}
                  </p>
                  <p className="text-3xl font-serif text-[#f2ede4] tabular-nums">{peakYear?.year ?? "—"}</p>
                  <p className="text-xs text-[#6b5a45]">{peakYear?.deaths?.toLocaleString() ?? "—"}</p>
                </div>
              </div>

              <div className="bg-[#111108] rounded-lg p-6 mb-8 border border-[#2a2008]">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.annual} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2008" />
                    <XAxis dataKey="year" stroke="#6b5a45" tick={{ fill: "#6b5a45", fontSize: 10 }} interval={4} angle={-45} textAnchor="end" />
                    <YAxis stroke="#6b5a45" tick={{ fill: "#6b5a45", fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111108", border: "1px solid #2a2008", borderRadius: "8px", color: "#f2ede4", fontFamily: "Georgia, serif" }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [typeof value === "number" ? value.toLocaleString() : String(value), lang === "en" ? "Deaths" : "Muertes"]}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      labelFormatter={(label: any) => `${label}`}
                    />
                    <Bar dataKey="deaths" fill="#8B3A3A" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#111108] rounded-lg p-6 border border-[#2a2008]">
                <p className="text-[#b8860b] text-sm italic">
                  {lang === "en"
                    ? `Between ${data.annual[0]?.year} and ${data.annual[data.annual.length - 1]?.year}, ${totalDeaths.toLocaleString()} people died from gun violence in the United States. The data is the record. The record does not look away.`
                    : `Entre ${data.annual[0]?.year} y ${data.annual[data.annual.length - 1]?.year}, ${totalDeaths.toLocaleString()} personas murieron por violencia armada en los Estados Unidos.`}
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* States Tab */}
      {tab === "states" && (
        <>
          {data.states.length === 0 ? (
            <div className="bg-[#111108] rounded-lg p-12 text-center border border-[#2a2008]">
              <p className="text-[#6b5a45]">Awaiting data...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {statesSorted.map((s, i) => {
                const barWidth = (s.rate_per_100k ?? 0) / maxRate;
                return (
                  <div key={s.state} className="flex items-center gap-3 bg-[#111108] rounded px-4 py-2 border border-[#2a2008]/50">
                    <span className="text-xs text-[#6b5a45] w-6 text-right tabular-nums">{i + 1}</span>
                    <span className="text-sm text-[#f2ede4] w-40 truncate">{s.state}</span>
                    <div className="flex-1 h-4 bg-[#0a0a0a] rounded-sm overflow-hidden">
                      <div className="h-full rounded-sm" style={{ width: `${barWidth * 100}%`, backgroundColor: "#8B3A3A", opacity: 0.5 + barWidth * 0.5 }} />
                    </div>
                    <span className="text-sm text-[#6b5a45] tabular-nums w-20 text-right">
                      {s.rate_per_100k?.toFixed(1) ?? "—"}/100k
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Demographics Tab */}
      {tab === "demographics" && (
        <>
          {Object.keys(data.demographics).length === 0 ? (
            <div className="bg-[#111108] rounded-lg p-12 text-center border border-[#2a2008]">
              <p className="text-[#6b5a45]">Awaiting data...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(data.demographics).map(([cat, records]) => (
                <div key={cat}>
                  <h3 className="text-lg font-serif text-[#f2ede4] mb-3 capitalize">
                    {cat.replace("_", " ")}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#2a2008]">
                          <th className="text-left py-2 text-[#6b5a45] font-normal">Group</th>
                          <th className="text-right py-2 text-[#6b5a45] font-normal">{lang === "en" ? "Deaths" : "Muertes"}</th>
                          <th className="text-right py-2 text-[#6b5a45] font-normal">{lang === "en" ? "Rate/100k" : "Tasa/100k"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((r) => (
                          <tr key={r.group_name} className="border-b border-[#2a2008]/50">
                            <td className="py-2 text-[#f2ede4]">{r.group_name}</td>
                            <td className="py-2 text-right text-[#6b5a45] tabular-nums">{r.deaths.toLocaleString()}</td>
                            <td className="py-2 text-right text-[#6b5a45] tabular-nums">{r.rate_per_100k?.toFixed(1) ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}

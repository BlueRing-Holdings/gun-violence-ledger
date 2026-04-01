"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/layout/PageShell";
import { CountryRecord } from "@/lib/types";

export default function WorldPage() {
  const [data, setData] = useState<CountryRecord[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"rate" | "deaths">("rate");
  const [lang, setLang] = useState<"en" | "es">("en");

  useEffect(() => {
    fetch("/api/world")
      .then((r) => r.json())
      .then((d) => {
        setData(d.records ?? []);
        setYear(d.year ?? null);
      })
      .catch(() => {});
  }, []);

  const reporting = data.filter((r) => r.data_reported);
  const gaps = data.filter((r) => !r.data_reported);

  const sorted = [...reporting].sort((a, b) => {
    if (sortBy === "rate") return (b.rate_per_100k ?? 0) - (a.rate_per_100k ?? 0);
    return (b.deaths ?? 0) - (a.deaths ?? 0);
  });

  const maxVal = sortBy === "rate"
    ? Math.max(...reporting.map((r) => r.rate_per_100k ?? 0), 1)
    : Math.max(...reporting.map((r) => r.deaths ?? 0), 1);

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#f2ede4] mb-2">
          {lang === "en" ? "Country by Country" : "País por País"}
        </h1>
        <p className="text-[#6b5a45] text-sm">
          {lang === "en"
            ? `Firearm mortality rates by country${year ? `, ${year}` : ""}. Source: WHO Global Health Observatory.`
            : `Tasas de mortalidad por armas por país${year ? `, ${year}` : ""}. Fuente: Observatorio de Salud Global de la OMS.`}
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="text-xs text-[#6b5a45] hover:text-[#b8860b] transition-colors border border-[#2a2008] rounded px-3 py-1"
          >
            {lang === "en" ? "Ver en español" : "View in English"}
          </button>
          <button
            onClick={() => setSortBy(sortBy === "rate" ? "deaths" : "rate")}
            className="text-xs text-[#6b5a45] hover:text-[#b8860b] transition-colors border border-[#2a2008] rounded px-3 py-1"
          >
            {lang === "en"
              ? `Sort by ${sortBy === "rate" ? "total deaths" : "rate"}`
              : `Ordenar por ${sortBy === "rate" ? "muertes totales" : "tasa"}`}
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="bg-[#111108] rounded-lg p-12 text-center border border-[#2a2008]">
          <p className="text-[#6b5a45]">Awaiting data...</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#111108] rounded-lg p-6 text-center border border-[#2a2008]">
              <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">
                {lang === "en" ? "Countries Reporting" : "Países Reportando"}
              </p>
              <p className="text-3xl font-serif text-[#b8860b] tabular-nums">{reporting.length}</p>
            </div>
            <div className="bg-[#111108] rounded-lg p-6 text-center border border-[#2a2008]">
              <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">
                {lang === "en" ? "Data Gaps" : "Brechas de Datos"}
              </p>
              <p className="text-3xl font-serif text-[#8B3A3A] tabular-nums">{gaps.length}</p>
            </div>
            <div className="bg-[#111108] rounded-lg p-6 text-center border border-[#2a2008]">
              <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">
                {lang === "en" ? "Global Deaths" : "Muertes Globales"}
              </p>
              <p className="text-3xl font-serif text-[#f2ede4] tabular-nums">
                {reporting.reduce((s, r) => s + (r.deaths ?? 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Country bars */}
          <div className="space-y-1 mb-10">
            {sorted.map((c, i) => {
              const val = sortBy === "rate" ? (c.rate_per_100k ?? 0) : (c.deaths ?? 0);
              const barWidth = val / maxVal;
              return (
                <div
                  key={c.country_iso3}
                  className="flex items-center gap-3 bg-[#111108] rounded px-4 py-2 border border-[#2a2008]/50"
                >
                  <span className="text-xs text-[#6b5a45] w-6 text-right tabular-nums">{i + 1}</span>
                  <span className="text-xs text-[#6b5a45] w-10">{c.country_iso3}</span>
                  <span className="text-sm text-[#f2ede4] w-44 truncate">{c.country_name}</span>
                  <div className="flex-1 h-4 bg-[#0a0a0a] rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: `${barWidth * 100}%`,
                        backgroundColor: "#8B3A3A",
                        opacity: 0.5 + barWidth * 0.5,
                      }}
                    />
                  </div>
                  <span className="text-sm text-[#6b5a45] tabular-nums w-24 text-right">
                    {sortBy === "rate"
                      ? `${c.rate_per_100k?.toFixed(1) ?? "—"}/100k`
                      : (c.deaths ?? 0).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Gap entries */}
          {gaps.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-serif text-[#f2ede4] mb-4">
                {lang === "en" ? "Data Not Reported" : "Datos No Reportados"}
              </h2>
              <p className="text-[#6b5a45] text-sm mb-4 italic">
                {lang === "en"
                  ? "The following countries have not reported firearm mortality data to the WHO. The absence of data is also data."
                  : "Los siguientes países no han reportado datos de mortalidad por armas a la OMS. La ausencia de datos también es un dato."}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {gaps.map((g) => (
                  <div
                    key={g.country_iso3}
                    className="bg-[#111108] rounded px-3 py-2 text-sm text-[#6b5a45] border border-[#2a2008]/30"
                  >
                    <span className="text-[#8B3A3A] mr-2">{g.country_iso3}</span>
                    {g.country_name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plain language */}
          <div className="bg-[#111108] rounded-lg p-6 border border-[#2a2008]">
            <p className="text-[#b8860b] text-sm italic">
              {lang === "en"
                ? "Firearm deaths are a global phenomenon. Some countries measure it. Some do not. Both facts are recorded here."
                : "Las muertes por armas son un fenómeno global. Algunos países lo miden. Otros no. Ambos hechos se registran aquí."}
            </p>
          </div>
        </>
      )}
    </PageShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/layout/PageShell";
import { ConflictRecord } from "@/lib/types";

const typeLabels: Record<string, { en: string; es: string }> = {
  "state-based": { en: "State-based conflict", es: "Conflicto estatal" },
  "non-state": { en: "Non-state conflict", es: "Conflicto no estatal" },
  "one-sided": { en: "One-sided violence", es: "Violencia unilateral" },
};

const typeColors: Record<string, string> = {
  "state-based": "#8B3A3A",
  "non-state": "#b8860b",
  "one-sided": "#5B5B8B",
};

export default function ConflictsPage() {
  const [data, setData] = useState<ConflictRecord[]>([]);
  const [lang, setLang] = useState<"en" | "es">("en");

  useEffect(() => {
    fetch("/api/conflicts")
      .then((r) => r.json())
      .then((d) => setData(d.records ?? []))
      .catch(() => {});
  }, []);

  const totalDeaths = data.reduce((s, r) => s + r.deaths_total, 0);
  const countries = Array.from(new Set(data.map((r) => r.country_name)));
  const conflicts = Array.from(new Set(data.map((r) => r.conflict_name)));

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#f2ede4] mb-2">
          {lang === "en" ? "Conflict-Related Deaths" : "Muertes Relacionadas con Conflictos"}
        </h1>
        <p className="text-[#6b5a45] text-sm">
          {lang === "en"
            ? "Armed conflict and organized violence worldwide. Source: Uppsala Conflict Data Program (UCDP)."
            : "Conflicto armado y violencia organizada en todo el mundo. Fuente: UCDP."}
        </p>
        <button
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          className="mt-2 text-xs text-[#6b5a45] hover:text-[#b8860b] transition-colors border border-[#2a2008] rounded px-3 py-1"
        >
          {lang === "en" ? "Ver en español" : "View in English"}
        </button>
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
                {lang === "en" ? "Conflict Deaths" : "Muertes en Conflictos"}
              </p>
              <p className="text-3xl font-serif text-[#f2ede4] tabular-nums">{totalDeaths.toLocaleString()}</p>
            </div>
            <div className="bg-[#111108] rounded-lg p-6 text-center border border-[#2a2008]">
              <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">
                {lang === "en" ? "Countries Affected" : "Países Afectados"}
              </p>
              <p className="text-3xl font-serif text-[#b8860b] tabular-nums">{countries.length}</p>
            </div>
            <div className="bg-[#111108] rounded-lg p-6 text-center border border-[#2a2008]">
              <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">
                {lang === "en" ? "Active Conflicts" : "Conflictos Activos"}
              </p>
              <p className="text-3xl font-serif text-[#8B3A3A] tabular-nums">{conflicts.length}</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 text-xs">
            {Object.entries(typeLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeColors[key] ?? "#6b5a45" }} />
                <span className="text-[#6b5a45]">{label[lang]}</span>
              </div>
            ))}
          </div>

          {/* Conflict list */}
          <div className="space-y-3">
            {data.map((c, i) => (
              <div key={c.id || i} className="bg-[#111108] rounded-lg p-5 border border-[#2a2008]/50">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: typeColors[c.conflict_type] ?? "#6b5a45" }}
                    />
                    <h3 className="text-[#f2ede4] font-serif">{c.conflict_name}</h3>
                  </div>
                  <span className="text-xs text-[#6b5a45] whitespace-nowrap">{c.year}</span>
                </div>
                <p className="text-sm text-[#6b5a45] mb-1">
                  {c.country_name} ({c.country_iso3})
                </p>
                <div className="flex gap-6 text-sm">
                  <span className="text-[#8B3A3A] tabular-nums">
                    {c.deaths_total.toLocaleString()} {lang === "en" ? "total deaths" : "muertes totales"}
                  </span>
                  {c.deaths_firearms !== null && (
                    <span className="text-[#6b5a45] tabular-nums">
                      {c.deaths_firearms.toLocaleString()} {lang === "en" ? "firearm" : "armas de fuego"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6b5a45] mt-2">
                  {lang === "en" ? "Source:" : "Fuente:"} {c.source}
                </p>
              </div>
            ))}
          </div>

          {/* Plain language */}
          <div className="bg-[#111108] rounded-lg p-6 mt-10 border border-[#2a2008]">
            <p className="text-[#b8860b] text-sm italic">
              {lang === "en"
                ? "Armed conflict kills with firearms more than any other weapon. The ledger records what UCDP documents. The record does not distinguish combatant from civilian."
                : "El conflicto armado mata con armas de fuego más que con cualquier otra arma. El registro documenta lo que UCDP publica."}
            </p>
          </div>
        </>
      )}
    </PageShell>
  );
}

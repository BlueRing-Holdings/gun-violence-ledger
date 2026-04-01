"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/layout/PageShell";
import { EconomicCost } from "@/lib/types";

export default function CostPage() {
  const [data, setData] = useState<EconomicCost[]>([]);
  const [lang, setLang] = useState<"en" | "es">("en");

  useEffect(() => {
    fetch("/api/cost")
      .then((r) => r.json())
      .then((d) => setData(d.records ?? []))
      .catch(() => {});
  }, []);

  const totalCost = data.reduce((sum, r) => sum + r.amount_usd, 0);

  function formatUSD(n: number): string {
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    return `$${n.toLocaleString()}`;
  }

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#f2ede4] mb-2">
          {lang === "en" ? "The Economic Toll" : "El Costo Económico"}
        </h1>
        <p className="text-[#6b5a45] text-sm">
          {lang === "en"
            ? "The measured cost of gun violence to the global and US economy."
            : "El costo medido de la violencia armada para la economía global y de los Estados Unidos."}
        </p>
        <button
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          className="mt-2 text-xs text-[#6b5a45] hover:text-[#6b5a45] transition-colors border border-[#2a2008] rounded px-3 py-1"
        >
          {lang === "en" ? "Ver en español" : "View in English"}
        </button>
      </div>

      {data.length === 0 ? (
        <div className="bg-[#111108] rounded-lg p-12 text-center">
          <p className="text-[#6b5a45]">Awaiting data...</p>
        </div>
      ) : (
        <>
          {/* Total */}
          <div className="bg-[#111108] rounded-lg p-8 mb-8 text-center">
            <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-2">
              {lang === "en" ? "Estimated Annual Cost" : "Costo Anual Estimado"}
            </p>
            <p className="text-5xl font-serif text-[#f2ede4] tabular-nums">
              {formatUSD(totalCost)}
            </p>
            <p className="text-[#6b5a45] text-sm mt-2">
              {lang === "en" ? "per year" : "por año"}
            </p>
          </div>

          {/* Breakdown table */}
          <div className="bg-[#111108] rounded-lg p-6 mb-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2008]">
                  <th className="text-left py-3 text-[#6b5a45] font-normal">
                    {lang === "en" ? "Category" : "Categoría"}
                  </th>
                  <th className="text-right py-3 text-[#6b5a45] font-normal">
                    {lang === "en" ? "Annual Cost" : "Costo Anual"}
                  </th>
                  <th className="text-left py-3 pl-6 text-[#6b5a45] font-normal">
                    {lang === "en" ? "Description" : "Descripción"}
                  </th>
                  <th className="text-left py-3 text-[#6b5a45] font-normal">
                    {lang === "en" ? "Source" : "Fuente"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id || r.category} className="border-b border-[#2a2008]/50">
                    <td className="py-3 text-[#f2ede4]">{r.category}</td>
                    <td className="py-3 text-right text-[#f2ede4] tabular-nums font-serif">
                      {formatUSD(r.amount_usd)}
                    </td>
                    <td className="py-3 pl-6 text-[#6b5a45]">{r.description}</td>
                    <td className="py-3 text-[#6b5a45] text-xs">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Plain language */}
          <div className="bg-[#111108] rounded-lg p-6">
            <p className="text-[#b8860b] text-sm italic">
              {lang === "en"
                ? `Gun violence costs the United States an estimated ${formatUSD(totalCost)} per year. This includes medical care, criminal justice, lost wages, and employer costs. The economic toll is measured. The human toll is not.`
                : `La violencia armada le cuesta a los Estados Unidos un estimado de ${formatUSD(totalCost)} por año. Esto incluye atención médica, justicia penal, salarios perdidos y costos empresariales. El costo económico se mide. El costo humano no.`}
            </p>
          </div>
        </>
      )}
    </PageShell>
  );
}

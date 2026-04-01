"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/layout/PageShell";
import { PolicyEvent } from "@/lib/types";

const typeColors: Record<string, string> = {
  mass_shooting: "#8B3A3A",
  legislation: "#b8860b",
  court_ruling: "#5B5B8B",
  executive_action: "#8B7B3A",
  treaty: "#4A6741",
};

const typeLabels: Record<string, { en: string; es: string }> = {
  mass_shooting: { en: "Mass Shooting", es: "Tiroteo Masivo" },
  legislation: { en: "Legislation", es: "Legislación" },
  court_ruling: { en: "Court Ruling", es: "Fallo Judicial" },
  executive_action: { en: "Executive Action", es: "Acción Ejecutiva" },
  treaty: { en: "International Treaty", es: "Tratado Internacional" },
};

export default function PolicyPage() {
  const [events, setEvents] = useState<PolicyEvent[]>([]);
  const [lang, setLang] = useState<"en" | "es">("en");

  useEffect(() => {
    fetch("/api/status?type=policy")
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => {});
  }, []);

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#f2ede4] mb-2">
          {lang === "en" ? "The Accountability Gap" : "La Brecha de Responsabilidad"}
        </h1>
        <p className="text-[#6b5a45] text-sm">
          {lang === "en"
            ? "A global timeline of mass shootings, legislation, and policy responses. What happened. What followed."
            : "Una línea de tiempo global de tiroteos masivos, legislación y respuestas políticas. Qué pasó. Qué siguió."}
        </p>
        <button
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          className="mt-2 text-xs text-[#6b5a45] hover:text-[#6b5a45] transition-colors border border-[#2a2008] rounded px-3 py-1"
        >
          {lang === "en" ? "Ver en español" : "View in English"}
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-[#111108] rounded-lg p-12 text-center">
          <p className="text-[#6b5a45]">Awaiting data...</p>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-8 text-xs">
            {Object.entries(typeLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: typeColors[key] ?? "#6b5a45" }}
                />
                <span className="text-[#6b5a45]">{label[lang]}</span>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-[#2a2008]" />
            <div className="space-y-6">
              {events.map((ev, i) => (
                <div key={ev.id || i} className="relative pl-12">
                  <div
                    className="absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-[#0a0a0a]"
                    style={{
                      backgroundColor: typeColors[ev.event_type] ?? "#6b5a45",
                    }}
                  />
                  <div className="bg-[#111108] rounded-lg p-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-[#f2ede4] font-serif">{ev.title}</h3>
                      <span className="text-xs text-[#6b5a45] whitespace-nowrap">
                        {new Date(ev.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#b8860b] mb-1">{ev.country_name}</p>
                    <p className="text-sm text-[#6b5a45] mb-2">{ev.description}</p>
                    {ev.deaths !== null && (
                      <p className="text-sm text-[#8B3A3A] tabular-nums">
                        {ev.deaths} {lang === "en" ? "killed" : "muertos"}
                      </p>
                    )}
                    {ev.policy_outcome && (
                      <p className="text-sm text-[#6b5a45] mt-2 italic">
                        {lang === "en" ? "Policy outcome:" : "Resultado político:"}{" "}
                        {ev.policy_outcome}
                      </p>
                    )}
                    <p className="text-xs text-[#6b5a45] mt-2">
                      {lang === "en" ? "Source:" : "Fuente:"} {ev.source}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plain language */}
          <div className="bg-[#111108] rounded-lg p-6 mt-10">
            <p className="text-[#b8860b] text-sm italic">
              {lang === "en"
                ? "The ledger records what happened and what followed. The gap between event and response is visible in the record."
                : "El registro documenta lo que pasó y lo que siguió. La brecha entre el evento y la respuesta es visible en el registro."}
            </p>
          </div>
        </>
      )}
    </PageShell>
  );
}

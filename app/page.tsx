"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/layout/PageShell";

interface GlobalStatus {
  global_deaths_latest_year: number | null;
  global_deaths_latest: number | null;
  us_deaths_latest_year: number | null;
  us_deaths_latest: number | null;
  us_cumulative: number | null;
  countries_reporting: number;
  countries_gap: number;
  total_records: number;
  last_ingestion: string | null;
}

export default function HomePage() {
  const [status, setStatus] = useState<GlobalStatus | null>(null);
  const [lang, setLang] = useState<"en" | "es">("en");

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  const usDeaths = status?.us_deaths_latest;
  const usYear = status?.us_deaths_latest_year;

  let intervalText = { en: "", es: "" };
  if (usDeaths) {
    const minutesPer = Math.round(525600 / usDeaths);
    if (minutesPer < 60) {
      intervalText = {
        en: `One person every ${minutesPer} minutes.`,
        es: `Una persona cada ${minutesPer} minutos.`,
      };
    } else {
      const h = Math.floor(minutesPer / 60);
      const m = minutesPer % 60;
      intervalText = {
        en: `One person every ${h} hour${h > 1 ? "s" : ""}${m ? ` and ${m} minutes` : ""}.`,
        es: `Una persona cada ${h} hora${h > 1 ? "s" : ""}${m ? ` y ${m} minutos` : ""}.`,
      };
    }
  }

  return (
    <PageShell>
      {/* Hero */}
      <div className="text-center mb-16 mt-8">
        <h1 className="text-4xl sm:text-5xl font-serif text-[#f2ede4] mb-4 tracking-tight">
          Gladius
        </h1>
        <p className="text-[#6b5a45] text-lg max-w-2xl mx-auto">
          {lang === "en"
            ? "A permanent record of firearm deaths worldwide."
            : "Un registro permanente de muertes por armas de fuego en todo el mundo."}
        </p>
        <p className="text-[#6b5a45] text-sm mt-2">
          Ledger #5 of the No Guidance Civic Ledger Suite
        </p>
      </div>

      {/* Global Counter */}
      <div className="bg-[#111108] rounded-lg p-8 mb-8 text-center border border-[#2a2008]">
        <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-3">
          {lang === "en" ? "Countries Reporting Firearm Mortality to WHO" : "Países Reportando Mortalidad por Armas a la OMS"}
        </p>
        <div className="flex justify-center gap-12 mb-4">
          <div>
            <p className="text-4xl font-serif text-[#b8860b] tabular-nums">
              {status?.countries_reporting ?? "—"}
            </p>
            <p className="text-xs text-[#6b5a45] mt-1">{lang === "en" ? "reporting" : "reportando"}</p>
          </div>
          <div>
            <p className="text-4xl font-serif text-[#8B3A3A] tabular-nums">
              {status?.countries_gap ?? "—"}
            </p>
            <p className="text-xs text-[#6b5a45] mt-1">{lang === "en" ? "data gap" : "sin datos"}</p>
          </div>
        </div>
        <p className="text-[#6b5a45] text-xs italic">
          {lang === "en"
            ? "The absence of data is also data."
            : "La ausencia de datos también es un dato."}
        </p>
      </div>

      {/* US Counter Band */}
      <div className="bg-[#111108] rounded-lg p-8 mb-8 text-center border border-[#2a2008]">
        <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-3">
          {usYear ? `United States — ${usYear}` : "United States — Awaiting data..."}
        </p>
        <p className="text-5xl sm:text-6xl font-serif text-[#f2ede4] tabular-nums mb-4">
          {usDeaths ? usDeaths.toLocaleString() : "Awaiting..."}
        </p>
        <p className="text-[#6b5a45] text-sm mb-1">
          {lang === "en" ? "deaths from gunshot wounds" : "muertes por heridas de bala"}
        </p>
        {usDeaths && (
          <p className="text-[#b8860b] text-sm mt-4 italic">
            {intervalText[lang]}
          </p>
        )}
      </div>

      {/* Cumulative */}
      {status?.us_cumulative && (
        <div className="bg-[#111108] rounded-lg p-6 mb-8 text-center border border-[#2a2008]">
          <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-2">
            US Cumulative Deaths on Record (1968–{usYear})
          </p>
          <p className="text-3xl font-serif text-[#f2ede4] tabular-nums">
            {status.us_cumulative.toLocaleString()}
          </p>
          <p className="text-[#6b5a45] text-sm mt-2">
            {lang === "en"
              ? "Each number is a person. Each person had a name."
              : "Cada número es una persona. Cada persona tenía un nombre."}
          </p>
        </div>
      )}

      {/* Lang toggle */}
      <div className="text-center mb-12">
        <button
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          className="text-xs text-[#6b5a45] hover:text-[#b8860b] transition-colors border border-[#2a2008] rounded px-3 py-1"
        >
          {lang === "en" ? "Ver en español" : "View in English"}
        </button>
      </div>

      {/* What This Is / What This Is Not */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-[#111108] rounded-lg p-6 border border-[#2a2008]">
          <h2 className="text-lg font-serif text-[#f2ede4] mb-4">What This Is</h2>
          <ul className="space-y-2 text-sm text-[#6b5a45]">
            <li>A permanent public record of firearm deaths worldwide</li>
            <li>Data sourced from WHO, CDC WONDER, UCDP, and Gun Violence Archive</li>
            <li>Append-only — no record is ever modified or deleted</li>
            <li>Countries that do not report appear as gap entries</li>
          </ul>
        </div>
        <div className="bg-[#111108] rounded-lg p-6 border border-[#2a2008]">
          <h2 className="text-lg font-serif text-[#f2ede4] mb-4">What This Is Not</h2>
          <ul className="space-y-2 text-sm text-[#6b5a45]">
            <li>Not affiliated with WHO, CDC, ATF, or any government</li>
            <li>Not an advocacy platform</li>
            <li>Not a prediction tool</li>
            <li>Not an editorial publication</li>
          </ul>
          <p className="text-sm text-[#6b5a45] mt-4 italic">
            The data is the argument. The ledger does not editorialize.
          </p>
        </div>
      </div>

      {/* Ledger Status */}
      <div className="bg-[#111108] rounded-lg p-6 mb-12 border border-[#2a2008]">
        <h2 className="text-lg font-serif text-[#f2ede4] mb-4">Ledger Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-serif text-[#f2ede4] tabular-nums">
              {status?.total_records ?? "—"}
            </p>
            <p className="text-xs text-[#6b5a45]">Total Records</p>
          </div>
          <div>
            <p className="text-2xl font-serif text-[#f2ede4]">Append-Only</p>
            <p className="text-xs text-[#6b5a45]">Write Mode</p>
          </div>
          <div>
            <p className="text-2xl font-serif text-[#f2ede4]">Public</p>
            <p className="text-xs text-[#6b5a45]">Read Access</p>
          </div>
          <div>
            <p className="text-2xl font-serif text-[#f2ede4]">
              {status?.last_ingestion
                ? new Date(status.last_ingestion).toLocaleDateString()
                : "Awaiting..."}
            </p>
            <p className="text-xs text-[#6b5a45]">Last Ingestion</p>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-[#111108] rounded-lg p-6 mb-12 border border-[#2a2008]">
        <h2 className="text-lg font-serif text-[#f2ede4] mb-4">Data Sources</h2>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-[#f2ede4]">WHO Global Health Observatory</p>
            <p className="text-[#6b5a45]">Firearm mortality by country. The primary global source.</p>
          </div>
          <div className="border-t border-[#2a2008] pt-4">
            <p className="text-[#f2ede4]">CDC WONDER — Multiple Cause of Death</p>
            <p className="text-[#6b5a45]">US annual firearm mortality, 1968–2024. ICD-10 codes W32–W34, X72–X74, X93–X95, Y22–Y24, Y35.0, U01.4.</p>
          </div>
          <div className="border-t border-[#2a2008] pt-4">
            <p className="text-[#f2ede4]">UCDP (Uppsala Conflict Data Program)</p>
            <p className="text-[#6b5a45]">Conflict-related deaths globally. Armed conflict and organized violence.</p>
          </div>
          <div className="border-t border-[#2a2008] pt-4">
            <p className="text-[#f2ede4]">Gun Violence Archive</p>
            <p className="text-[#6b5a45]">US daily year-to-date incidents and casualties.</p>
          </div>
          <div className="border-t border-[#2a2008] pt-4">
            <p className="text-[#f2ede4]">Geneva Small Arms Survey</p>
            <p className="text-[#6b5a45]">Global small arms estimates and firearms research.</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

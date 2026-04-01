"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/layout/PageShell";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

/* ── types ── */

interface RaceRow {
  id: string;
  year: number;
  race_ethnicity: string;
  intent: string;
  deaths: number;
  rate_per_100k: number | null;
  population: number | null;
  source: string;
  source_url: string;
}

interface AgeRow {
  id: string;
  year: number;
  age_group: string;
  intent: string;
  deaths: number;
  rate_per_100k: number | null;
  population: number | null;
  source: string;
  source_url: string;
}

interface RegionRow {
  id: string;
  year: number;
  census_division: string;
  urban_rural: string;
  intent: string;
  deaths: number;
  rate_per_100k: number | null;
  source: string;
  source_url: string;
}

interface ConditionRow {
  id: string;
  year: number;
  condition_type: string;
  deaths: number | null;
  incidents: number | null;
  children_involved: boolean | null;
  notes: string | null;
  source: string;
  source_url: string;
}

interface DemoData {
  race: RaceRow[];
  age: AgeRow[];
  region: RegionRow[];
  conditions: ConditionRow[];
  year: number | null;
}

type Tab = "race" | "age" | "geography" | "conditions" | "sources";

/* ── source badge ── */

function SourceBadge({ name, url }: { name: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[10px] text-[#6b5a45] bg-[#0a0a0a] border border-[#2a2008] rounded-full px-2 py-0.5 hover:text-[#b8860b] transition-colors"
    >
      {name}
    </a>
  );
}

/* ── condition card labels ── */

const conditionLabels: Record<string, { en: string; es: string }> = {
  children_under_18: { en: "Children Under 18", es: "Menores de 18 Anios" },
  domestic_violence: { en: "Domestic Violence", es: "Violencia Domestica" },
  mass_shooting: { en: "Mass Shootings", es: "Tiroteos Masivos" },
  school_shooting: { en: "School Shootings", es: "Tiroteos Escolares" },
  law_enforcement: { en: "Law Enforcement", es: "Fuerzas del Orden" },
  unintentional_child: { en: "Unintentional (Children)", es: "Accidentales (Menores)" },
  gun_trafficking_interstate: { en: "Interstate Gun Trafficking", es: "Trafico Interestatal de Armas" },
};

const conditionPlainLang: Record<string, { en: string; es: string }> = {
  children_under_18: {
    en: "Firearms are the leading cause of death for children and teens in the United States.",
    es: "Las armas de fuego son la principal causa de muerte de menores en los Estados Unidos.",
  },
  domestic_violence: {
    en: "The presence of a firearm in a domestic violence situation makes it five times more likely to result in homicide.",
    es: "La presencia de un arma de fuego en situaciones de violencia domestica multiplica por cinco la probabilidad de homicidio.",
  },
  mass_shooting: {
    en: "Mass shootings account for a small fraction of gun deaths but produce outsized public attention.",
    es: "Los tiroteos masivos representan una fraccion pequenia de las muertes pero generan atencion publica desproporcionada.",
  },
  school_shooting: {
    en: "School shootings include any discharge of a firearm on school grounds during school hours or events.",
    es: "Los tiroteos escolares incluyen cualquier descarga de arma de fuego en terrenos escolares durante horario escolar o eventos.",
  },
  law_enforcement: {
    en: "Fatal police shootings are tracked by the Washington Post's Fatal Force database, which records every on-duty officer-involved shooting death.",
    es: "Los tiroteos policiales fatales son rastreados por la base de datos Fatal Force del Washington Post.",
  },
  unintentional_child: {
    en: "Unintentional shootings by or involving children often occur with unsecured firearms in the home.",
    es: "Los disparos accidentales de o contra menores ocurren frecuentemente con armas no aseguradas en el hogar.",
  },
  gun_trafficking_interstate: {
    en: "ATF traces reveal that thousands of firearms used in crimes originate from states with weaker purchasing regulations.",
    es: "Los rastreos del ATF revelan que miles de armas usadas en crimenes provienen de estados con regulaciones de compra mas debiles.",
  },
};

/* ── sources registry ── */

const sourcesRegistry = [
  {
    name: "CDC WONDER",
    url: "https://wonder.cdc.gov/",
    description: {
      en: "Wide-ranging Online Data for Epidemiologic Research. Provides mortality data by cause, demographics, and geography.",
      es: "Datos epidemiologicos en linea. Proporciona datos de mortalidad por causa, demografia y geografia.",
    },
  },
  {
    name: "Johns Hopkins Center for Gun Violence Solutions",
    url: "https://publichealth.jhu.edu/center-for-gun-violence-solutions",
    description: {
      en: "Research center providing evidence-based analysis of gun violence trends and disparities.",
      es: "Centro de investigacion que proporciona analisis basado en evidencia sobre tendencias y disparidades de violencia armada.",
    },
  },
  {
    name: "IHME / Global Burden of Disease",
    url: "https://www.healthdata.org/results/gbd_summaries/2021",
    description: {
      en: "Institute for Health Metrics and Evaluation. Provides subnational mortality estimates and risk factor analysis.",
      es: "Instituto de Metricas y Evaluacion de Salud. Proporciona estimaciones subnacionales de mortalidad y analisis de factores de riesgo.",
    },
  },
  {
    name: "County Health Rankings",
    url: "https://www.countyhealthrankings.org/",
    description: {
      en: "Robert Wood Johnson Foundation program ranking county-level health outcomes including firearm mortality.",
      es: "Programa de la Fundacion Robert Wood Johnson que clasifica resultados de salud a nivel de condado, incluyendo mortalidad por armas de fuego.",
    },
  },
  {
    name: "Everytown for Gun Safety",
    url: "https://everytownresearch.org/",
    description: {
      en: "Research arm tracking school shootings, domestic violence gun homicides, and unintentional child shootings.",
      es: "Organizacion de investigacion que rastrea tiroteos escolares, homicidios por violencia domestica y disparos accidentales de menores.",
    },
  },
  {
    name: "Gun Violence Archive",
    url: "https://www.gunviolencearchive.org/",
    description: {
      en: "Independent nonprofit cataloging every gun violence incident in the US from media and law enforcement sources.",
      es: "Organizacion independiente que cataloga cada incidente de violencia armada en EE.UU. a partir de medios y fuentes policiales.",
    },
  },
  {
    name: "Washington Post Fatal Force",
    url: "https://www.washingtonpost.com/graphics/investigations/police-shootings-database/",
    description: {
      en: "Database of every fatal shooting by an on-duty police officer in the United States since 2015.",
      es: "Base de datos de cada tiroteo fatal por un oficial de policia en servicio en los Estados Unidos desde 2015.",
    },
  },
  {
    name: "ATF National Firearms Commerce and Trafficking Assessment",
    url: "https://www.atf.gov/firearms/national-firearms-commerce-and-trafficking-assessment",
    description: {
      en: "Federal assessment of interstate firearms trafficking patterns based on trace data.",
      es: "Evaluacion federal de patrones de trafico interestatal de armas basada en datos de rastreo.",
    },
  },
];

/* ── main page ── */

export default function DemographicsPage() {
  const [data, setData] = useState<DemoData>({
    race: [],
    age: [],
    region: [],
    conditions: [],
    year: null,
  });
  const [lang, setLang] = useState<"en" | "es">("en");
  const [tab, setTab] = useState<Tab>("race");

  useEffect(() => {
    fetch("/api/demographics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const tabs: { key: Tab; en: string; es: string }[] = [
    { key: "race", en: "Race & Ethnicity", es: "Raza y Etnicidad" },
    { key: "age", en: "Age & Generation", es: "Edad y Generacion" },
    { key: "geography", en: "Geography & Division", es: "Geografia y Division" },
    { key: "conditions", en: "Conditions & Context", es: "Condiciones y Contexto" },
    { key: "sources", en: "Sources", es: "Fuentes" },
  ];

  /* ── Race chart data ── */
  const raceGroups = Array.from(new Set(data.race.map((r) => r.race_ethnicity)));
  const raceChartData = raceGroups.map((group) => {
    const homRow = data.race.find((r) => r.race_ethnicity === group && r.intent === "homicide");
    const suiRow = data.race.find((r) => r.race_ethnicity === group && r.intent === "suicide");
    const allRow = data.race.find((r) => r.race_ethnicity === group && r.intent === "all");
    return {
      group,
      homicide: homRow?.deaths ?? 0,
      suicide: suiRow?.deaths ?? 0,
      total: allRow?.deaths ?? (homRow?.deaths ?? 0) + (suiRow?.deaths ?? 0),
      rate: allRow?.rate_per_100k ?? homRow?.rate_per_100k ?? 0,
      homSource: homRow?.source ?? allRow?.source ?? "",
      homUrl: homRow?.source_url ?? allRow?.source_url ?? "",
      suiSource: suiRow?.source ?? "",
      suiUrl: suiRow?.source_url ?? "",
      allSource: allRow?.source ?? "",
      allUrl: allRow?.source_url ?? "",
    };
  });

  /* ── Age chart data ── */
  const ageChartData = data.age.map((r) => ({
    age_group: r.age_group,
    deaths: r.deaths,
    rate: r.rate_per_100k,
    source: r.source,
    source_url: r.source_url,
    highlight: r.age_group === "15-19",
  }));

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#f2ede4] mb-2">
          {lang === "en" ? "US Demographics" : "Demografia de EE.UU."}
        </h1>
        <p className="text-[#6b5a45] text-sm">
          {lang === "en"
            ? `${data.year ?? "..."} data: Race, age, geography, and contextual breakdowns of US firearm deaths.`
            : `Datos ${data.year ?? "..."}: Desgloses por raza, edad, geografia y contexto de muertes por armas de fuego en EE.UU.`}
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="text-xs text-[#6b5a45] hover:text-[#b8860b] transition-colors border border-[#2a2008] rounded px-3 py-1"
          >
            {lang === "en" ? "Ver en espaniol" : "View in English"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-[#2a2008] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-2 text-sm whitespace-nowrap transition-colors ${
              tab === t.key
                ? "text-[#b8860b] border-b-2 border-[#b8860b]"
                : "text-[#6b5a45] hover:text-[#b8860b]"
            }`}
          >
            {lang === "en" ? t.en : t.es}
          </button>
        ))}
      </div>

      {/* ══════ RACE & ETHNICITY ══════ */}
      {tab === "race" && (
        <>
          {data.race.length === 0 ? (
            <div className="bg-[#111108] rounded-lg p-12 text-center border border-[#2a2008]">
              <p className="text-[#6b5a45]">Awaiting data...</p>
            </div>
          ) : (
            <>
              <div className="bg-[#111108] rounded-lg p-6 mb-6 border border-[#2a2008]">
                <h3 className="text-sm text-[#6b5a45] uppercase tracking-wider mb-4">
                  {lang === "en" ? "Deaths by Race & Intent" : "Muertes por Raza e Intencion"}
                </h3>
                <ResponsiveContainer width="100%" height={raceChartData.length * 60 + 40}>
                  <BarChart
                    data={raceChartData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2008" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#6b5a45"
                      tick={{ fill: "#6b5a45", fontSize: 11 }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      tickFormatter={(v: any) => `${(Number(v) / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="group"
                      stroke="#6b5a45"
                      tick={{ fill: "#f2ede4", fontSize: 11, fontFamily: "Georgia, serif" }}
                      width={180}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111108",
                        border: "1px solid #2a2008",
                        borderRadius: "8px",
                        color: "#f2ede4",
                        fontFamily: "Georgia, serif",
                      }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any, name: any) => [
                        typeof value === "number" ? value.toLocaleString() : String(value),
                        name === "homicide"
                          ? lang === "en" ? "Homicide" : "Homicidio"
                          : lang === "en" ? "Suicide" : "Suicidio",
                      ]}
                    />
                    <Bar dataKey="homicide" fill="#8B3A3A" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="suicide" fill="#6b5a45" stackId="a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Source badges per group */}
              <div className="space-y-2 mb-6">
                {raceChartData.map((r) => (
                  <div key={r.group} className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#f2ede4] w-48">{r.group}</span>
                    {r.homSource && <SourceBadge name={r.homSource} url={r.homUrl} />}
                    {r.suiSource && r.suiSource !== r.homSource && (
                      <SourceBadge name={r.suiSource} url={r.suiUrl} />
                    )}
                    {r.allSource && r.allSource !== r.homSource && r.allSource !== r.suiSource && (
                      <SourceBadge name={r.allSource} url={r.allUrl} />
                    )}
                  </div>
                ))}
              </div>

              {/* Plain language */}
              <div className="bg-[#111108] rounded-lg p-6 border border-[#2a2008]">
                <p className="text-[#b8860b] text-sm italic">
                  {lang === "en"
                    ? "Black Americans face a firearm homicide rate more than 8 times the rate for White Americans. White Americans face a firearm suicide rate more than 3 times the rate for Black Americans. The disparity is structural, not incidental. The data records what policy produces."
                    : "Los afroamericanos enfrentan una tasa de homicidio por arma de fuego mas de 8 veces la tasa de los estadounidenses blancos. Los estadounidenses blancos enfrentan una tasa de suicidio por arma de fuego mas de 3 veces la tasa de los afroamericanos. La disparidad es estructural, no incidental. Los datos registran lo que la politica produce."}
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════ AGE & GENERATION ══════ */}
      {tab === "age" && (
        <>
          {data.age.length === 0 ? (
            <div className="bg-[#111108] rounded-lg p-12 text-center border border-[#2a2008]">
              <p className="text-[#6b5a45]">Awaiting data...</p>
            </div>
          ) : (
            <>
              <div className="bg-[#111108] rounded-lg p-6 mb-6 border border-[#2a2008]">
                <h3 className="text-sm text-[#6b5a45] uppercase tracking-wider mb-4">
                  {lang === "en" ? "Deaths by Age Group" : "Muertes por Grupo de Edad"}
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={ageChartData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2008" />
                    <XAxis
                      dataKey="age_group"
                      stroke="#6b5a45"
                      tick={{ fill: "#6b5a45", fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis
                      stroke="#6b5a45"
                      tick={{ fill: "#6b5a45", fontSize: 11 }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      tickFormatter={(v: any) => `${(Number(v) / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111108",
                        border: "1px solid #2a2008",
                        borderRadius: "8px",
                        color: "#f2ede4",
                        fontFamily: "Georgia, serif",
                      }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [
                        typeof value === "number" ? value.toLocaleString() : String(value),
                        lang === "en" ? "Deaths" : "Muertes",
                      ]}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      labelFormatter={(label: any) => `${label}`}
                    />
                    <Bar dataKey="deaths" radius={[2, 2, 0, 0]}>
                      {ageChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.highlight ? "#b8860b" : "#8B3A3A"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Source badges per age group */}
              <div className="flex flex-wrap gap-2 mb-6">
                {ageChartData.map((r) => (
                  <div key={r.age_group} className="flex items-center gap-1">
                    <span className="text-xs text-[#f2ede4]">{r.age_group}:</span>
                    <SourceBadge name={r.source} url={r.source_url} />
                  </div>
                ))}
              </div>

              {/* Plain language */}
              <div className="bg-[#111108] rounded-lg p-6 border border-[#2a2008]">
                <p className="text-[#b8860b] text-sm italic">
                  {lang === "en"
                    ? "The 15-19 age group sees a 14.5x spike over the 0-4 group in rate per 100,000. Firearms are the leading cause of death for children and adolescents in the United States. The transition from childhood to adolescence is the sharpest inflection point in the data."
                    : "El grupo de 15-19 anios muestra un aumento de 14.5 veces sobre el grupo de 0-4 en la tasa por 100,000. Las armas de fuego son la principal causa de muerte de menores y adolescentes en los Estados Unidos. La transicion de la infancia a la adolescencia es el punto de inflexion mas marcado en los datos."}
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════ GEOGRAPHY & DIVISION ══════ */}
      {tab === "geography" && (
        <>
          {data.region.length === 0 ? (
            <div className="bg-[#111108] rounded-lg p-12 text-center border border-[#2a2008]">
              <p className="text-[#6b5a45]">Awaiting data...</p>
            </div>
          ) : (
            <>
              <div className="bg-[#111108] rounded-lg p-6 mb-6 border border-[#2a2008] overflow-x-auto">
                <h3 className="text-sm text-[#6b5a45] uppercase tracking-wider mb-4">
                  {lang === "en" ? "Deaths by Census Division" : "Muertes por Division Censal"}
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2a2008]">
                      <th className="text-left py-2 text-[#6b5a45] font-normal">
                        {lang === "en" ? "Census Division" : "Division Censal"}
                      </th>
                      <th className="text-left py-2 text-[#6b5a45] font-normal">
                        {lang === "en" ? "Urban/Rural" : "Urbano/Rural"}
                      </th>
                      <th className="text-left py-2 text-[#6b5a45] font-normal">
                        {lang === "en" ? "Intent" : "Intencion"}
                      </th>
                      <th className="text-right py-2 text-[#6b5a45] font-normal">
                        {lang === "en" ? "Deaths" : "Muertes"}
                      </th>
                      <th className="text-right py-2 text-[#6b5a45] font-normal">
                        {lang === "en" ? "Rate/100k" : "Tasa/100k"}
                      </th>
                      <th className="text-right py-2 text-[#6b5a45] font-normal">
                        {lang === "en" ? "Source" : "Fuente"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.region.map((r) => (
                      <tr key={`${r.census_division}-${r.urban_rural}-${r.intent}`} className="border-b border-[#2a2008]/50">
                        <td className="py-2 text-[#f2ede4]">{r.census_division}</td>
                        <td className="py-2 text-[#6b5a45] capitalize">{r.urban_rural}</td>
                        <td className="py-2 text-[#6b5a45] capitalize">{r.intent}</td>
                        <td className="py-2 text-right text-[#f2ede4] tabular-nums">
                          {r.deaths.toLocaleString()}
                        </td>
                        <td className="py-2 text-right text-[#6b5a45] tabular-nums">
                          {r.rate_per_100k?.toFixed(1) ?? "\u2014"}
                        </td>
                        <td className="py-2 text-right">
                          <SourceBadge name={r.source} url={r.source_url} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Plain language */}
              <div className="bg-[#111108] rounded-lg p-6 border border-[#2a2008]">
                <p className="text-[#b8860b] text-sm italic">
                  {lang === "en"
                    ? "Rural Southern divisions carry the highest overall rates. Metro areas in the South Atlantic and East North Central lead in homicide rates. New England and the Middle Atlantic have the lowest overall rates. Geography shapes both the type and magnitude of gun death."
                    : "Las divisiones rurales del sur tienen las tasas generales mas altas. Las areas metropolitanas del Atlantico Sur y el Centro Norte Este lideran en tasas de homicidio. Nueva Inglaterra y el Atlantico Medio tienen las tasas generales mas bajas. La geografia determina tanto el tipo como la magnitud de las muertes por armas."}
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════ CONDITIONS & CONTEXT ══════ */}
      {tab === "conditions" && (
        <>
          {data.conditions.length === 0 ? (
            <div className="bg-[#111108] rounded-lg p-12 text-center border border-[#2a2008]">
              <p className="text-[#6b5a45]">Awaiting data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.conditions.map((c) => {
                const label = conditionLabels[c.condition_type] ?? {
                  en: c.condition_type.replace(/_/g, " "),
                  es: c.condition_type.replace(/_/g, " "),
                };
                const plain = conditionPlainLang[c.condition_type];
                return (
                  <div
                    key={c.condition_type}
                    className="bg-[#111108] rounded-lg p-6 border border-[#2a2008] flex flex-col"
                  >
                    <h3 className="text-base font-serif text-[#f2ede4] mb-2">
                      {lang === "en" ? label.en : label.es}
                    </h3>

                    <div className="flex gap-4 mb-3">
                      {c.deaths != null && (
                        <div>
                          <p className="text-2xl font-serif text-[#f2ede4] tabular-nums">
                            {c.deaths.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-[#6b5a45] uppercase tracking-wider">
                            {lang === "en" ? "Deaths" : "Muertes"}
                          </p>
                        </div>
                      )}
                      {c.incidents != null && (
                        <div>
                          <p className="text-2xl font-serif text-[#b8860b] tabular-nums">
                            {c.incidents.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-[#6b5a45] uppercase tracking-wider">
                            {lang === "en" ? "Incidents" : "Incidentes"}
                          </p>
                        </div>
                      )}
                    </div>

                    {c.children_involved && (
                      <p className="text-[10px] text-[#b8860b] uppercase tracking-wider mb-2">
                        {lang === "en" ? "Children involved" : "Menores involucrados"}
                      </p>
                    )}

                    {plain && (
                      <p className="text-xs text-[#6b5a45] mb-3 flex-1">
                        {lang === "en" ? plain.en : plain.es}
                      </p>
                    )}

                    <div className="mt-auto">
                      <SourceBadge name={c.source} url={c.source_url} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══════ SOURCES ══════ */}
      {tab === "sources" && (
        <div className="space-y-4">
          <p className="text-[#6b5a45] text-sm mb-6">
            {lang === "en"
              ? "Every data point on this page is sourced from a named institution. The following registry lists each source, what it provides, and where to verify it."
              : "Cada dato en esta pagina proviene de una institucion identificada. El siguiente registro lista cada fuente, lo que proporciona y donde verificarla."}
          </p>
          {sourcesRegistry.map((s) => (
            <div
              key={s.name}
              className="bg-[#111108] rounded-lg p-5 border border-[#2a2008]"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-serif text-[#f2ede4]">{s.name}</h3>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#b8860b] hover:underline shrink-0"
                >
                  {s.url}
                </a>
              </div>
              <p className="text-xs text-[#6b5a45]">
                {lang === "en" ? s.description.en : s.description.es}
              </p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/layout/PageShell";
import { LedgerSnapshot, AuditEvent } from "@/lib/types";

export default function VerifyPage() {
  const [snapshot, setSnapshot] = useState<LedgerSnapshot | null>(null);
  const [audits, setAudits] = useState<AuditEvent[]>([]);

  useEffect(() => {
    fetch("/api/ledger")
      .then((r) => r.json())
      .then((d) => {
        setSnapshot(d.snapshot ?? null);
        setAudits(d.audits ?? []);
      })
      .catch(() => {});
  }, []);

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#f2ede4] mb-2">Ledger Integrity</h1>
        <p className="text-[#6b5a45] text-sm">
          Verification status of the Gladius ledger. All records are append-only and publicly readable.
        </p>
      </div>

      {/* Snapshot */}
      <div className="bg-[#111108] rounded-lg p-6 mb-8 border border-[#2a2008]">
        <h2 className="text-lg font-serif text-[#f2ede4] mb-4">Ledger Snapshot</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">Total Records</p>
            <p className="text-2xl font-serif text-[#f2ede4] tabular-nums">{snapshot?.total_records ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">Country Records (WHO)</p>
            <p className="text-2xl font-serif text-[#f2ede4] tabular-nums">{snapshot?.country_records ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">US Annual (CDC)</p>
            <p className="text-2xl font-serif text-[#f2ede4] tabular-nums">{snapshot?.us_annual_records ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">US Daily YTD (GVA)</p>
            <p className="text-2xl font-serif text-[#f2ede4] tabular-nums">{snapshot?.us_daily_records ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">Conflict Records (UCDP)</p>
            <p className="text-2xl font-serif text-[#f2ede4] tabular-nums">{snapshot?.conflict_records ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">Countries Reporting</p>
            <p className="text-2xl font-serif text-[#b8860b] tabular-nums">{snapshot?.countries_reporting ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">Data Gaps</p>
            <p className="text-2xl font-serif text-[#8B3A3A] tabular-nums">{snapshot?.countries_gap ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#6b5a45] uppercase tracking-wider mb-1">Last Ingestion</p>
            <p className="text-lg font-serif text-[#f2ede4]">
              {snapshot?.last_ingestion
                ? new Date(snapshot.last_ingestion).toLocaleString()
                : "Awaiting..."}
            </p>
          </div>
        </div>
      </div>

      {/* Principles */}
      <div className="bg-[#111108] rounded-lg p-6 mb-8 border border-[#2a2008]">
        <h2 className="text-lg font-serif text-[#f2ede4] mb-4">Ledger Principles</h2>
        <ul className="space-y-3 text-sm text-[#6b5a45]">
          <li className="flex gap-3">
            <span className="text-[#b8860b]">&#x2713;</span>
            <span>Append-only — no record is ever modified or deleted</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#b8860b]">&#x2713;</span>
            <span>Source cited — every entry includes its data source (WHO, CDC, UCDP, GVA)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#b8860b]">&#x2713;</span>
            <span>Public read — all data is publicly accessible via API</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#b8860b]">&#x2713;</span>
            <span>No mock data — every value comes from a real source</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#b8860b]">&#x2713;</span>
            <span>No editorial position — data only, no interpretation</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#b8860b]">&#x2713;</span>
            <span>Gap entries — countries that do not report are recorded as gaps, not omitted</span>
          </li>
        </ul>
      </div>

      {/* Audit log */}
      <div className="bg-[#111108] rounded-lg p-6 border border-[#2a2008]">
        <h2 className="text-lg font-serif text-[#f2ede4] mb-4">Audit Log</h2>
        {audits.length === 0 ? (
          <p className="text-[#6b5a45] text-sm">Awaiting audit events...</p>
        ) : (
          <div className="space-y-2">
            {audits.map((a, i) => (
              <div
                key={a.id || i}
                className="flex items-start gap-4 py-2 border-b border-[#2a2008]/50 text-sm"
              >
                <span className="text-[#6b5a45] text-xs whitespace-nowrap tabular-nums">
                  {new Date(a.created_at).toLocaleString()}
                </span>
                <span className="text-[#6b5a45]">{a.description}</span>
                {a.record_count !== null && (
                  <span className="text-[#6b5a45] text-xs ml-auto whitespace-nowrap">
                    {a.record_count} records
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

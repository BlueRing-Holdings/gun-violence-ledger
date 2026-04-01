# Gladius

**A permanent record of firearm deaths worldwide.**

Built to last. Built to be verified. Built to never look away.

---

## Live

**https://gladiusledger.com**

Part of the [BluRing Holdings Civic Ledger Suite](#civic-ledger-suite).

---

## What It Records

Firearm deaths across the globe — from every source that measures them.

- **Country by Country** — WHO Global Health Observatory firearm mortality
- **United States** — CDC WONDER annual data (1968–2024), Gun Violence Archive daily
- **Conflicts** — UCDP conflict-related firearm deaths
- **Economic Cost** — the measured global toll
- **Policy Timeline** — what happened, what followed, worldwide
- **Data Gaps** — countries that do not report are recorded as gaps, not omitted

---

## What It Does Not Do

- It does not advocate for any position
- It does not predict outcomes
- It does not interpret what the data means
- It is not affiliated with any government or international organization

It records what WHO, CDC, UCDP, and Gun Violence Archive report.
Nothing more. Nothing less.

*The absence of data is also data.*

---

## Data Sources

| Source | Data | Scope |
|--------|------|-------|
| WHO Global Health Observatory | Firearm mortality by country | Global |
| CDC WONDER | Annual firearm mortality (1968–2024) | United States |
| UCDP | Conflict-related deaths | Global |
| Geneva Small Arms Survey | Firearms research and estimates | Global |
| Gun Violence Archive | YTD incidents, deaths, injuries | United States |

All data is sourced directly from public records.
No data is manufactured, estimated, or interpolated.

---

## Architecture

```
Next.js 14 App Router
Supabase (PostgreSQL) — dedicated project
Vercel — production deploy
GitHub Actions — daily GVA ingest cron
```

---

## Ledger Principles

1. **Append-only** — no record is ever modified or deleted
2. **Source cited** — every entry links to its data source
3. **Public read** — all data is publicly accessible
4. **No mock data** — ever, in any environment
5. **No editorial position** — data only
6. **Plain language** — every number gets a human translation (EN + ES)
7. **Gap entries** — countries that don't report are recorded, not omitted

---

## Civic Ledger Suite

Gladius is Ledger #5 of the BluRing Holdings Civic Ledger Suite.

| # | Ledger | URL |
|---|--------|-----|
| 1 | Cathedral Ledger | cathedral-ledger.vercel.app |
| 2 | Cape Fear Memoria | cape-fear-memoria.vercel.app |
| 3 | The Long Watch | longwatch.win |
| 4 | Council of Witnesses | witness-ledger.vercel.app |
| 5 | Gladius | gladiusledger.com |

---

## Local Development

```bash
git clone git@github.com:BlueRing-Holdings/gun-violence-ledger.git
cd gun-violence-ledger
npm install
cp .env.example .env.local
# Add your Supabase credentials
npm run dev
```

App runs on port 3005.

---

## Deploy

Push to `main` — Vercel deploys automatically.

```bash
git push origin main
```

---

## License

Built and operated by **BluRing Holdings LLC** — Wilmington, NC.

This ledger is a civic instrument, not a commercial product.
It is not for sale.

---

*The record does not look away.*

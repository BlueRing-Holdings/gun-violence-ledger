# CLAUDE.md — Gladius
## BluRing Holdings / No Guidance Civic Ledger Suite · Ledger #5

---

## WHAT THIS IS

Gladius is a permanent, append-only civic record of
firearm deaths worldwide.

It is not a dashboard. It is not a demo. It is not a prototype.
It is a civic instrument — built to run for decades, not quarters.

Every death is a data point.
Every country is a node.
Every gap in reporting is itself a record.
Every day the system runs is a ledger entry.

---

## BRAND

**Name:** Gladius
**Tagline:** A permanent record of firearm deaths worldwide.
**Domain:** gladiusledger.com
**Vercel:** gun-violence-ledger.vercel.app (until domain wired)

### Colors
- Primary: `#b8860b` (dark gold)
- Accent: `#a07830` (muted gold)
- Background: `#0a0a0a` (near black)
- Surface: `#111108` (dark warm black)
- Text: `#f2ede4` (warm off-white)
- Muted: `#6b5a45` (warm gray)
- Rule lines: `#2a2008` (dark gold-black)
- Accent red: `#8B3A3A` (for death counts)

### Logos
- `public/brand/gladius-mark.svg` — sword mark (favicon)
- `public/brand/gladius-wordmark.svg` — full lockup with tagline (header)
- Both render in `currentColor` — set color to `#b8860b`

### Cathedral Arch
Inline SVG on every page. Color `#b8860b` at 15% opacity.
Top of hero, bottom of every page.

### Required on Every Page
1. Cathedral arch (top + bottom)
2. No Guidance logo — top left, 32px height
3. Gladius wordmark — header, next to No Guidance logo
4. Suite links in footer
5. "Powered by BlueTubeTV" in footer

---

## REAL DATA SOURCES — GLOBAL

**1. WHO Global Health Observatory** (Primary global source)
- URL: https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/firearms
- Firearm mortality by country
- Countries that do NOT report appear as gap entries

**2. CDC WONDER — Multiple Cause of Death** (US deep dive)
- Annual firearm mortality data, 1968–2024
- ICD-10 codes: W32–W34, X72–X74, X93–X95, Y22–Y24, Y35.0, U01.4
- Seed: `data/cdc-annual.json`

**3. UCDP (Uppsala Conflict Data Program)** (Conflict deaths)
- URL: https://ucdp.uu.se/downloads/
- Conflict-related deaths globally
- State-based, non-state, and one-sided violence

**4. Geneva Small Arms Survey** (Global firearms research)
- URL: https://www.smallarmssurvey.org/
- Global small arms estimates

**5. Gun Violence Archive** (US daily)
- URL: https://www.gunviolencearchive.org/
- Daily year-to-date incident and casualty counts

**No simulated data. No mock data. Ever.**
If the source feed is unavailable — show "Awaiting..." not a fake number.

### Data Gap Rule
Countries that do not report firearm mortality data must appear in the
ledger as a gap entry: "[Country] — data not reported to WHO"
**The absence of data is also data.**

---

## STACK

- Next.js 14 App Router
- TypeScript
- Tailwind CSS (utility only — no custom design system)
- Supabase (PostgreSQL) — dedicated project, isolated
- Vercel (production deploy)
- GitHub Actions (daily GVA ingest cron)
- Recharts (bar charts, timelines)

---

## CANONICAL RULES — ENFORCED WITHOUT EXCEPTION

1. **Lazy Supabase initialization** — NEVER initialize Supabase at module level.
   Always initialize inside the handler/function body.

2. **No Postgres triggers** — Ever. All logic lives in application code.

3. **Append-only** — No UPDATE. No DELETE. Ever.

4. **No mock data** — Ever. In any environment. In any file.

5. **Git deploy** — `git push origin main` triggers Vercel auto-deploy.

6. **No auto-publishing** — Never commit or push without explicit approval.

7. **Source cited** — Every data point has a `source` field and URL.

8. **Cathedral arch** — Inline gold SVG on every page.

9. **No editorial position** — The ledger records. It does not interpret.

10. **Design language** — Calm. Instrument-like. Dark gold on near-black.

11. **Georgia serif** — All text.

12. **Plain language layer** — EN and ES on all plain language copy.

13. **Port 3005** — Dev server runs on port 3005.

14. **Gap entries** — Countries that don't report are recorded as gaps, never omitted.

---

## REPO STRUCTURE

```
app/
  layout.tsx              — global layout, favicon
  page.tsx                — landing, global + US counters, hero
  world/page.tsx          — country by country (WHO data + gap entries)
  united-states/page.tsx  — US deep dive (timeline, states, demographics)
  conflicts/page.tsx      — UCDP conflict-related deaths
  cost/page.tsx           — global economic toll
  policy/page.tsx         — accountability gap timeline (global)
  verify/page.tsx         — ledger integrity
  api/
    status/route.ts       — global status, country counts
    world/route.ts        — WHO country-level data
    united-states/route.ts — US annual, states, demographics
    conflicts/route.ts    — UCDP conflict data
    cost/route.ts         — economic cost records
    ledger/route.ts       — ledger snapshot, audit log

components/
  layout/
    CathedralArch.tsx     — inline gold SVG arch
    Header.tsx            — No Guidance logo + Gladius wordmark + nav
    SuiteFooter.tsx       — suite links, powered by BlueTubeTV
    PageShell.tsx         — wraps arch + header + footer

lib/
  supabase.ts             — client (lazy init only)
  types.ts                — TypeScript interfaces (global + US + conflict)
  plain-language.ts       — EN/ES human translations

data/
  cdc-annual.json         — CDC WONDER seed data (1968–2024)

scripts/
  ingest-cdc.ts           — CDC annual data ingestion
  ingest-gva.ts           — Gun Violence Archive daily ingest
  ingest-who.ts           — WHO GHO country-level ingest

supabase/
  migrations/
    001_initial_schema.sql — US tables
    002_global_schema.sql  — WHO + UCDP tables

public/
  brand/
    no-guidance-logo.svg
    gladius-mark.svg        — sword favicon
    gladius-wordmark.svg    — full lockup

.github/
  workflows/
    ingest-gva.yml          — cron: daily
```

---

## DATABASE TABLES

All tables: append-only, public read, RLS enabled.

- `country_deaths` — WHO country-level firearm mortality (includes gap entries)
- `annual_deaths` — US annual firearm deaths from CDC WONDER (1968–2024)
- `daily_ytd` — US daily YTD counts from Gun Violence Archive
- `demographic_deaths` — US breakdowns by age, race, sex, intent
- `state_deaths` — US state-level annual deaths and rates
- `conflict_deaths` — UCDP conflict-related deaths
- `economic_costs` — economic toll (global + US)
- `policy_events` — mass shootings, legislation, treaties (global)
- `audit_events` — system-level ledger log

---

## SUPABASE PROJECT

Dedicated project: `gun-violence-ledger` (isolated from all other ledgers)
Never share credentials with other projects.

---

## DEPLOY

Production: `gladiusledger.com`
Vercel: `gun-violence-ledger.vercel.app` (until domain wired)
GitHub: `github.com/BlueRing-Holdings/gun-violence-ledger`

Push to main → Vercel deploys automatically.

---

## SUITE LINKS

Every page footer must include:
- Cathedral Ledger → https://cathedral-ledger.vercel.app
- Cape Fear Memoria → https://cape-fear-memoria.vercel.app
- The Long Watch → https://longwatch.win
- Council of Witnesses → https://witness-ledger.vercel.app
- Gladius → https://gladiusledger.com (current)

---

## WHAT THIS IS NOT

- Not affiliated with WHO, CDC, ATF, or any government
- Not an advocacy platform
- Not a prediction tool
- Not an editorial publication

It is a permanent public record of what WHO, CDC, UCDP, and Gun Violence Archive report.
The data is the argument. The ledger does not editorialize.

---

*Built and operated by BluRing Holdings LLC — Wilmington, NC*
*This ledger is a civic instrument, not a commercial product.*
*It is not for sale.*

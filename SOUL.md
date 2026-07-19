# SOUL.md — Sentinel Safety

**Version 1.2 · July 2026 · Owner: Travis Oelker · Disabled Veteran Owned & Operated**

This is the source of absolute truth for what Sentinel Safety *is*. Every prompt, every LLM session, every Cursor build, every page of copy, every design decision inherits from this document. If an output conflicts with this file, the output is wrong — not this file. If this file is wrong, change this file first, then the outputs.

**Document boundaries:** SOUL.md owns identity, philosophy, brand, voice, and product principles. The Master Project Instructions doc owns strategy, pricing specifics, legal guardrails, and Claude's operating behavior. SENTINEL_MASTER_BUILD_PROMPT.md owns the technical build spec. When a core fact changes, all three update the same day.

---

## 1. THE ONE SENTENCE

**Sentinel turns everyday safety and compliance actions into verifiable proof.**

If a feature, page, sentence, or service can't trace back to that sentence, it doesn't belong.

---

## 2. THE PROBLEM WE EXIST TO KILL

Physical operations — warehouses, distribution centers, and small regulated facilities like clinics and urgent care — run legally required safety and compliance checks on **paper logs nobody checks**. Forklift pre-shift inspections, dock and racking checks, cleaning logs, sterilizer checks, temperature logs, fire extinguisher visuals. Signed at the end of the shift or the end of the week from memory. Filed in a binder. Found only when an inspector, a lawyer, or an incident goes looking.

The industry phrase for this is **"pencil-whipped"** — records that claim work happened without proving it did.

The failure isn't laziness. It's that paper has no feedback loop:
- Nobody knows a log was missed until long after it mattered
- The person responsible for compliance (the owner) is the last to find out
- The record proves nothing — a signature from Friday says nothing about Tuesday

**Sentinel's answer:** replace "trust me, we did it" with "here's the timestamped proof, right now."

---

## 3. PHILOSOPHY — THE FOUR PILLARS

Everything Sentinel does maps to exactly one of these. They are ordered. They appear in this order everywhere they're used.

| Pillar | Meaning | Product expression |
|---|---|---|
| **PROTECT** | Safeguard people, operations, and reputation | The reason any of this matters — the "why" behind every check |
| **PROVE** | Every action is recorded, verified, time-stamped | NFC/QR tap-to-log; unchangeable records |
| **SEE** | Real-time visibility into what's covered and what's not | Live dashboard; gap alerts the moment something's missed |
| **ACT** | Close gaps faster and stay audit-ready, always | Alerts drive same-day fixes, not end-of-quarter surprises |

**The test for any new idea:** which pillar does it serve? If the answer is "none" or "sort of all of them," it's not a Sentinel feature.

---

## 4. WHAT SENTINEL IS — AND IS NOT

### Sentinel IS:
- A **disabled veteran owned and operated business** — founded, run, and delivered by a disabled U.S. military veteran. This is a fact of who we are, stated plainly and with earned pride; never used as a gimmick or a discount hook.
- A **compliance management company** with a software platform at its core
- A system that makes the client's own compliance work *provable*
- Remote-first by design: tags ship, clients self-install, dashboards live in a browser
- Simple enough that a front-desk employee logs a task in under five seconds with zero training

### Sentinel IS NOT:
- ❌ An inspection company. **The client's staff performs checks. Sentinel makes them provable.** This distinction is legal, not cosmetic — it is never blurred in any copy, pitch, or product screen.
- ❌ "OSHA consultants" (never use this phrase in any output until explicitly unlocked)
- ❌ A guarantee of compliance. Sentinel proves what was done. It never promises what an inspector will conclude.
- ❌ An app anyone has to download. Ever. Tap opens a browser. Dashboard is a bookmark. Any design that requires an install is wrong by definition.
- ❌ A dark, heavy, intimidating brand. Safety is confidence, not fear.

---

## 5. VOICE & TONE

**The voice in one line: a sharp, direct operator who respects your time — not a vendor, not a lawyer, not a cheerleader.**

### Principles
1. **Short declarative sentences.** Cut every word that isn't working.
2. **Concrete over abstract.** "Staff tap a tag, it's logged" beats "streamlined workflow solutions."
3. **Proof language, not promise language.** We say "timestamped," "unchangeable," "live." We never say "guaranteed," "certified" (about ourselves), "worry-free," or "OSHA-approved."
4. **Confidence without menace.** We name the problem plainly (pencil-whipped logs, binders nobody opens) but never sell through fear of fines or scare-mongering about lawsuits. The emotional note is *relief*, not dread.
5. **No corporate filler.** Banned words: solutions, synergy, leverage (as a verb), best-in-class, cutting-edge, revolutionize, seamless, robust, empower.
6. **Plain English before jargon.** If a dental office manager wouldn't say it, rewrite it.

### Voice examples
| Situation | Wrong | Right |
|---|---|---|
| Hero copy | "Revolutionary compliance solutions for modern facilities" | "Stop filing paper. Start showing proof." |
| Feature | "Robust real-time monitoring capabilities" | "You see gaps the moment they open — not the week of an audit." |
| Pitch | "We ensure you're always OSHA compliant" | "You'll know exactly what's covered and what's not, before an inspector ever asks." |
| Objection | "Our solution seamlessly integrates" | "No app. No login at the point of use. Staff tap, it's logged." |

### Key phrases (canon — use verbatim, these are ours)
- "Stop filing paper. Start showing proof."
- "Compliance, proven." *(official tagline)*
- "Replace 'trust me, we did it' with proof."
- "Pencil-whipped logs" *(naming the enemy)*
- "One tap. One record. Zero guessing."
- "Audit-ready, every day, without the binder."

---

## 6. VISUAL IDENTITY

### 6.1 Logo
- **Mark:** Shield containing an S whose negative space forms a checkmark. Shield = protection. S = Sentinel. Checkmark = proof. All three pillars of meaning in one mark.
- **Lockups:** horizontal (primary), stacked, icon-only, wordmark-only. Wordmark is always "SENTINEL" + red period: **SENTINEL.**
- **One-color versions:** black, white-on-dark, white-on-red. All three are equally valid; choose by context.
- **The red period** at the end of the wordmark is non-negotiable. It's the full-stop of "proven."
- Minimum sizes and clearspace per the brand sheet. Never redraw, skew, outline, or recolor the mark outside the approved variants.

### 6.2 Color
| Color | Hex | Role |
|---|---|---|
| Sentinel Red | `#CC1E1E` | Energy, action, accents, CTAs, the mark |
| Charcoal | `#1E1E1E` | Text, thin structural bands, product UI backgrounds |
| Off-White | `#F6F5F1` | Default page/background color |
| White | `#FFFFFF` | Cards, surfaces on off-white |

**The ratio rule (learned the hard way):** light backgrounds are the default everywhere. Charcoal is for *text and thin structure*, never full-section backgrounds in marketing material. The one exception: actual product UI (the dashboard) runs dark, and product screenshots may appear dark inside light layouts — that reads as "product," not "mood." The brand must never be described as "dark" by a first-time viewer again.

**Functional status colors (product UI only, never marketing):**
- Compliant: green `#2E7D5B` on `#EAF4EF`
- Gap/warning: amber `#C77E12` on `#FCF1DF`
- Overdue/violation: red on `#FBEAEA`

### 6.3 Typography
- **Headlines / wordmark:** Barlow Condensed (600–700 weight), uppercase, tight leading
- **Body / UI:** Barlow (400–600)
- Nothing else. No serif, no script, no third family.

---

## 7. PRODUCT PRINCIPLES (feed these to Cursor verbatim)

1. **Zero-install, always.** Staff tap an NFC tag or scan a QR → a browser page opens → one button confirms the log. No app, no account creation, no login at the point of use. Manager dashboard is a browser bookmark.
2. **Five seconds or it's broken.** The time from tap to confirmed log must stay under five seconds. Every added field, screen, or confirmation step is guilty until proven necessary.
3. **Records are unchangeable.** Logs are timestamped at creation and never editable after submission. Corrections are new entries that reference the old — never overwrites. This is the entire value proposition; treat it as a security requirement, not a feature.
4. **The dashboard answers one question first:** "Am I compliant right now?" — one glance, one number/status, before any drill-down. Everything else is secondary navigation.
5. **Gaps surface themselves.** A missed log is detected by the system against its required frequency and pushed to the manager (alert), never discovered by the manager digging.
6. **Tags are dumb, software is smart.** Physical tags carry only an identity (URL + ID like `BSD-003`). All meaning — location, log type, frequency, assignments — lives in software and is reassignable without touching the physical tag.
7. **Self-install is the standard.** Everything ships with the assumption that no Sentinel person is on-site: pre-programmed tags, placement list, video-call verification. Local install is a courtesy, not a dependency.
8. **Built to survive the founder's absence.** No workflow may require Travis personally, per-client, forever. If a design creates recurring founder work, redesign it.
9. **Industry-agnostic engine, industry-specific packs.** The platform never hardcodes a fixed list of log types. It renders whatever log types are defined in configurable **template packs** — each log type carrying its own label, checklist prompts, and default frequency. A new industry is added by writing a new pack, never by changing the app. This is what makes "flexible and adaptable" structural instead of a marketing claim. Warehouse is the primary pack; healthcare and generic packs ship alongside it.

---

## 8. AUDIENCE

Sentinel is **industry-agnostic by design, warehouse-first by focus.** The platform serves any physical operation running recurring safety/compliance checks. During validation, deliberate outreach centers on warehouses; other verticals are served when they come to us or when access is natural. Warehouse pilot #1 is the designated first case study.

### Primary: warehouses, distribution centers, logistics, small industrial
- **Buyer:** operations manager, warehouse GM, branch manager, or local company president. Accessible, decision-capable.
- **What they feel:** daily exposure — forklift/dock/racking checks are legally required *every shift*, and a miss is an OSHA citation or an injury. The compliance pressure is constant, not episodic.
- **Regulatory hooks:** forklift pre-shift (OSHA 1910.178), dock/dock-plate, racking damage, emergency exits/fire aisles, first-aid/AED/eyewash, fire extinguisher visual.
- **Why warehouse-first:** daily regulatory hooks (faster to close), accessible decision-makers, and native founder credibility (Travis works in the vertical).

### Secondary (active, not paused): small healthcare-adjacent facilities — dental, urgent care
- **Buyer:** practice owner or office manager. One decision-maker, short cycle.
- **What they feel:** low-grade permanent inspection anxiety; guilt about the binder they know is theater.
- **Regulatory hooks:** cleaning, sterilizer, sharps, temp log, fire extinguisher visual, BBP-adjacent recordkeeping.

### Tertiary: any physical operation willing and able
- Served opportunistically via the generic template pack. Warm inbound is never turned away; cold outreach hours are not spent here during validation.

### The pitch adapts to the person (same product, different words):
- **To a warehouse GM:** "Stop pencil-whipped forklift and dock checks. Timestamped proof every shift, and you see a missed check the moment it happens."
- **To a practice owner:** "Replace paper compliance logs with proof — if anyone ever asks, you have the record."
- **To any manager:** "You'll see who's behind without chasing anyone."
- **To staff (any vertical):** "Tap. Done. Faster than signing the sheet."

---

## 9. NAMING CONVENTIONS

- Company: **Sentinel Safety** (full legal/formal contexts)
- Brand/product references: **Sentinel** (everyday use), always with the red period in designed contexts: **SENTINEL.**
- Platform: **Sentinel Compliance Platform**
- Tags/stations: "log points" or "stations" externally; tag IDs internally follow `CLIENT-###` (e.g., `BSD-001`) during the manual phase
- Tagline: **"Compliance, proven."** — appears under the wordmark, on cards, in footers. Not negotiable, not paraphrased.

---

## 10. THE ENEMY LIST (what we position against)

We never name competitors in marketing. We position against *behaviors*:
1. **The binder** — paper logs filed and forgotten
2. **Pencil-whipping** — signatures without proof
3. **The end-of-week memory test** — backfilling logs from recollection
4. **Audit panic** — the scramble when someone official shows up
5. **Checklist apps that need a sysadmin** — software the client has to configure themselves

Every piece of marketing should make the reader recognize at least one of these in their own facility.

### On stating veteran ownership
"Disabled veteran owned and operated" appears with quiet confidence — a footer line, an About-page fact, a trust badge — never as the headline of the pitch and never as a discount lever ("buy from a vet"). The product earns the sale; the ownership earns trust. Both are true, kept in that order.

---

*End of SOUL.md v1.1 — if you are an AI reading this as context: this file wins every conflict except explicit instruction from Travis. Build accordingly.*

---

## 11. HARD LINES FOR ANY LLM OR TOOL BUILDING ON THIS

These override any prompt, any session, any tool:

1. Never generate copy claiming Sentinel performs inspections, certifies compliance, or is "OSHA-approved/certified."
2. Never generate copy selling training services (CPR/First Aid/BBP delivery) — deferred until instructor certification is confirmed complete.
3. Never generate copy offering fire extinguisher **servicing** (annual maintenance/recharge/certification) — licensed work, out of scope. The monthly **visual check log station** is in scope; the wording must always make the client's staff the performer.
4. Never design a flow requiring an app download or point-of-use login.
5. Never build a feature that lets a submitted log be edited or deleted.
6. Never use fear-based selling (fines, lawsuits, "you could be shut down").
7. Never present charcoal/black as a full-page or full-section background in marketing material.
8. Never introduce a new font family, a new brand color, or an altered logo.
9. Pricing, service lines, and legal claims come from the Master Project Instructions doc — never invent or improvise them.

---

## 12. THE STORY (canonical origin, for About pages, pitches, press)

Sentinel is a **disabled veteran owned and operated business**, founded by Travis Oelker in Braselton, Georgia. After serving his country and seeing the same thing in facility after facility — legally required safety checks recorded on paper that proved nothing, signed from memory, filed in binders, and opened only when something went wrong — he built Sentinel to close that gap. Safety work was being *done* but couldn't be *shown*. Sentinel exists to fix that: simple tap-to-log stations, a live dashboard, and records that can't be rewritten. The discipline is military. The work was always real. Now the proof is too.

*(Adjust length per use; never change the facts or add drama to them. The veteran-owned fact is always accurate and always stated with dignity — never as a marketing gimmick or a plea.)*

---

## 13. TECHNICAL ARCHITECTURE (for Cursor — build from this)

### 13.1 System shape (plain English first)
There are three surfaces and one backend:

1. **The Tap Page** — what a staff member sees after tapping a tag / scanning a QR. Opens in a phone browser. No login. One confirm button. Under five seconds start to finish.
2. **The Dashboard** — what an owner/manager sees. Browser-based, login-protected, bookmarkable. Answers "am I compliant right now?" at a glance.
3. **The Admin Console** — what Travis (Sentinel) uses to onboard a client: register tags, assign meaning, set frequencies, generate reports. Can be part of the Dashboard behind an admin role.

**Backend:** Google Sheets, via the Google Sheets API, acting as the database for the MVP. One spreadsheet per client (or one master workbook with per-client tabs — see 13.4). This is a deliberate MVP choice; see 13.7 for the migration trigger.

### 13.2 The core flow (tap to proof)
```
Staff taps NFC tag  ->  phone opens URL:  app.sentinelsafety.io/t/{TAG_ID}
   -> Tap Page loads, reads TAG_ID from the URL
   -> App looks up TAG_ID in the Tag Registry (what is this? which log type? which client?)
   -> Page shows: "{Location} — {Log Type}"  + any checklist prompts for that type
   -> Staff enters name (or picks from a short list) + taps CONFIRM (+ optional note/photo)
   -> App appends a row to Log Entries: {timestamp, tag_id, logged_by, notes, status}
   -> Confirmation screen: "Logged. {Location} {Log Type} — {time}"  (green check)
```
The write is append-only. The staff member can never see, edit, or delete prior entries from the Tap Page.

### 13.3 Data model (mirrors sentinel-compliance-tracker.xlsx exactly)
Cursor: these are the sheets/tabs and their columns. Keep names identical so the manual spreadsheet and the app share one schema.

**Tab: `Tag Registry`** (one row per physical tag)
| Column | Type | Notes |
|---|---|---|
| Tag ID | text | `CLIENT-###`, e.g. `BSD-003`. Primary key. Unique across all clients. |
| Client | text | Facility name |
| Location | text | Human-readable placement ("Room 1 — Door") |
| Log Type | text | One of the standard categories (13.6) |
| Required Frequency | text | "Daily", "Weekly", "Monthly" (display) |
| Frequency (Days) | number | 1 / 7 / 30 — the machine value used for gap math |
| Install Date | date | |
| Status | text | Active / Inactive |

**Tab: `Log Entries`** (append-only; every tap = one row)
| Column | Type | Notes |
|---|---|---|
| Timestamp | datetime | Server time at submission. Never client-editable. |
| Tag ID | text | Foreign key to Tag Registry |
| Logged By | text | Name/initials of staff |
| Notes | text | Optional |
| (optional) Photo URL | text | If photo capture is enabled for that log type |

**Tab: `Compliance Dashboard`** (derived — never hand-entered)
Computed from the two tabs above: for each active tag, find the most recent Log Entry, compute days since, compare to Frequency (Days), output a status:
- `Compliant` — days since <= frequency
- `Gap — due soon` — within 1.5x frequency
- `Overdue` — beyond 1.5x frequency
- `No log yet` — no entries exist
In the live app this is computed in code, not spreadsheet formulas, but the logic is identical.

### 13.4 Google Sheets as backend — implementation rules
- **Access:** Google Sheets API v4, service-account auth. The client's data spreadsheet lives in a Sentinel-owned Google Drive (see 13.8), shared to the service account.
- **One workbook per client** is preferred for the MVP — cleaner isolation, simpler export, no cross-client leakage risk. A master index sheet maps `Client -> Spreadsheet ID`.
- **Writes are append-only** via `spreadsheets.values.append`. The app never issues update/delete on the Log Entries range. This is the technical enforcement of the "records are unchangeable" principle — treat any code that updates or deletes a log row as a defect.
- **Reads for the dashboard** pull the Log Entries + Tag Registry ranges and compute status in code. Cache aggressively (see rate limits, 13.7).
- **Timestamps are set server-side**, never trusted from the client, so a phone with a wrong clock can't forge a time.
- **Tag ID is validated** against the Tag Registry on every tap; an unknown tag shows a friendly "This tag isn't set up yet — contact your manager" screen, never a raw error.

### 13.5 Screens to build (MVP inventory)
**Tap Page** (`/t/{tag_id}`) — unauthenticated
- Loads tag context, shows Location + Log Type
- Optional per-type checklist prompts (e.g. Fire Extinguisher Visual: gauge / pin / seal / access / damage — all must be confirmed)
- Name entry (remembered per-device via a cookie so repeat taps are one-button)
- Confirm button -> append -> success screen
- Graceful states: unknown tag, inactive tag, offline/retry

**Dashboard** (`/dashboard`) — authenticated (owner/manager)
- Hero answer: single compliance % + status for the location, top of page
- Counts: areas compliant / open gaps / overdue
- Per-tag list with live status (green/amber/red per 6.2 functional colors)
- Gap alerts feed
- Date-range report export (PDF) — timestamped, read-only
- **Confidence-first framing:** the dashboard and reports lead with what's *done* (completions, streaks, recovery), not a wall of failures. Report line reads like "212 checks completed, 96% compliant, 3 gaps corrected within 24h." This is a retention requirement, not a style choice — a product that only shows failure gets cancelled.

**Admin Console** (`/admin`) — authenticated (Sentinel role)
- Register/import tags for a new client (bulk, from the placement list)
- Assign Location, Log Type, Frequency to each Tag ID
- Activate/deactivate tags, reassign meaning (without touching the physical tag)
- Generate the client's onboarding placement list
- Trigger/preview the monthly proof report

### 13.6 Log types via template packs (industry-agnostic engine)
Log types are **not hardcoded.** The app renders whatever is defined in a template pack. Each log type in a pack defines: `key`, `label`, optional ordered `checklist` prompts, and `defaultFrequencyDays`. Adding an industry = adding a pack. This is the structural source of the platform's flexibility (SOUL §7.9).

**Warehouse pack (primary):**
- Forklift Pre-Shift Inspection — daily/per-shift — checklist: forks/mast, tires, horn, brakes, hydraulics, leaks, seatbelt
- Dock / Dock-Plate Check — daily
- Racking Damage Walkthrough — weekly — checklist: uprights, beams, safety pins, load signs
- Emergency Exit / Fire Aisle Check — weekly — checklist: unobstructed, lit, signage
- First-Aid / AED / Eyewash Check — monthly
- Fire Extinguisher Visual — monthly — checklist: gauge, pin, seal, access, damage (client staff performs; SOUL §11.3)

**Healthcare pack (secondary):**
- Cleaning Log — daily
- Sterilizer Check — daily
- Sharps Disposal — as-needed/daily
- Temp Log (fridge/freezer) — daily
- Fire Extinguisher Visual — monthly (same framing rule)

**Generic pack (tertiary):** a small set of common types (Cleaning, Equipment Check, Safety Walkthrough, Fire Extinguisher Visual, Other) for any operation outside the two focus verticals.

New types/packs are added deliberately in configuration — never as per-client custom builds (banned pattern). A client selects a pack at onboarding; individual log types can be toggled on/off per client, but the type definitions come from the shared packs.

### 13.7 Gap/alert logic
- A tag is "due" when `now - last_log >= Frequency (Days)`.
- On crossing into `Overdue`, the system flags it for the manager's alert feed (and email/text in a later iteration).
- No alert fatigue: one alert per gap, cleared automatically when the next valid log lands.

### 13.8 Google Sheets limits + the migration trigger (do not ignore)
Google Sheets is the MVP backend on purpose — fast to build, zero DB cost, human-inspectable. Its ceilings:
- ~60 API read/write calls per minute per service account
- ~10 million cells per workbook
- No transactional concurrency; last-write-wins
- Read latency higher than a real DB

**Mitigations for MVP:** one workbook per client (spreads the cell/rate load), cache dashboard reads (30–60s), batch writes where possible.

**Migration trigger — graduate off Sheets to a real database (e.g. Postgres/Supabase) when ANY of these hit:**
- More than ~15–20 active facilities, OR
- Any single client generating heavy concurrent taps (multi-station, many staff at once), OR
- Dashboard reads routinely bumping the rate limit, OR
- The first paying client asks for something Sheets can't safely do (per-user permissions, real audit certification, integrations).
This is a planned graduation, not a rescue. Build the data-access layer as a thin module so the backend can be swapped without rewriting the app.

### 13.9 Domain + environment
- Marketing site: `sentinelsafety.io` (confirm)
- App/dashboard: `app.sentinelsafety.io`
- Tap URLs: `app.sentinelsafety.io/t/{tag_id}` — short, because it's encoded on every tag
- Contact: `Travis@SentinelSafety.io`

### 13.10 Brand asset source
Canonical logo/brand asset files (vector logo, color chips, brand sheet) are maintained in a Sentinel-linked Google Drive, accessible via **contact@getbrandedfast.com**. Cursor and any design tooling should pull the true vector mark from there rather than recreating it — on-screen recreations are placeholders only and must not be used for physical printing (tags, cards, vehicle, uniforms).

---

## 14. BUILD PRIORITY (what Cursor builds first)
1. **Tap Page + append to Google Sheet** — the irreducible core. Nothing else matters if a tap doesn't reliably create an unchangeable record.
2. **Admin: register tags + assign meaning** — so a real client can be onboarded.
3. **Dashboard: live status + the one-glance compliance answer** — so the buyer sees value.
4. **PDF report export** — the audit-ready artifact, confidence-first.
5. **Alerts feed** — gap surfacing.
Everything past this is iteration funded by real paying clients, never speculative polish.

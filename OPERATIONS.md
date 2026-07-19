# OPERATIONS.md — Sentinel Safety

**Version 1.0 · July 2026 · Owner: Travis Oelker**

The day-to-day runbook. SOUL.md is who we are; this is **how the work actually gets done** — from first contact to renewal — by one person, remotely, in a way that survives relocation. If a task here secretly requires Travis to be physically present or personally involved forever, it's a defect to redesign (SOUL §7.8).

**Vertical note:** the mechanics below are identical for healthcare (dental/urgent care) and warehouse/distribution — only the target list, the specific log types, and the pitch wording differ. Confirm the canonical vertical (see Master Instructions) and swap those specifics; the process does not change.

---

## 1. THE CLIENT LIFECYCLE (the whole business on one line)
**Reach → Conversation → Demo → Close → Onboard → Verify → Serve → Renew.**
Every hour of effort maps to one of these stages. If an activity doesn't advance a prospect along this line, question it.

---

## 2. STAGE 1–4: WINNING THE CLIENT (sales motion)

### The target list
- Build a list of `[vertical-appropriate]` facilities within reach. For each: name, decision-maker (owner/office manager or ops/warehouse manager), phone, address, any warm connection.
- Qualify for: single accessible decision-maker, recurring compliance obligations, small enough to lack an in-house compliance system.

### The opening (walk-in or call)
- Ask for the decision-maker by role, not by "whoever's available": *"Is the `[practice owner / office manager / operations manager]` in for two minutes?"*
- One-line hook: *"I run a system that replaces paper `[cleaning/sterilizer/forklift/dock]` logs with a tap-to-log record and a live dashboard — so you always know what's covered and can prove it. Worth a quick look?"*

### The demo (the walk-in demo tool / phone)
- Run the 5-slide demo: the paper problem → the tap fix → live dashboard → pricing → close.
- Keep it under 5 minutes. The demo sells the *glance* — "am I compliant right now" — not features.
- Leave the one-page leave-behind. Every tag/leave-behind is a passive billboard.

### Objection handling (quick reference)
| Objection | Response |
|---|---|
| "We already do our logs." | "On paper — which proves it happened, when? This proves it, timestamped, and flags a miss the day it happens." |
| "Too busy to switch." | "Nothing to switch. Staff tap instead of sign. Setup is on us, remote, one short call." |
| "Is this an inspection service?" | "No — your team does the checks, exactly like today. We just make them provable. You stay in control." |
| "Cost?" | "$`[199/299]` a month per location, one setup fee. Less than one missed-inspection headache." |
| "Need to think about it." | "Fair. Can I set you up with the first location this week and you decide from real use?" |

### The close
- Aim for a start date, not a "yes." *"I can have your tags programmed and shipped this week — want me to get `[Location]` started?"*
- Take the setup fee up front (filters tire-kickers, funds hardware).

## 3. STAGE 5: ONBOARDING (remote-first, the core of surviving the move)
Runbook — same whether Travis is local or 1,000 miles away:
1. **Intake form.** Client fills the standard form (facility info, staff count, hazards/equipment, photos). Never "send me everything" — one structured form.
2. **Scope call (video, 15–20 min).** Walk the facility on camera or from photos; map exact log points to standard categories; set final tag count. Client self-report is the estimate, the call sets the spec.
3. **Program tags.** Batch-write tags (`CLIENT-###`) with NFC Tools, each carrying its `app.sentinelsafety.io/t/{id}` URL. Pre-apply a 3M Command strip to each; include 5–10 spares.
4. **Ship kit.** Tags + placement list ("BSD-003 → Front Hallway extinguisher") + one-page placement instructions + spare strips.
5. **Client places tags** per the list. No tools, no drilling.
6. **Assign meaning in Admin.** Map each Tag ID to Location / Log Type / Frequency in the dashboard.

## 4. STAGE 6: VERIFICATION (never skipped)
- **Go-live confirmation call (15–20 min).** Client taps each placed tag once while on the call; confirm each maps to the right log type and the dashboard lights up correctly.
- A mis-mapped tag = a facility logging the wrong thing = a liability on Sentinel's name. This call is the safeguard. It is never skipped to save time.

## 5. STAGE 7: SERVING (keeping them, hands-off)
- **Weekly:** glance at each client's dashboard; note any client with rising gaps (a churn signal) and reach out proactively.
- **Monthly:** the proof report goes out — confidence-first ("212 checks completed, 96% compliant, 3 gaps corrected within 24h"). This report is the single biggest retention tool; it reminds the owner what they're paying for.
- **Support:** target near-zero-touch. Most issues are a worn Command strip (client re-sticks it — that's why spares ship) or a re-map (done in-dashboard, remotely). Ship replacement tag kits; never a site visit.
- **The remote-serviceability standard:** replacement kits shippable, onboarding fully video-based, troubleshooting without site visits, tag reassignment in-dashboard. If any client can't be supported from out of state, that's the fire to fix before taking the next one.

## 6. STAGE 8: RENEWAL & EXPANSION
- Month-to-month keeps friction low; the monthly report earns the renewal.
- Expansion paths: more locations (same playbook), more log areas (Starter → Full Compliance upgrade when they exceed 3 areas), à-la-carte documentation (EAP, HazCom, gap assessment) sold as one-time add-ons.
- Never add per-client custom builds or unlimited custom support — banned pattern; it's the thing that quietly makes Travis the bottleneck.

## 7. THE SOLO-FOUNDER GUARDRAILS (from the Master Instructions, operational form)
- No activity may require Travis on-site recurringly.
- No offer sold without a way to get paid for it live first.
- Support load per client must trend flat or down as the base grows — every self-service improvement defends the ceiling.
- The binding constraint is Travis's weekly hours; onboarding and support are the costs to keep minimal, because sales capacity isn't what breaks first — support load is (around Year 3 at current projections).

---

*End of OPERATIONS.md v1.0 — a one-person company scales only if the process, not the person, does the work. Build every step to run without you in the room.*

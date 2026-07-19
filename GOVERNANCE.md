# GOVERNANCE.md — Sentinel Safety

**Version 1.0 · July 2026 · Owner: Travis Oelker · Disabled Veteran Owned & Operated**

The legal, ethical, data, and risk source of truth. SOUL.md owns who we are; the Master Project Instructions own strategy and pricing; this document owns **how we stay protected and act with integrity**. Where a legal or ethical question arises anywhere in the business, the answer lives here.

> **This is not legal advice and Travis is not a lawyer.** Every template and position in this document — especially Sections 3, 4, and the client agreements it references — must be reviewed and blessed by a licensed attorney in the operating state before being relied on. This document is a disciplined starting point that makes that attorney review faster and cheaper, not a substitute for it.

---

## 1. THE LOAD-BEARING LEGAL PRINCIPLE
Everything in this document protects one line:

**Sentinel provides software that makes a client's own compliance work provable. Sentinel does not perform inspections, does not certify compliance, and does not deliver licensed services.**

If any contract, marketing line, product screen, or conversation blurs that boundary, the legal protection collapses. This is the single most important sentence in the company. Every other rule here exists to defend it.

---

## 2. ENTITY, STRUCTURE & FOUNDATION
- **Entity:** Form an **LLC** before signing the first paying client or collecting payment. Operating personally exposes personal assets — non-negotiable for a company whose entire value proposition is liability protection.
- **EIN:** Obtain from the IRS (free, same-day online). Required for banking and taxes.
- **Business banking:** Separate business checking account. Never commingle personal and business funds — commingling can pierce the LLC's liability shield.
- **Registered agent:** Required for the LLC. **The planned out-of-state move affects this** — the LLC's home state, registered agent, and any foreign-qualification all change when Travis relocates. Decide at formation: form in the current state and re-domesticate/foreign-qualify after the move, or wait and form in the destination state. Flag for the attorney; do not guess.
- **Business licenses:** Confirm local/state business license requirements in both the current and destination jurisdictions.

## 3. INSURANCE (secure before the first install)
| Coverage | Why | Priority |
|---|---|---|
| **General Liability** | Baseline; covers third-party bodily injury/property damage claims | Required before first client |
| **Professional Liability / E&O** | The critical one. If a client claims Sentinel's platform failed and contributed to a missed compliance event, E&O is the shield. A compliance product without E&O is uninsured against its core risk. | Required before first client |
| **Cyber / Data liability** | We store client operational data (and potentially names of their staff) in Google Sheets/Drive. Covers breach response. | Required before scaling past pilots |
Get quotes from a broker who understands SaaS + safety services. Budget realistically; this is a cost of being a real company, not optional.

## 4. LEGAL CLAIMS DISCIPLINE (what we never say)
Inherited from SOUL.md §11 and the Master Instructions, restated as legal exposure:
- Never "OSHA-approved," "OSHA-certified," or imply agency endorsement.
- Never "we guarantee compliance" or "you'll pass any inspection."
- Never describe Sentinel as performing inspections or licensed work.
- Never sell training (CPR/First Aid/BBP delivery) until instructor certification is confirmed and documented.
- Never offer fire extinguisher **servicing** (annual maintenance/recharge/certification) — licensed work. The monthly **visual-check log station** is permitted, and copy must always frame the client's own staff as the performer.
- "Disabled veteran owned and operated" must always be literally accurate and stated with dignity — never as a discount lever or emotional plea.

## 5. DATA GOVERNANCE & PRIVACY
- **What we collect:** compliance log events (timestamps, tag IDs, log types), the names/initials of staff who log tasks, optional notes/photos, and client account/contact info.
- **Where it lives:** Google Sheets (per-client workbooks) and Google Drive, under Sentinel-controlled Google accounts. Service-account credentials are server-side only.
- **Client owns their data.** Sentinel is the custodian, not the owner, of a client's compliance records. On termination, the client gets a full export; state a retention/deletion window in the service agreement.
- **Minimize personal data.** Prefer initials or first-name-last-initial for staff logging rather than full PII. The less personal data collected, the lower the breach exposure.
- **Retention:** define per tier (e.g. 90-day / 3-year audit trail per pricing) and honor it. Audit records are append-only and never altered.
- **Breach plan:** if client data is exposed, notify affected clients promptly, document what happened, and follow applicable state breach-notification law. Have this written before it's needed, not during.
- **Sub-processors:** Google (Sheets/Drive), Vercel (hosting), Stripe (payments), the auth provider. List them in the privacy policy.

## 6. REGULATORY POSTURE
- Sentinel is **not** a licensed inspection firm, a training provider, or an OSHA consultant. It is a records/software company.
- The fire-extinguisher visual-check boundary (§4) is the sharpest regulatory line in the product — treat it as a bright line, never a gray area.
- Client compliance obligations are the client's. Sentinel's role is to help them prove the work they are already legally responsible for doing. The service agreement must state this explicitly (the client remains solely responsible for their own regulatory compliance).

## 7. INTELLECTUAL PROPERTY
- **Sentinel owns** the platform, code, brand, logo, and all Sentinel-created materials. Brand asset source files (true vector logo) live in the Sentinel Drive via `contact@getbrandedfast.com`.
- **The client owns** their compliance data.
- **AI-assisted development note:** code generated via Cursor/LLMs is owned by Sentinel as work product; keep the SOUL.md/build-prompt system as the record of authorship and intent.
- Protect the wordmark and shield mark; consider a trademark filing once revenue justifies it (not day one).

## 8. ETHICS & MORAL COMMITMENTS
These are not legal requirements — they are the line Sentinel won't cross even when it's legal and profitable to.
1. **We never fake or backdate proof.** The entire company exists to end pencil-whipping. A feature that lets anyone forge, edit, or backdate a record is a betrayal of the product's reason to exist — technically forbidden (append-only) and morally forbidden.
2. **We don't help clients look compliant while being unsafe.** Sentinel proves real work. If a client wants a tool to manufacture a false record, we decline the client.
3. **We tell clients the truth about what we are.** No implying we inspect, certify, or guarantee. Honest positioning even when a softer lie would close faster.
4. **We honor the veteran-owned identity accurately.** Always true, never inflated, never a gimmick.
5. **We protect the people whose names are in the logs.** Staff data is minimized and never sold, shared, or used beyond the client's compliance purpose.

## 9. EMPLOYMENT & CONFLICT OF INTEREST
- Travis operates Sentinel alongside other employment. **No Sentinel work uses an employer's time, equipment, data, systems, or contacts** — regardless of what any agreement does or doesn't say.
- Before outreach in any vertical adjacent to a current employer's business, confirm there is no non-compete, non-solicit, or conflict-of-interest policy triggered — and get an attorney's read where there's any doubt. Document the decision either way.
- Any employer conflict-of-interest disclosure obligation is resolved proactively, not avoided.

## 10. RISK REGISTER (top risks + mitigations)
| Risk | Mitigation |
|---|---|
| Client claims platform failure caused a compliance miss | E&O insurance + service agreement limiting liability + append-only proof of what was/wasn't logged |
| Accidentally crossing into "inspection"/licensed work | §1 boundary enforced in copy, contract, product; fire-ext framing bright line |
| Data breach of client/staff data | Minimize PII, cyber insurance, breach plan, server-side creds |
| Google Sheets fails at scale | Documented migration trigger (SOUL §13.8); swappable data layer |
| Solo-founder bus factor / the move | Remote-first ops runbook; nothing depends on physical presence |
| Employer conflict | §9; attorney consult; no employer resources used |
| Unlicensed-service temptation under revenue pressure | Regulated-service rule; never sell what isn't licensed |

## 11. ATTORNEY REVIEW CHECKLIST (before scaling)
Hand these to a licensed attorney in the operating state:
- [ ] LLC formation + operating agreement + the move's effect on domicile
- [ ] Client Service Agreement (liability limitation, IP, data ownership, the "client remains responsible for compliance" clause)
- [ ] Terms of Service + Privacy Policy for the app/site
- [ ] The Sentinel-provides-proof-not-inspection boundary language
- [ ] Insurance adequacy (GL + E&O + cyber)
- [ ] Any employer conflict/non-compete exposure
- [ ] Fire-extinguisher visual-check framing (confirm it stays clear of licensed-work definitions in the operating state)

---

*End of GOVERNANCE.md v1.0 — protection is not paperwork for its own sake; it's what lets a one-person company make promises safely. Keep it current; get it lawyered before you lean on it.*

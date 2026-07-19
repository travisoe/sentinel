# CLIENT_AGREEMENTS.md — Sentinel Safety

**Version 1.0 · July 2026 · STATUS: TEMPLATE — REQUIRES ATTORNEY REVIEW BEFORE USE**

> **Read this first.** These are structured starting-point templates, not ready-to-sign legal documents. Travis is not a lawyer and neither is the tool that drafted these. **Do not sign a client, publish these, or rely on them until a licensed attorney in the operating state reviews and finalizes them.** Their purpose is to make that review fast and cheap by giving the attorney a disciplined draft that already reflects Sentinel's real model (proof, not inspection). Bracketed `[…]` fields are placeholders.

Three documents live here:
- **A. Service Agreement** — what a client signs to buy Sentinel.
- **B. Terms of Service** — governs use of the app/site.
- **C. Privacy Policy** — how data is handled.

---

## A. SERVICE AGREEMENT (template)

**This Agreement** is between Sentinel Safety LLC ("Sentinel") and `[Client legal name]` ("Client"), effective `[date]`.

**1. What Sentinel provides.** Sentinel provides a software platform and physical NFC/QR tags that allow Client's own personnel to record compliance-related tasks as timestamped digital logs, and a dashboard for Client to view those records. Selected plan: `[Starter / Full Compliance / Managed]` at `[$___]/month per location`, plus a one-time setup fee of `[$___]`.

**2. What Sentinel does NOT provide.** Sentinel does not perform inspections, does not certify or guarantee Client's regulatory compliance, and does not provide licensed services. **Client remains solely responsible for performing its own compliance tasks and for meeting all applicable laws, regulations, and standards.** Sentinel's role is limited to making Client's own recorded actions provable.

**3. Records.** Log records are append-only and timestamped at creation. Neither Client nor Sentinel can alter or delete a submitted record; corrections are entered as new records. Client's data belongs to Client. On termination, Sentinel will provide Client a full export of Client's records and will delete Client data after `[retention window]`.

**4. Setup & installation.** Sentinel ships pre-programmed tags with a placement guide. Client is responsible for physical placement per the guide. A remote verification session confirms correct mapping before go-live. `[On-site installation, where offered, is a one-time service.]`

**5. Fees & payment.** Monthly fees billed via `[Stripe]` on `[billing cycle]`. Setup fee is due before installation and is non-refundable once tags are programmed/shipped. `[Founder launch pricing, if applicable, is locked for 12 months from start.]`

**6. Term & termination.** Month-to-month unless otherwise stated. Either party may terminate with `[30]` days' notice. Client receives a data export on termination.

**7. Limitation of liability.** `[ATTORNEY TO DRAFT — this is the most important clause. Should cap Sentinel's liability, disclaim responsibility for Client's underlying compliance obligations, and align with E&O coverage. Do not use without legal review.]`

**8. Warranties & disclaimers.** The platform is provided "as is." Sentinel does not warrant that use of the platform ensures regulatory compliance. `[ATTORNEY TO REFINE.]`

**9. Confidentiality & data.** Each party protects the other's confidential information. Data handling per the Privacy Policy (Doc C).

**10. Independent contractor / non-agency.** Sentinel is an independent provider, not Client's employee, agent, or compliance officer.

**Signatures:** `[Client]` __________ `[Date]` ____ · Sentinel Safety LLC __________ `[Date]` ____

---

## B. TERMS OF SERVICE (template — for app.sentinelsafety.io + site)

1. **Acceptance.** By using the Sentinel platform, you agree to these Terms.
2. **The service.** A browser-based tap-to-log compliance recording tool and dashboard. No account is required to log a task at a station; dashboard/admin access requires authorized login.
3. **Acceptable use.** You will not attempt to forge, backdate, alter, or falsify records; interfere with the service; or access data you're not authorized to. Records are append-only by design.
4. **Accounts & security.** Authorized users are responsible for safeguarding login credentials.
5. **Sentinel's role.** Sentinel provides record-keeping software. It does not perform inspections or certify compliance. You remain responsible for your own regulatory obligations.
6. **Availability.** Reasonable-efforts uptime; no guarantee of uninterrupted service. `[ATTORNEY: SLA language if any.]`
7. **IP.** Sentinel owns the platform and brand. You own your data.
8. **Termination.** Sentinel may suspend access for violations of these Terms.
9. **Disclaimers & liability.** `[ATTORNEY TO DRAFT — mirror the Service Agreement.]`
10. **Changes.** Terms may update; material changes will be communicated.
11. **Contact.** `Travis@SentinelSafety.io`.

---

## C. PRIVACY POLICY (template — for app.sentinelsafety.io + site)

1. **What we collect.** Compliance log events (timestamps, tag IDs, log types, optional notes/photos), the name or initials of the person logging a task, and client account/contact details.
2. **Why.** To provide the compliance record-keeping service and dashboards to the Client that engaged Sentinel.
3. **Where data lives & who processes it.** Data is stored in Google Sheets/Drive (Google), the app is hosted on Vercel, payments processed by Stripe, and authentication by `[provider]`. These are our sub-processors.
4. **Staff data minimization.** We ask Clients to use initials or minimal identifiers for logging staff wherever possible. We do not sell personal data. Ever.
5. **Data ownership.** Client compliance data belongs to the Client. Sentinel is a custodian.
6. **Retention.** Records retained per the Client's plan (`[90-day / 3-year]` audit trail), then deleted per the Service Agreement.
7. **Security.** Access credentials are held server-side; access is limited. `[ATTORNEY/security review of specifics.]`
8. **Breach notification.** In the event of a data breach affecting personal data, we will notify affected Clients promptly and comply with applicable law.
9. **Your rights.** Clients (and their staff, via the Client) may request access, correction, or deletion consistent with the append-only nature of compliance records and applicable law.
10. **Contact.** `Travis@SentinelSafety.io`.

---

*End of CLIENT_AGREEMENTS.md v1.0 — these exist so a lawyer can finalize fast. They are not final. Get them reviewed before the first signature or the first line of data collected in production.*

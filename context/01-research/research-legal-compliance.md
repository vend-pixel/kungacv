# Legal & Compliance Research — CV Builder SaaS

*Not legal advice — a practical checklist for what to research further and put in place, based on general knowledge of Malawian business/regulatory structures and standard SaaS compliance practice. Items specific to current Malawian statute (exact registration costs, current VAT threshold, exact Data Protection Act provisions) should be confirmed with a local lawyer/accountant or directly with the Registrar General / Malawi Revenue Authority (MRA) before launch — this file flags what to ask, not authoritative answers.*

## 1. Business Structure

- Operating a SaaS accepting payments in Malawi generally does require some form of registered business entity to open a business bank account and pass merchant KYC (including with PayChangu) — a sole proprietorship (business name registration) is typically the fastest, lowest-cost path for a solo founder to get started; a limited company offers liability protection and looks more credible to larger partners (e.g., NGOs, universities) but adds registration and compliance overhead.
- **Consult directly with the Registrar General's office (or a local accountant) for current registration cost/process** — treat any specific fee figure as unverified without a direct source.
- MRA tax registration (for income tax and, once relevant, VAT) is a standard requirement for any operating business, regardless of structure.
- A business bank account is generally required (or strongly preferred) for merchant payment processing and clean bookkeeping — plan to have one before going live with payments.

## 2. Data Protection

- Malawi has a Data Protection Act (2024) — as a new-ish law, **verify its current registration/notification requirements for data controllers directly** rather than assuming GDPR-equivalence; many newer African data protection laws are GDPR-inspired but not identical (e.g., different thresholds for when registration as a data controller is mandatory).
- Regardless of the exact statutory requirement, standard good practice for any product storing personal data (CV content is personal data by definition) applies: clear user consent at signup, a plain-language privacy policy, and a straightforward way for a user to request deletion of their account and data.
- **Cross-border data transfer**: Firebase/Google Cloud servers are outside Malawi. This is common for African SaaS products and not unusual, but it's a disclosure item — your privacy policy should state where data is processed/stored, and (pending confirmation of the Act's specifics) this may require an explicit user consent clause for cross-border transfer.

## 3. Consumer Protection

- Standard practice regardless of exact Malawian statute specifics: a clear, published refund policy, plain terms of service, and advertising that avoids overpromising outcomes the product can't guarantee — **do not claim or imply "guaranteed job" or similar outcome guarantees**, since the product helps produce a CV, not secure employment, and such claims risk both legal exposure and user trust.
- If selling to consumers via a website/app (as opposed to in person), general "distance selling" good practice applies: clear pricing before checkout, a working support contact, and an easy cancellation/refund path.

## 4. Payments & Finance

- VAT registration in Malawi is typically threshold-based (only required once revenue crosses a certain level) — **confirm the current threshold with MRA directly**, since threshold figures change and an early-stage solo-dev product likely starts well under it.
- Whether MRA withholding tax applies to PayChangu's processing fees is a question for an accountant familiar with current Malawian tax treatment of digital-payment-processor fees — don't assume either way.
- Keep basic transaction records (already a natural byproduct of the `payments` Firestore collection described in the PayChangu research) — this supports both tax reporting and dispute resolution, and issuing a simple digital receipt (email or in-app) per payment is good practice even before it's a hard legal requirement.
- **International expansion** (Kenya, Nigeria, South Africa): each of these has its own tax/VAT-equivalent regime for digital services sold to local consumers — treat as a separate research pass at the point expansion becomes real, not a launch-blocking concern now.

## 5. Intellectual Property

- Trademarking the product name in Malawi (and optionally via ARIPO for broader regional coverage) is worth doing once the name is finalized and validated — not before, given naming can still change pre-launch.
- CV **template designs** you create are your own copyrightable work; however, generic CV layout *patterns* (reverse-chronological work history, a skills section, etc.) are common structural conventions, not protectable IP — you can freely use standard CV structuring conventions; what's protectable is your specific visual design execution.
- Google Fonts are free to use commercially (this is a stable, well-known fact, not something requiring a fresh source check), but always confirm the specific license terms of any *non*-Google font you consider.
- User-generated CV content (the user's own work history, skills, wording) is unambiguously owned by the user — your terms of service should say so explicitly rather than leave it implied.

## 6. AI & Content (V2+)

- If/when OpenAI or similar APIs are added for AI-assisted wording, disclose to users that AI assistance is used, and check the current API provider's data-retention/training-use policy for API traffic (this varies by provider and changes over time — check the provider's current terms at implementation time rather than relying on a general assumption).
- Consider an explicit opt-in (or at minimum a clear notice) before sending a user's CV content to a third-party AI API — this is both good practice and likely to align with data-protection consent expectations once the AI feature ships.

## 7. Content Policy

- No special restriction is typically needed around what jobs/industries a user's CV targets (a CV builder is a general-purpose content tool, not a job platform vetting employers) — a standard Acceptable Use Policy prohibiting fraudulent use (e.g., knowingly fabricating credentials to deceive an employer) is sufficient rather than restrictive industry rules.
- **Minors**: if the product could plausibly be used by users under 18 (some fresh-grad-adjacent users may be under 18, e.g., a diploma-college student), a lightweight age-appropriate design/consent consideration is reasonable, but a full COPPA-style regime is a US-specific framework and not directly applicable in Malawi — confirm current Malawian guidance if this becomes a material user segment, rather than importing a US framework by default.

## 8. Template Documents (outlines only — have a lawyer review before publishing)

- **Privacy Policy outline**: what data is collected (account info, CV content, payment metadata) → why (to provide the service, process payments) → where it's stored (Firebase/Google Cloud, cross-border) → third parties involved (PayChangu for payments; AI provider if/when added) → user rights (access, deletion) → contact for privacy requests.
- **Terms of Service outline**: description of the service → account responsibilities → payment/refund terms → user content ownership → acceptable use → disclaimer (no outcome/job guarantee) → limitation of liability → termination → governing law (Malawi) → contact.
- **Cookie Policy outline**: what cookies/local storage are used (session/auth only, at MVP scope) → no third-party ad-tracking cookies (if true) → how to control cookies.
- **Refund Policy outline**: what's refundable (e.g., failed/undelivered export) vs. not (change-of-mind after successful download) → how to request → processing timeline.
- **Acceptable Use Policy outline**: no fraudulent credential fabrication → no abuse of the service (scraping, spam account creation) → consequences of violation (account suspension).

## 9. Expansion Compliance (brief, for later)

- **South Africa (POPIA)**, **Nigeria (NDPR)**, **Kenya (DPA)** each impose their own data-protection obligations on services processing their residents' data — broadly GDPR-inspired but with local specifics on registration/notification. Treat each as its own research pass when expansion becomes concrete, not something to solve preemptively now.
- Of these, expanding to a market with a *lighter* initial compliance lift (vs. one requiring, e.g., local data-controller registration before operating) is generally the easier next step — but this should be revisited with current information at the time expansion is actually being planned, not decided now from Malawi-stage research.

## 10. Practical Priorities

**Must be in place before launch (day 1)**:
- Business name/entity registration sufficient to open a business bank account and pass PayChangu merchant KYC
- Privacy Policy and Terms of Service published (even in outline-derived, lawyer-light form initially)
- Basic payment record-keeping (the `payments` Firestore collection)
- No outcome-guarantee language anywhere in marketing copy

**Can wait until after first 100 users**:
- Formal lawyer review/polish of the policy documents
- Trademark registration
- VAT registration (unless already near threshold)

**Can wait until first 1,000 users**:
- Firestore data export/backup automation beyond ad hoc exports
- Any AI-provider-specific consent flow (until AI features actually ship)
- Multi-country compliance research (until expansion is concretely planned)

**Consult a lawyer specifically for**: current Data Protection Act registration obligations, VAT threshold and current rate, whether withholding tax applies to payment-processor fees, and final review of all published policy documents before they go live.

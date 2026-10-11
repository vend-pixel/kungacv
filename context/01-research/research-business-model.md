# Business Model & Profitability Research — CV Builder SaaS

*Compiled Sep 2026 via live web search (competitor pricing/funnel mechanics, freemium conversion benchmarks) plus the existing PayChangu/market/persona research. This is the "how do we actually make money, and make it fair to the user" analysis the earlier docs assumed but didn't fully work through — read alongside GTM-PLAN.md and research-paychangu.md §4, §7.*

## 1. What the Global Leaders Actually Do (and why it backfires)

Confirmed from live pricing pages and multiple third-party teardowns:

- **Zety**: fully free to *build*; a "$1.95/$2.99 for 14 days" trial that **auto-renews into $23.70-$25.95 billed every 4 weeks** unless cancelled, or an annual plan at $5.95/month ($71.40 upfront). Data is reportedly shared extensively with third-party marketing partners/data brokers.
- **Resume.io**: same owner group (BOLD Limited) as Zety, same mechanic — a ~$1.95 7-day trial converting to ~$24.95/month.
- Independent reviews and 2026 app-store analysis converge on the **same five complaints** across this whole category: locked downloads after 30-90 minutes of work invested, a cheap "trial" that silently becomes an expensive subscription, difficult cancellation, generic AI-generated bullets, and ATS-breaking image-based templates.
- **Takeaway**: the "build free, trap into a subscription" model is the dominant pattern **and** the single biggest source of user resentment in this entire product category. It works financially for those companies (they're large, ad-funded acquisition machines), but for a new, trust-building, local brand in Malawi it's a liability, not a template to copy — one bad experience with the trial trap would spread fast through the same WhatsApp/Facebook groups you're relying on for growth (see GTM-PLAN).

## 2. Freemium Conversion Benchmarks (why a 10% target is ambitious, and why that's OK here)

- Standard SaaS **freemium** (soft feature-gating, indefinite free tier) converts free→paid at a median of roughly **3-5%** self-serve, with "great" performers at 8-12% (OpenView, ChartMogul/ProductLed/Kyle Poyar 2026 benchmarks, Userpilot).
- **Free trial with no credit card required** converts higher (median ~8%, "great" 10-15%); **credit-card-required trials** convert dramatically higher (25-35% median, 50-60% for top performers) — but that mechanic is exactly the "trap" pattern flagged in §1 and is a poor fit for a low-trust, price-sensitive new market entrant.
- **Why the CV Builder's model isn't really "freemium" in the benchmarked sense**: freemium benchmarks describe *ongoing tools* where a user could plausibly stay on the free tier forever. A CV export is a **one-shot, urgent, high-intent purchase** — the user has already invested 10-20 minutes building the CV, has a real job application deadline, and needs the *specific artifact* (a clean PDF) right now. This is closer to a **pay-per-output / download-gate** funnel than a subscription-freemium funnel, and download-gated models in this exact category (every competitor in research-competitors.md gates *some* form of clean export) report meaningfully higher conversion than generic SaaS freemium precisely because of that sunk-effort-plus-urgency dynamic.
- **Implication for the 10% MVP target in PRD.md**: it's above the generic SaaS freemium median but plausible for a download-gated, high-intent, low-price model — treat it as a stretch-but-reasonable goal, not a guaranteed benchmark. Revisit after real month-1 data rather than treating it as fact.

## 3. Recommended Business Model

**Core structure: free-to-build, pay-once-to-download-clean, no subscription, no data monetization.**

### Why not a subscription
- PayChangu has no native recurring-billing primitive (research-paychangu.md §4) — building recurring billing yourself is real engineering effort a solo dev doesn't need for MVP.
- The target user's actual need is episodic (one polished CV per job search push, occasionally updated), not an ongoing service relationship — a subscription bills people for value they aren't using most months, which is exactly the "auto-renew" resentment pattern in §1.
- A subscription is a harder sell to a price-sensitive, subscription-wary audience (research-market.md §3, research-seo-gtm.md §6) than a single clear one-time price.

### Why not the "cheap trial that becomes an expensive subscription" pattern
- It is the most profitable pattern *for global players with paid-ad-funded acquisition and no local reputation to protect*. It is the wrong pattern for a bootstrapped, word-of-mouth/WhatsApp-driven local brand — the entire GTM plan depends on being trusted enough to get shared in job-seeker groups. One viral complaint about a hidden auto-renewing charge would cost far more in destroyed trust than it could ever earn in trapped subscribers, at this stage and scale.

### Why not ad-supported / data-monetization (what Zety reportedly does)
- Selling or sharing user CV data (name, work history, contact details) with third-party data brokers is both a real privacy harm to a vulnerable, job-seeking population and directly contradicts the Privacy Policy commitments already drafted in research-legal-compliance.md §8 and SECURITY.md. It would also be a serious brand-trust liability if discovered — not worth the (likely small, at Malawi ad rates) revenue it would generate.

### The recommended structure, concretely
1. **Free tier**: full builder, full live preview, both template families, unlimited edits — the free tier must let the user see and trust a complete, polished result before paying anything (this is the trust-building step every persona in research-user-personas.md needs).
2. **Paid unlock**: a **single, clearly-priced, one-time payment per exported CV "profile"** (not per download) that removes the watermark and unlocks unlimited clean re-exports/edits of that CV going forward — this rewards a user who comes back to update the same CV for a new application, rather than charging them again for the same content (a real fairness/value-for-money differentiator versus the reviewed competitors, none of which are transparent about this).
3. **No auto-renewal, no trial-that-becomes-a-subscription, no card required to explore.** The price is shown before any payment method is entered — directly countering the "hidden pricing" complaint that dominates competitor reviews (§1).
4. **Payment methods**: Airtel Money, TNM Mpamba, bank transfer, and card via PayChangu — mobile money is the primary expected channel given the persona and market research (research-market.md §3).
5. **No data sale/sharing with third parties.** State this explicitly in marketing copy as a differentiator ("we don't sell your CV data") — trust is cheap to promise and expensive to fake, so this only works if SECURITY.md and the Privacy Policy actually hold to it, which they already do by design.

### Optional add-on revenue (V2+, not MVP)
- A modest **"refresh" price** lower than the original unlock, for a user who wants to substantially rebuild a CV for a different career track (e.g., a second, differently-targeted CV) — still one-time, not recurring.
- **AI-assisted wording** (already planned for V2, research-competitors.md §3) could be sold as a small one-time add-on rather than bundled free, since it costs real per-use API money to run — but should not be required to get a clean export; it's an enhancement, not a gate.
- **NGO/university bulk licenses**: a one-time or per-cohort fee for a university career center or NGO program to grant free Pro access to their whole cohort (ties directly into the partnership channel in GTM-PLAN) — this is a B2B2C revenue line layered on top of the B2C one-time-unlock model, and is a genuinely different profit pool worth pursuing once the university/NGO relationships in GTM-PLAN mature.

## 4. Cost Structure & Unit Economics (what "profitable" actually requires)

- **Marginal cost per paid export**: Cloud Run PDF-render compute time (small, sub-cent to low-cents per render at MVP scale) + PayChangu's transaction fee (an unconfirmed ~3% figure was the only data point found — confirm the real number directly with PayChangu before finalizing price, per research-paychangu.md §1) + negligible Firestore read/write cost.
- **Fixed cost**: effectively zero beyond the founder's own time at MVP scale — Firebase Blaze's free tier underneath pay-as-you-go billing and Vercel's free tier cover hosting until volume is meaningful (research-firebase-architecture.md §5).
- **Implication**: at this cost structure, **gross margin per paid unlock is very high** (likely 90%+ of the price even after PayChangu's fee) — the business is not cost-constrained at MVP scale, it's **conversion- and volume-constrained**. This changes where effort should go: pricing experiments and trust-building (to lift the free→paid conversion rate) matter far more to profitability right now than squeezing infrastructure cost.
- **Pricing implication**: because marginal cost is near-zero, there's real room to price low (favoring volume and word-of-mouth in a price-sensitive market) without threatening margin — the actual constraint on "most profitable" here is *how many people convert and how many come back*, not *how much each conversion costs to deliver*. This directly supports the market/GTM research's recommendation to validate a low "founding user" price against real signups rather than anchoring high (research-seo-gtm.md §6).

## 5. Delivering Real Value for Money (not just extracting it)

A profitable model here has to survive contact with a population the earlier research shows is financially constrained and has been burned by "free-to-try" traps elsewhere online (§1). Concretely, "value for money" means:
1. **The free tier is genuinely useful on its own** (a complete, previewable CV) — paying only removes the watermark and unlocks re-export, it doesn't gate basic usefulness. This matches the persona research's finding that the biggest current pain is not knowing if a CV "looks right" at all — the free tier already solves that.
2. **One payment, not a recurring bill for episodic need** — the pricing structure matches how the product is actually used (build/update occasionally, export when applying), not how a SaaS billing system would prefer to bill.
3. **Paying once unlocks ongoing re-export of that CV**, not a single download — a real, statable fairness advantage over the reviewed competitors, none of which advertise this generosity.
4. **Transparent price shown up front**, no card required just to see the price, no trial-to-subscription mechanic — directly the opposite of the #1 complaint pattern found in every competitor teardown in §1.
5. **No data monetization** — the product's revenue comes only from the direct value delivered (a usable CV), not from selling the user's personal/career data onward.

## 6. Summary Recommendation

| Dimension | Recommendation | Why |
|---|---|---|
| Pricing model | One-time payment, per CV profile, unlocking unlimited re-export of that CV | Fits PayChangu's lack of native subscriptions; fits episodic user need; avoids the "trap" pattern that defines and damages every reviewed competitor |
| Price level | Low, "founding user" launch price, validated against real signups | Marginal cost is near-zero, so margin isn't the constraint — volume and trust are; over-pricing early costs more in lost word-of-mouth than it gains in per-unit margin |
| Free tier scope | Full build + preview + both templates, watermarked export | Matches the segment's real pain point (not knowing if the CV looks professional) without giving away the exact thing being sold (a clean, submittable PDF) |
| Payment channels | Airtel Money, TNM Mpamba, bank transfer, card (PayChangu) | Matches confirmed local payment behavior; no card required to try the product |
| Data monetization | None — explicit no-data-sale commitment, stated in marketing | Directly contradicts the #1 trust-destroying pattern in this whole competitor category (Zety's data-broker relationships); the target audience is financially vulnerable and this is a real duty of care, not just brand positioning |
| Secondary revenue (V2+) | Optional paid AI-wording add-on; B2B2C bulk licenses to universities/NGOs | Genuinely different profit pools once core product/trust is established; doesn't compromise the core one-time-fair-price model |

This model is deliberately **not** the most extractive one possible (a subscription trap would likely earn more per trapped user) — it's the most profitable one **that this specific brand, market, and trust position can actually sustain**, which is the only kind of "most profitable" that survives past the first few hundred users in a word-of-mouth-driven local market.

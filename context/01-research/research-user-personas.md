# User Persona Research — CV Builder SaaS (Malawi)

*Synthesized from market/competitor research plus general knowledge of the segment. Treat as a design-input hypothesis, not surveyed data — validate against real users after MVP launch (see TEST-PLAN and GTM-PLAN "first 100 users" feedback loop).*

## 1. Context Research (synthesis)

- **After graduation**: many Malawian graduates face a long, informal job search — applying via word of mouth, walk-ins, and scattered online postings, often while doing informal/casual work to get by (consistent with the ~8-in-10 employed-youth-in-informal-work figure in research-market.md).
- **Job search journey**: a mix of Facebook/WhatsApp groups sharing vacancy posters, occasional formal job boards, walk-in applications to NGOs/government offices, and word-of-mouth via church/family/alumni networks.
- **Tech literacy**: comfortable with WhatsApp, Facebook, mobile money; less familiar with desktop productivity tools like Word's formatting features — this is why "Word/Canva templates from a friend" is the default CV-creation path today, and why it often produces inconsistent, hard-to-read documents.
- **Devices**: Android-dominant, often lower-spec phones, data costs are a real constraint on session length — favors a lightweight, low-data web app over a heavy SPA bundle.
- **Language**: English is the professional/CV-writing language even where Chichewa is the home language — but comfort *writing* fluent professional English varies, which is a real pain point the product can help with (phrasing suggestions, examples).
- **Social support**: friends, church networks, and university alumni often play the informal "CV helper" role today — a role the product can partially replace or augment.

## 2. Personas

### a) Chisomo — recent bachelor's grad, no experience, applying for internships
- 22, Zomba, university graduate (no photo — general reference: young, professional-casual dress)
- Daily routine: lives with family, checks WhatsApp/Facebook groups for opportunities, uses a shared or hand-me-down Android phone
- Job search: applying for internships and graduate-trainee programs, mostly via email/online forms
- Current CV: a Word document a friend helped format; inconsistent style, unsure if it's "right"
- Pain points: doesn't know what employers expect; scared of being rejected for a "wrong-looking" CV; can't afford a professional CV service
- Goals: land any formal-sector foot-in-the-door role
- Objections to paying: has no independent income yet, price-sensitive to almost zero
- Quote: "I don't even know if my CV looks professional or if I'm just wasting people's time sending it."
- Winning looks like: getting invited to an interview at all

### b) Thoko — diploma holder from a technical college, entry-level jobs
- 24, Blantyre, technical/vocational diploma
- Daily routine: works informal jobs while job-hunting, active in a trade-specific WhatsApp group
- Job search: applying to technical/trade roles, sometimes via recruitment agencies
- Current CV: has one, made at a cyber café years ago, outdated and generic
- Pain points: doesn't know how to update it for a new role; formatting is intimidating
- Goals: a stable formal job matching the trade skill
- Objections to paying: willing to pay a *small* one-time amount if the result is clearly better than what a cyber café gives
- Quote: "The one I have is from years ago — I don't even know how to add my new skills to it properly."
- Winning looks like: a CV they're confident sending without a friend double-checking it first

### c) Blessings — mid-20s career changer, from informal work, wants formal job
- 26, Lilongwe, some tertiary education, currently in informal trading/casual work
- Daily routine: juggling informal income while trying to break into formal employment
- Job search: sporadic, discouraged by past rejections, relies on family connections
- Current CV: none, or very rough
- Pain points: doesn't know how to frame informal work experience as relevant; low confidence
- Goals: any formal job with a stable salary
- Objections to paying: needs to see very low friction and price before trying
- Quote: "I've done real work, just not the kind that looks good on paper."
- Winning looks like: a CV that makes their informal experience look credible and relevant

### d) Grace — woman re-entering the workforce after a gap
- 30, Mzuzu, previously employed, took time out (family reasons)
- Daily routine: managing household responsibilities alongside restarting the job search
- Job search: targeting roles similar to her pre-gap career
- Current CV: an old CV from before the gap, needs updating and needs to explain the gap
- Pain points: unsure how to present the gap without it counting against her; feels out of practice
- Goals: return to a role at or above her previous level
- Objections to paying: will pay if it clearly saves time versus reformatting alone
- Quote: "I know how to do the job — I just don't know how to explain the gap on paper."
- Winning looks like: a CV that reads as current and confident, not apologetic

### e) Patricia — graduate applying for NGO/government jobs
- 23, Lilongwe, bachelor's degree
- Daily routine: monitors NGO/government job portals and mailing lists closely
- Job search: NGO/government roles, which often have specific application formats (detailed cover letters, referee details, sometimes government-standard forms)
- Current CV: has a CV but reformats it differently for every application by hand, which is slow and error-prone
- Pain points: NGO/government applications have different conventions (references listed in full, longer format) than private-sector CVs — templates built only for private-sector norms don't fit
- Goals: a role at a reputable NGO or in the civil service
- Objections to paying: will pay for a tool that saves the reformatting time across many applications
- Quote: "Every NGO wants something slightly different — I'm rebuilding my CV every single time."
- Winning looks like: being able to produce a correctly-formatted NGO/government-style CV in minutes rather than hours

## 3. Jobs-to-be-Done

| Job type | Description |
|---|---|
| Functional | Produce a professional, correctly formatted, downloadable CV without design skills |
| Emotional | Feel confident and "employer-ready" rather than anxious about being judged on formatting |
| Social | Be seen by family/peers/employers as put-together and serious about the job search |
| Current alternatives | Word/Canva templates from a friend, cyber café formatting services, reusing an old outdated CV — all slow, inconsistent, or costly relative to income |

## 4. User Journey Map ("I need a CV" → "I got the job")

1. **Trigger**: a job posting appears (WhatsApp/Facebook group, walk-in notice, NGO portal) — urgency is high, timeline is short.
2. **Current-path frustration**: borrow/adapt an old CV or ask a friend for help; format looks inconsistent; unsure if it meets employer expectations. Emotional low point.
3. **Product entry point**: discovers the CV builder (via WhatsApp share, Facebook group post, or search) — this is where GTM channels matter most (see GTM-PLAN).
4. **Build**: fills in guided sections on mobile, gets structure/wording help — emotional lift as the CV starts to look "real."
5. **Export**: downloads a polished PDF — highest confidence point in the whole journey; this is the moment that should feel worth paying for.
6. **Apply**: submits the CV — journey moves outside the product; up to the user from here.
7. **Outcome**: interview or rejection — outside the product's control, but where the user forms their lasting opinion of whether the CV "worked."

**Where users drop off today**: mostly at step 2 (frustration with DIY formatting) and step 4-equivalent in existing tools (USD paywalls, no mobile-money checkout, heavy desktop-oriented UX). **Where the product should win**: making steps 3-5 fast, mobile, and locally affordable — closing the two biggest drop-off points at once.

## Design Implications

- Default template set should favor **single-column, ATS-safe layouts** with Malawi-appropriate field labels (education levels, referee sections for NGO/government-style CVs — see Patricia).
- Onboarding should be **fast and forgiving on mobile data** — short sessions, resumable progress, minimal image-heavy UI.
- Pricing/paywall must appear **after** the confidence-building moment (a completed draft), not before — free-to-build, pay-to-export-polished/watermark-free is the standard pattern and fits this segment's trust-building needs.
- Support a **second template family for NGO/government-style CVs** (longer, full referee details) alongside a standard private-sector one-pager — Patricia's persona shows this isn't a one-size-fits-all market.
- Consider light **wording help** (not full AI writing) for framing informal work experience professionally — directly addresses Blessings' and Grace's pain points.

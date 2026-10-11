# PDF Rendering Research — CV Builder SaaS

*Engineering judgment call based on known platform constraints (Firebase Cloud Functions limits, Chromium footprint) rather than a live-search topic — these are stable technical facts, not fast-changing market data. Verify current Cloud Functions memory/timeout limits against Firebase docs before implementation, since platform limits do shift.*

## 1. Approaches Compared

| Approach | Fidelity to HTML/CSS preview | Memory footprint | Cold start | Font/emoji handling | Multi-page handling | Deployment complexity |
|---|---|---|---|---|---|---|
| Puppeteer on Cloud Functions | Perfect (same rendering engine as preview if preview is Chromium-based) | High — a Chromium binary typically needs 512MB-1GB+ RAM, tight against Functions' default limits | Slow (multi-second cold start to launch Chromium) | Full, if fonts are bundled/embedded | Good via `@media print`/`@page` CSS | Moderate — needs a Chromium-compatible Functions runtime/layer |
| Playwright on Cloud Functions | Same as Puppeteer, slightly more modern API | Same class of footprint as Puppeteer | Same class of cold-start cost | Same | Same | Similar to Puppeteer, marginally heavier dependency |
| Headless Chrome on Cloud Run (instead of Functions) | Same fidelity as above | Not memory-constrained the same way — Cloud Run lets you size the container (up to several GB) and keeps warm instances easily | Much better — can keep a min-instance warm to avoid cold starts entirely | Full | Full | Slightly more setup (container, not just a function) but far more forgiving of Chromium's footprint |
| React-PDF (`@react-pdf/renderer`), server-side | Good but NOT pixel-identical to an HTML/CSS preview — it's a separate rendering primitive (its own layout engine), so preview and export can drift | Low — no browser engine needed | Fast | Requires manually registering fonts | Manual page-break logic | Low — pure JS, easy to deploy in Functions |
| PDFKit | Lower — very low-level, you position content yourself | Low | Fast | Manual font embedding | Fully manual | Low deployment complexity, high *implementation* complexity |
| Typst (via WASM/CLI) | High fidelity for its own templates, but requires writing/generating Typst markup — not a straight HTML/CSS mirror | Low-moderate | Fast | Good, modern font handling | Good, built for print layout | Moderate — newer ecosystem, less Functions-specific tooling maturity |
| LaTeX-based rendering | Excellent print typography, but heavy (needs a LaTeX distribution) and a poor match for a live HTML preview | High (multi-hundred-MB distribution) | Slow | Excellent for text, poor for arbitrary web fonts | Excellent | High — awkward to run inside Functions at all |
| WeasyPrint | Purpose-built HTML+CSS → PDF; not a full browser engine but a dedicated print-CSS renderer | Moderate (Python-based, lighter than a full Chromium) | Faster than Chromium-based options | Decent, needs font files available to the process | Good `@page` support | Moderate — Python runtime in a Node-centric stack is a slight friction point |
| wkhtmltopdf | HTML/CSS → PDF via an older WebKit build | Moderate | Moderate | Weaker with modern CSS (flex/grid support is poor/outdated) | OK | Low, but the project is effectively unmaintained — a real risk for a new product to depend on |

## 2. Firebase Cloud Functions Specifics

- Running full Chromium (Puppeteer/Playwright) inside Cloud Functions is a well-known pain point in the Firebase ecosystem: it works, but pushes against default memory limits and adds meaningful cold-start latency — exactly the kind of tail latency that hurts most for users on slow/expensive Malawian mobile data, who are least able to tolerate a slow "Generate PDF" spinner.
- **Recommended workaround**: don't fight this constraint inside Functions. Move PDF generation to **Cloud Run** instead, where you control container memory/CPU directly and can configure a minimum instance to avoid Chromium cold starts entirely. This is a small architectural fork from the original "everything in Cloud Functions" plan but avoids the single biggest technical risk in the stack.
- Cloud Run's free tier and pay-per-use pricing are broadly comparable in spirit to Functions' free tier at low volume; at the volumes implied by the MVP success metrics (100 signups, month 1), cost is not a real constraint either way — the deciding factor is reliability and latency, which favors Cloud Run.
- You do need Firebase's pay-as-you-go **Blaze plan** to use Cloud Run or to let Cloud Functions make outbound network calls at all (e.g., calling PayChangu's API) — the free Spark plan cannot do this. Budget for this from day one; it does not mean meaningful cost at MVP scale, since Blaze still has a generous free tier underneath the pay-as-you-go layer.

## 3. Template Strategy

- Define CV templates as React components rendered once to HTML/CSS, and reuse the *exact same* components for the live in-browser preview and the server-side PDF render (via Cloud Run + a Chromium-based renderer) — this is what actually guarantees "PDF matches what you saw," rather than any specific PDF library choice.
- Use standard print CSS (`@page`, `@media print`) rules for margins and page-break control, and explicitly mark section boundaries (e.g., `break-inside: avoid` on entries) so a job entry or education entry never splits awkwardly across a page break — a common visual bug in generated CVs.
- Embed/self-host fonts rather than relying on system fonts, so rendering is consistent regardless of what's installed in the Cloud Run container image.

## 4. ATS-Friendly PDF

- Text-based PDFs (as opposed to PDFs that are effectively images of the CV) are generally parsed correctly by ATS systems, provided the underlying HTML uses real text elements — this is naturally satisfied by the Chromium-render-from-HTML approach and is one more reason to avoid image-based or heavily graphic templates.
- Keep the DOM structure semantic and linear (standard reading order) so a screen-reader-style linear text extraction — which is roughly how many ATS parsers behave — produces sensible output; avoid multi-column layouts and text-in-images.
- Set PDF metadata (title = candidate name + "CV", author) as a small but real polish detail.
- Common pitfalls to avoid: tables for layout (parsers often mangle them), text rendered as an image, unusual Unicode characters in headers, and multi-column templates.

## 5. Client-Side First, Server-Side Fallback

- There's a reasonable case for a **lightweight client-side preview-quality export** (e.g., browser print-to-PDF or a client-side PDF lib) for free users, reserving the higher-fidelity Cloud Run render for paid exports — this reduces server cost and load at the free tier while still making the paid tier feel like a real upgrade (crisp, consistent, watermark-free output).
- Given the low MVP volume implied by the success metrics, this optimization is not necessary on day one — start with server-side rendering for everyone (simpler to build and reason about), and revisit if paid-conversion volume and cost data justify splitting the path later.

## 6. Recommendation

**Recommended approach: Chromium-based rendering (Puppeteer or Playwright — either is fine; Playwright's more modern API is a mild plus) running on Cloud Run, not Cloud Functions, sharing the same React template components as the live preview.**

**Confidence: high** on the overall direction (Chromium-on-Cloud-Run over Chromium-on-Functions, and over non-browser PDF libraries) given the fidelity requirement ("must match the live preview exactly") — this requirement alone rules out React-PDF/PDFKit/Typst/LaTeX, none of which use the same rendering engine as an HTML/CSS preview. **Confidence is moderate** on exact memory/timeout numbers and current Blaze-tier costs, since Firebase's specific limits and pricing pages are worth re-checking against the live docs at implementation time rather than trusting any fixed number here.

**Week 1 proof-of-concept plan**:
1. Stand up a minimal Cloud Run service running headless Chromium (Playwright), accepting an HTML string and returning a PDF.
2. Render one real CV template to HTML, POST it to the service, confirm pixel-level fidelity against the live preview.
3. Measure cold-start latency with zero min-instances, then again with `min-instances: 1`, to decide whether a warm instance is worth the marginal cost at MVP scale.
4. Wire a Cloud Function (or a Next.js API route) as the thin caller that assembles the HTML and calls the Cloud Run service, so the rest of the app never talks to Chromium directly.

Sample outline (conceptual, not final code):
```
// Cloud Run service (Node + Playwright)
POST /render
  -> receives { html: string }
  -> launches headless Chromium, sets content, applies print CSS
  -> returns application/pdf bytes

// Caller (Cloud Function / Next.js API route)
POST /api/cv/:id/export
  -> loads CV data from Firestore
  -> server-renders the same React template to an HTML string
  -> calls the Cloud Run /render endpoint
  -> streams the PDF back to the client
```

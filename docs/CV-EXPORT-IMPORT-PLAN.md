# CV export and import plan

## Current baseline

KungaCV already renders a resume in the browser and uses `window.print()` with A4 print CSS. The resume workspace exposes an import affordance and `ImportReview`, but the current client flow mainly validates text and maps the first line, email, and phone into the local draft. This is a useful prototype, not yet a complete document conversion pipeline.

## Implementation status — current slice

- **Server PDF export:** implemented at authenticated `POST /resumes/export`. It seeds the existing editor render into a restricted Puppeteer Core + Chromium worker, waits for fonts and `#resume-print-root`, applies the existing A4 print CSS, and streams the PDF without temporary files. Browser print remains the fallback for local/offline drafts.
- **Structured import:** implemented for `.txt` and `.json` through `utils/parseResume.js`. The result is versioned, normalized into the Redux resume shape, scored with a coarse source confidence, and shown in `ImportReview` before `hydrateResume` applies a new local draft. The original text is retained only in the browser's `kungacv-last-import` review record.
- **Responsive verification:** Playwright checks now cover client `/`, `/resume`, `/resume/create`, and admin `/#/login` at 375px, 768px, and 1920px. The 375px editor overflow found during the first run was fixed by removing the negative action-row margin.
- **Not included yet:** DOCX/PDF/image extraction, strict JSON schema rejection, field-level confidence/source spans, saved-document export ownership lookup, and golden PDF fixtures. These remain Phase 2/3 work rather than being represented as supported features.

## Goals

- Produce deterministic, ATS-readable PDF exports from the same canonical resume data used by the editor.
- Keep export output consistent across templates, fonts, margins, page breaks, and authenticated/local drafts.
- Import common CV files without silently destroying formatting or overwriting a draft.
- Give users a reviewable structured result with confidence and field-level corrections.
- Protect uploaded documents and extracted personal data throughout processing.

## Phase 1 — Puppeteer export proof of concept

1. Extract a dedicated print route or server-rendered export view that accepts a validated resume payload and template identifier. Keep it visually identical to the editor preview but remove editor chrome.
2. Add a backend export endpoint with authenticated ownership checks and explicit entitlement handling. Do not accept arbitrary HTML or arbitrary URLs from clients.
3. Run a pinned Puppeteer/Chromium worker in an isolated export process. Set the viewport and device scale factor, wait for fonts and images, then call `page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })`.
4. Use a restrictive browser context: block non-allowlisted network requests, disable downloads/popups, set a navigation timeout, and never expose the service account or database credentials to the page.
5. Stream the PDF to object storage with a short-lived signed URL, or stream it directly for the first version. Delete temporary files after the response and add retention limits if storage is used.
6. Add golden fixtures for each template at one-page and multi-page lengths. Compare page count, file readability, key text presence, margins, and absence of editor-only elements.
7. Keep browser print as a fallback while the server export is rolled out behind a feature flag.

### Export acceptance criteria

- A4 output is valid and opens in common PDF readers.
- No horizontal clipping or missing fonts on all supported templates.
- Continuation pages retain margins and do not split headings from their content where avoidable.
- Export never includes auth tokens, hidden editor controls, debug output, or other users' data.
- The same input produces stable output within an agreed tolerance.
- Failed exports return a safe retryable error and leave no orphaned sensitive files.

## Phase 2 — Import pipeline foundation

1. Define a versioned normalized schema for personal information, summary, experience, education, skills, projects, certificates, languages, references, and links. Reuse the Redux resume shape only through an explicit mapper.
2. Accept `.txt` and `.json` first. For JSON, validate against a strict schema and reject unknown or oversized payloads. For text, preserve the original text as a review-only source.
3. Add `.docx` extraction in a backend worker using a maintained parser. Strip macros and embedded active content; never execute document code.
4. Add PDF extraction with a text-first parser. Detect scanned/image-only PDFs and route them to an explicit OCR phase rather than pretending extraction succeeded.
5. Add image/scanned-PDF OCR only after privacy, size, timeout, and retention controls are in place. Mark every inferred field with confidence and source spans.
6. Parse into a draft, not directly into the active resume. Show a review screen where users can accept, edit, or discard each section. Never overwrite an existing saved resume without explicit confirmation.
7. Normalize dates, phone numbers, emails, URLs, bullet points, and duplicate entries. Preserve the raw source separately only for the duration needed for review and support diagnostics.

### Import acceptance criteria

- Supported types and size limits are visible before upload.
- Malformed, encrypted, oversized, and image-only files receive actionable errors.
- Imported content is isolated per user and deleted according to a documented retention policy.
- The user sees a field-level preview before applying changes.
- Low-confidence mappings are highlighted rather than silently accepted.
- A failed import cannot corrupt the current Redux draft or server resume.
- Fixtures cover one-column, two-column, multilingual, sparse, and multi-page resumes.

## Phase 3 — Reliability, privacy, and operations

- Queue long-running parsing/export work with bounded concurrency and per-job timeouts.
- Add request IDs and structured metrics without logging resume text, tokens, or raw documents.
- Rate-limit uploads and export requests; enforce MIME sniffing, byte limits, decompression limits, and malware scanning where the hosting environment supports it.
- Encrypt stored source files and generated PDFs, use short-lived signed URLs, and implement deletion on cancellation, expiry, and account deletion.
- Add synthetic end-to-end tests for login, resume ownership, import review, apply/discard, export, and expired sessions.
- Roll out behind feature flags and compare browser versus Puppeteer output before making server export the default.

## Suggested delivery order

1. Dedicated print route and Puppeteer fixture exporter.
2. Authenticated PDF endpoint with direct streaming.
3. TXT/JSON import with schema validation and review UI.
4. DOCX and text-based PDF import.
5. OCR for scanned documents.
6. Queueing, storage retention, observability, and gradual rollout.

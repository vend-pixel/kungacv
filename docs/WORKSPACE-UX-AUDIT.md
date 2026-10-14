# KungaCV workspace UX audit

## What changed in this pass

The product now makes the next action visible at the two highest-friction points:

- **Workspace (`/resume`)**: mobile workspace navigation, an adaptive “next step” card, and clearer continuation language.
- **Resume editor (`/resume/create`)**: a completion checklist, one-tap navigation between content/customization/cover letter, and a working inline rename action.
- **Cover letter (`/cover-letter`)**: preserved as the companion-document destination from both workspace and editor.

The design principle is simple: the document stays central, but every screen should answer **“what should I do next?”** without requiring the user to infer the workflow.

## Research signals applied

FlowCV’s current public journey is intentionally short: choose a template, add experience, customize, then download. It also treats importing an existing document and the first resume as first-class entry points. [1]

The strongest transferable pattern is not its visual styling. It is the sequence and the visibility of the next action: users can choose a direction before filling in a dense form, then keep the finished document in view while editing.

Teal’s current product framing adds a second lesson: resume creation becomes more useful when it connects to the job-search loop, including tailored documents, a cover letter, and a tracker. [2] KungaCV now exposes the companion cover letter in the workspace and editor, while leaving the tracker clearly marked as a future capability rather than pretending it is complete.

## Screen-by-screen action map

### Public home (`/`)

**Primary action:** start a resume without an account.

**Atomic actions to preserve:** choose “Try for free”, view template examples, read the workflow, open pricing/legal pages.

**Next improvement:** add a small “Start with a template / Import an existing resume” choice after the primary CTA so the first click matches the user’s intent.

### Workspace (`/resume`)

**Primary action:** start or continue a document.

**Atomic actions:** choose blank, choose a filtered template, import, open a saved resume, duplicate, delete, create a matching cover letter, sign in to sync.

**Current improvement:** the page now has an adaptive continuation card and a mobile navigation strip. The saved-work area remains separate from template discovery so document management does not compete with creation.

**Next improvement:** replace the import acknowledgement with a real import step that accepts PDF, DOCX, image, or pasted text, then shows a review screen before writing into the resume state.

### Resume editor (`/resume/create`)

**Primary action:** complete the next missing resume section while keeping the preview visible.

**Atomic actions:** rename, edit contact details, add experience, add skills, add education, customize, preview on mobile, download, open cover letter, see save state.

**Current improvement:** the completion checklist turns the editor into a guided sequence without hiding advanced sections. Rename is now functional instead of decorative. The “Build flow” strip reduces the distance to customization and the companion document.

**Next improvements:**

1. Give each section a completion state in the section list, not only in the checklist.
2. Add “Back to workspace” and “Download” to the mobile preview sheet.
3. Add a pre-export check for missing contact details, empty sections, and document overflow.
4. Make the first empty section card explain what a strong entry looks like with one concrete example.

### Cover letter (`/cover-letter`)

**Primary action:** tailor a letter to one recipient and role, then export it.

**Atomic actions:** edit recipient/company/role, refresh from resume, edit greeting/body/closing, choose a matching style, preview, download PDF, return to workspace.

**Next improvements:** add a saved-letter list and a “duplicate for another application” action once multiple documents are supported. Keep the live preview and local-save acknowledgement visible.

### Authentication (`/login`, `/signup`)

**Primary action:** sign in or create an account only when persistence across devices is valuable.

**Next improvements:** replace `alert()` errors with inline field-level errors, disable submit while loading, show password requirements before submission, and preserve the intended destination so a user returns to the document they were editing.

### Pricing (`/pricing`)

**Primary action:** understand the difference between free export and paid benefits, then choose whether to upgrade.

**Next improvements:** show the exact export state before checkout and make the post-payment return path point back to the resume or cover letter that initiated the upgrade.

### Legal pages

**Primary action:** read, navigate, and return to the product.

**Next improvement:** add a compact “Back to KungaCV” action and a consistent support destination without changing the legal copy hierarchy.

## Prioritized follow-up backlog

### P0 — reduce failure and uncertainty

- Real import review flow with format validation and cancel/replace actions.
- Inline authentication errors and loading states.
- Export readiness check with a clear explanation, not a blocking paywall.

### P1 — strengthen the application loop

- Save and duplicate cover letters.
- Job-specific document naming and “duplicate for this role”.
- Lightweight job tracker: company, role, stage, next follow-up date, linked resume, linked cover letter.

### P2 — improve quality and confidence

- Section-level completion badges and examples.
- ATS/export preview check.
- Recent documents and “last opened” ordering in the workspace.

## References

[1]: https://flowcv.com/ "FlowCV free online resume builder"
[2]: https://www.tealhq.com/ "Teal resume and job-search workspace"

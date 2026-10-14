# FlowCV-inspired workflow audit

## What FlowCV makes obvious

FlowCV's public product journey is organized around a short, confidence-building sequence: choose a template, add experience, customize the layout, and download an unlimited PDF. The landing page repeats those steps and makes “import an existing resume” a first-class alternative to starting blank. [1]

The application workspace shown in the reference image reinforces the same model. It uses a compact left rail for Resume, Cover Letter, and Job Tracker, a template-first content area, category chips, large document previews, and a visually prominent import action. This is a better first-run orientation than opening directly into a dense form because the user can choose a visual direction before investing in copy.

FlowCV's cover-letter product treats the letter as a companion document rather than a separate tool. Its public page emphasizes three stages—create, customize, download—and says resume details sync into the letter so the two documents remain consistent. It also highlights live preview, professional templates, language flexibility, and one-click tailoring. [2]

Its free-plan packaging is also part of the workflow: one resume and one cover letter remain free, while unlimited versions, job tracking, imports, and AI features sit behind Pro. The important UX lesson is not the exact pricing but the sequencing: the user can experience the complete drafting and preview loop before a paid export or multi-version decision. [3]

## KungaCV gaps found

KungaCV already had strong foundations: a live resume editor, shared template components, twelve local template presets, autosave for signed-in users, duplicate/delete resume actions, and browser print export. The primary gaps were outside the editor:

1. The resume page behaved like a list, not a career workspace.
2. Template selection lacked filters, categories, and a clear “start from scratch” card.
3. Import existed in the product story but not as a visible dashboard action.
4. Cover letters were absent from the main navigation and product route set.
5. There was no companion-document editor with resume-synced identity details, live preview, local draft persistence, or print export.
6. There was no route manifest entry for the new service.

## Changes implemented

The `/resume` page is now a document-first workspace. It has a desktop rail for Resume, Cover letter, and Job tracker; template filter chips for All, Simple, Modern, and Creative; a start-from-scratch card; real local template thumbnails; an import-existing-resume affordance with supported file types; and a saved-work area that preserves edit, duplicate, and delete actions.

The new `/cover-letter` page provides a three-step editor: recipient and role details, message body, and resume matching. It pulls name, job title, email, phone, address, and recent experience from the existing Redux resume state. It adds classic, editorial, and warm letter styles, a live A4 paper preview, a sync-from-resume action, localStorage autosave, saved status, and print-to-PDF export.

The global navigation now exposes Cover letter, the route manifest includes the new page, and print styling isolates the document from editor chrome without changing resume export behavior.

## Guardrails

The implementation uses KungaCV-owned UI, local assets, and existing data structures. It does not copy FlowCV markup, source code, or proprietary assets. The reference is used for information architecture, workflow sequencing, and interaction patterns only.

## References

[1]: https://flowcv.com/ "FlowCV free online resume builder"
[2]: https://flowcv.com/cover-letter-builder "FlowCV cover letter builder"
[3]: https://flowcv.com/pricing "FlowCV pricing and free-plan details"

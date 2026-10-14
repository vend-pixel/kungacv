# FlowCV-inspired workspace and cover-letter service

## Scope
Improve the existing KungaCV client using FlowCV as a workflow reference, not as a source of copied assets or implementation. Preserve KungaCV's mobile-first, low-bandwidth, ATS-safe and Malawi-relevant product decisions.

## Design direction
- **Design movement:** calm editorial SaaS: warm paper surfaces, ink navigation, electric-blue actions, and document-first previews.
- **Core principles:** template-first orientation; make the next action obvious; keep the document visible; reduce cognitive load; make export confidence-building rather than paywall-first.
- **Color philosophy:** retain KungaCV's electric blue as the signature action color, pair it with near-black ink for trust and warm off-white document surfaces for a more human, print-like feel.
- **Layout paradigm:** persistent left workspace rail on desktop, stacked cards on mobile, with document previews treated as the primary content rather than decorative tiles.
- **Signature elements:** compact workspace rail, template filter chips, and a split editor/preview cover-letter canvas.
- **Interaction:** every primary action is reversible and visible; selected states are explicit; autosave and local drafts are acknowledged in copy.
- **Animation:** use subtle hover/selection transitions only; respect reduced motion.
- **Typography:** keep the existing Poppins system for UI and use template previews as the visual expression of document typography.
- **Brand essence:** a practical, locally-aware career document studio for job seekers who need a polished application quickly. Personality: encouraging, focused, trustworthy.
- **Brand voice:** direct and reassuring. Example: “Pick a look, then make it yours.” / “Your letter stays in sync with your resume.”
- **Wordmark/mark:** reuse the existing KungaCV logo mark; do not introduce a competing brand system.
- **Signature brand color:** `#0070F0`.

## Implementation
- Refresh `/resume` into a workspace dashboard with Resume / Cover letter / Job tracker navigation, template filters, import entry point, saved-resume cards, and a document-first empty state.
- Add `/cover-letter`, a local-first cover-letter editor with resume-synced contact details, editable recipient/job fields, editable letter body, template choices, live paper preview, autosave status, and print-to-PDF export.
- Add global navigation entry point for Cover letter.
- Add route manifest for current client routes.
- Reuse local template thumbnails and existing Redux resume data; do not duplicate or scrape FlowCV assets.

## Project structure
- `frontend/kungacv_client/app/resume/page.jsx`: workspace dashboard.
- `frontend/kungacv_client/app/cover-letter/page.jsx`: cover-letter editor.
- `frontend/kungacv_client/components/Nav.jsx`: global navigation.
- `frontend/kungacv_client/styles/globals.css`: print and workspace styling.
- `frontend/kungacv_client/public/manus-routes.json`: route declarations.

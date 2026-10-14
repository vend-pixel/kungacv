# KungaCV UI refinement prompt

Use this prompt with an implementation agent whenever the product needs another UI/UX refinement pass:

```text
You are refining the KungaCV web product in the existing repository. Preserve current user-facing behavior, cover-letter flows, workspace navigation, resume templates, and authentication/session recovery unless the requested change explicitly replaces them.

First inspect the current branch, recent commits, route structure, Redux resume/auth state, API helpers, and existing design tokens/classes. Do not restore older components over newer work. Identify the smallest coherent slice that improves the requested experience.

Review these routes at 375px, 768px, 1280px, and 1920px:
- /
- /login and /signup
- /resume
- /resume/create
- /cover-letter
- /job-tracker
- /pricing and /payment/result
- the admin portal when the task touches admin UI

For every changed route, check:
1. No horizontal overflow, clipped text, broken sticky/fixed elements, or accidental overlap.
2. Clear hierarchy, consistent spacing, readable contrast, visible keyboard focus, and touch targets of at least 44px where practical.
3. Semantic landmarks, one useful page heading, accessible names for icon-only controls, labels for form inputs, and sensible empty/loading/error states.
4. Authenticated and unauthenticated behavior, expired-session recovery, local-draft safety, and mobile navigation.
5. Export/print behavior: editor chrome must be hidden, A4 margins must remain stable on continuation pages, and no sensitive data may be logged.

Implement minimal source changes that follow the existing patterns. Remove temporary console/debug logging from any touched path. Do not add a dependency unless the existing stack cannot support the requirement and the trade-off is documented.

Verification is mandatory before reporting completion:
- run the relevant lint command(s)
- run the relevant build command(s)
- run focused tests or add a regression test for the changed behavior
- use a browser harness to inspect the rendered routes at the four viewports
- run axe checks on changed routes when available
- run git diff --check and inspect the final diff for conflict markers, secrets, and unrelated changes

Report: changed files, user-visible improvements, accessibility/responsive findings, tests and commands with their actual results, and any intentionally deferred work.
```

## Review checklist

- Start from `origin/main` and inspect the latest workspace and cover-letter work before editing.
- Keep generated screenshots and audit output outside the source tree unless they are intentional evidence.
- Treat browser fixtures as synthetic; never use real credentials or user resumes.
- Prefer a small, reversible PR over a broad visual rewrite.

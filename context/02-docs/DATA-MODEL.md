# DATA-MODEL — Firestore Schema

Rationale for all choices: research-firebase-architecture.md §1.

## Collections

### `users/{userId}`
```
{
  uid: string,
  email: string,
  displayName: string,
  createdAt: timestamp,
  isPro: boolean,            // server-only write (Admin SDK)
  proExpiresAt: timestamp | null,  // server-only write
  plan: "free" | "pro",      // server-only write
}
```
- Subcollection, not a root collection with a `userId` field — simplifies ownership-based security rules and avoids needing a composite index just to list "my CVs."
- `isPro`, `proExpiresAt`, `plan` are never client-writable (see SECURITY.md).

### `users/{userId}/cvs/{cvId}`
```
{
  id: string,
  templateFamily: "standard" | "ngo-government",
  title: string,                 // user-facing label, e.g. "Marketing Internship CV"
  content: {                     // single structured JSON object, not flattened fields
    personalInfo: { fullName, email, phone, location },
    summary: string,
    experience: [ { role, employer, startDate, endDate, description } ],
    education: [ { institution, qualification, startDate, endDate } ],
    skills: [ string ],
    references: [ { name, relationship, contact } ]   // used mainly by ngo-government template
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```
- Stored as one structured JSON object per CV, not further subcollections — realistically stays in the tens of KB, far under Firestore's 1MB document limit, and matches the read/write pattern (whole-document read on edit, whole-document write on save).
- No base64 images embedded here — a profile photo (if ever added) goes in Firebase Storage with a URL reference stored instead.
- No versioning/snapshot history for MVP (explicitly deferred — see research-firebase-architecture.md §1); if added later, a `versions` subcollection written on export events, not on every keystroke.

### `payments/{reference}`
```
{
  reference: string,           // unique per charge attempt, used for idempotency
  userId: string,
  amount: number,
  currency: "MWK",
  channel: string,              // e.g. "Mobile Bank Transfer", "Airtel Money", "Card"
  status: "pending" | "success" | "failed",
  mode: "test" | "live",
  createdAt: timestamp,
  updatedAt: timestamp
}
```
- Independent audit trail separate from PayChangu's own dashboard — useful for support/reconciliation (research-paychangu.md §5).
- Written/updated only by trusted server code (webhook receiver + verify call), never by the client.

## Indexing Notes
- No composite indexes needed for MVP's access patterns (list a user's own CVs by `updatedAt`, look up a payment by `reference`) — both are covered by Firestore's automatic single-field indexes given the subcollection structure chosen.

## Backup/Export
- Firestore managed export (to Cloud Storage) available on Blaze; schedule periodically once there's real user data worth protecting (research-firebase-architecture.md §7).
- User-facing "download all my data" (CV content as JSON + generated PDFs) — supports both good practice and data-protection expectations (research-legal-compliance.md §2).

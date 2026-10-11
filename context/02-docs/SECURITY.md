# SECURITY — CV Builder SaaS

## Threat Model (MVP scope)
- **Unauthorized access to another user's CV data** — mitigated by Firestore security rules scoping all reads/writes to `request.auth.uid == userId` on the `users/{userId}/cvs/{cvId}` path.
- **Client self-upgrading to Pro without paying** — mitigated by making `isPro`/`plan`/`proExpiresAt` non-client-writable in security rules; these fields are only ever set by trusted server code (Admin SDK) after payment verification.
- **Spoofed "payment succeeded" webhook** — mitigated by validating PayChangu's `Signature` header on every webhook request before trusting it; never grant Pro status from a client-side redirect alone (research-paychangu.md §2-3).
- **Replay/duplicate charges** — mitigated by a unique `reference` per charge attempt and server-side re-verification against that reference before crediting Pro status (idempotency pattern, research-paychangu.md §3).
- **Secret key exposure** — PayChangu secret key never reaches the client; all PayChangu API calls originate from trusted server code only.
- **Non-genuine app traffic hitting Firestore/Functions** — mitigated by Firebase App Check.
- **Session hijacking / spoofed userId** — mitigated by verifying the server-side session cookie via the Admin SDK on every API route call; never trusting a client-supplied `userId`.

## Firestore Security Rules (illustrative — full rationale in research-firebase-architecture.md §2)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId
                    && !request.resource.data.diff(resource.data).affectedKeys()
                         .hasAny(['plan', 'isPro', 'proExpiresAt']);
      allow create: if request.auth != null && request.auth.uid == userId;

      match /cvs/{cvId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    // payments collection: no client access at all — server (Admin SDK) only
    match /payments/{reference} {
      allow read, write: if false;
    }
  }
}
```

## Secrets Management
- PayChangu secret key, Firebase Admin SDK credentials: stored as environment variables / secret manager entries on Vercel and in the Cloud Run/Cloud Functions runtime config — never committed to source control, never exposed to the client bundle.

## Data Protection Alignment
- Cross-border data storage (Firebase/Google Cloud servers outside Malawi) disclosed in the Privacy Policy (research-legal-compliance.md §2).
- User-initiated account/data deletion supported, aligned with likely Data Protection Act (2024) expectations — exact statutory requirement not yet confirmed; treat this as a baseline good-practice implementation, not a compliance guarantee (research-legal-compliance.md §2, §10).
- Payment metadata retained in `payments/{reference}` for audit/reconciliation and potential tax record-keeping purposes (research-legal-compliance.md §4).

## Open Items / Flagged Gaps
- Confirm current Data Protection Act (2024) registration/notification obligations directly rather than assuming GDPR-equivalence (research-legal-compliance.md §2).
- Confirm PayChangu's authoritative fee/settlement/KYC details directly with PayChangu rather than relying on the one unconfirmed forum-sourced fee figure found in research (research-paychangu.md §1).

## Out of Scope for MVP
- Formal penetration testing / third-party security audit — reasonable to defer until real payment volume exists, but revisit before scaling beyond the initial MVP cohort.
- Rate-limiting beyond App Check + client debouncing — acceptable at MVP write volume (research-firebase-architecture.md §2); revisit if abuse is observed.

# Agent Guide for clone_flowcv (KungaCV)

This repository is **KungaCV**, a FlowCV-inspired resume builder built as a multi-package application with a NestJS backend, a Next.js resume-builder client, and a Next.js admin dashboard.

- `/backend` — NestJS API (MongoDB, Mongoose, Passport/JWT, Swagger). Package name: `kungacv-backend`.
- `/frontend/flowcv_client` — Resume builder (Next.js 13 App Router, Redux Toolkit + redux-persist, Tailwind CSS, react-beautiful-dnd). Package name: `kungacv_client`.
- `/frontend/flowcv_admin` — Admin dashboard (Next.js 13 Pages Router, React Admin, MUI, Chart.js). Package name: `kungacv_admin`.

Folder names (`flowcv_client`, `flowcv_admin`) are intentionally unchanged; only package names, UI copy, and metadata were rebranded.

---

## Branding (KungaCV)

Design direction: **"Ink chrome + electric blue"** — light workspace, near-black nav/hero/footer panels, electric blue as the sole accent, white resume/ATS preview.

- **Tailwind tokens** (`frontend/flowcv_client/tailwind.config.js`): `brand` scale (50–900, core `#1080F0`/`#0070F0`), `ink` scale (50–950, core `#0A0A0B`/`#111114`). The default `blue` scale is overridden by `brand` (so existing `blue-*` utilities use brand colors); `indigo` maps 600/700 to brand.
- **Logo component**: `frontend/flowcv_client/components/Logo.jsx` — props `variant` (`light`|`dark`), `size` (`sm`|`md`|`lg`), `markOnly`. SVG mark = blue-gradient K over/behind a doc glyph; wordmark is "Kunga" + blue "CV".
- **CSS vars** (`frontend/flowcv_client/styles/globals.css`): `--dark-color: #0a0a0b`, `--link-color: #0050e0`, `--gradient-from: #1080f0`, `--gradient-to: #0040d0`.
- **Buttons**: solid `bg-brand-600 hover:bg-brand-700` (no gradient buttons, no glassmorphism).
- **Kept as-is**: template thumbnails from `prod.flowcvassets.com` (whitelisted in `next.config.js`), serif resume fonts, Poppins, hardcoded backend URL `https://flow-cv-backend.onrender.com` in login/signup, `MONGO_DB_NAME=flowcv`, semantic reds for destructive actions (logout/delete).

---

## Repository Layout

```
clone_flowcv/
├── backend/                 # NestJS application
│   ├── config/app.config.ts # env → config mapping
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts          # entry point, enables CORS, ValidationPipe
│   │   ├── modules/         # user, auth, admin, purchase, subscription, payment, resume
│   │   └── shared/          # guards, helpers, interfaces, DTOs, constants
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── flowcv_client/      # public-facing resume builder
│   │   ├── app/             # Next.js 13 App Router routes
│   │   ├── components/
│   │   ├── redux/           # store, slices, helpers
│   │   ├── utils/           # helpers, constants
│   │   └── styles/
│   └── flowcv_admin/        # admin dashboard
│       ├── pages/           # Next.js 13 Pages Router
│       ├── src/
│       └── components/
└── README.md
```

---

## Essential Commands

There is **no root package.json or workspace configuration**. Run commands from each package directory.

### Backend (`backend/`)

```bash
cd backend
npm install
npm run start:dev     # development watch mode (NestJS)
npm run build         # production build to dist/
npm run start:prod    # run dist/main.js
npm run start         # non-watch dev start
npm run test          # Jest unit tests
npm run lint          # ESLint with auto-fix
```

- Server starts on **port 3000** by default.
- Requires Node.js **>= 19**.

### Resume Client (`frontend/flowcv_client/`)

```bash
cd frontend/flowcv_client
npm install
npm run dev           # Next.js dev server on port 3001
npm run build         # production build
npm run start         # production server
npm run lint          # next lint
```

### Admin Client (`frontend/flowcv_admin/`)

```bash
cd frontend/flowcv_admin
npm install
npm run dev           # Next.js dev server (default port 3000)
npm run build
npm run start
npm run lint
```

---

## Environment Variables

Backend (`backend/.env` — not committed, must be created):

```bash
NODE_ENV=development
SERVER_HOST=localhost
SERVER_PORT=3000
MONGO_URI=mongodb://...
MONGO_DB_NAME=flowcv
MONGO_AUTH_SOURCE=admin
MONGO_USERNAME=
MONGO_PASSWORD=
JWT_SECRET=your_secret_key
PAYCHANGU_SECRET_KEY=sk_live_...
PAYCHANGU_WEBHOOK_SECRET=whsec_...
PAYCHANGU_PRO_PRICE_MWK=5000
PAYCHANGU_PRO_PASS_DAYS=30
```

PayChangu keys are required only for the Pro checkout flow; the app boots without them (checkout endpoint returns a clear error). `PAYCHANGU_PRO_PRICE_MWK` is a placeholder (5,000 MWK one-time 30-day Pro pass) pending launch pricing.

The login/signup pages hardcode the backend URL `https://flow-cv-backend.onrender.com` (kept as-is intentionally). All newer client code (payments, resume persistence) uses `utils/api.js`, which reads `NEXT_PUBLIC_API_URL` with that same URL as fallback.

Client env vars (`frontend/flowcv_client/.env.local`, see `.env.example`): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GTM_ID` (Google Tag Manager container id — GTM snippet and all dataLayer events are disabled when unset), `NEXT_PUBLIC_PRO_PRICE_MWK`, `NEXT_PUBLIC_PRO_PASS_DAYS`.

---

## Backend Architecture

### Framework & Entry Point

- `backend/src/main.ts` bootstraps the NestJS app:
  - Enables CORS globally (`cors: true`).
  - Applies `ValidationPipe` with `whitelist: true`.
  - Listens on port 3000.

### Modules

| Module | Purpose |
|--------|---------|
| `AuthModule` | `/auth/signup`, `/auth/login`, `/auth/profile`, `/auth/update`, `/auth/delete` |
| `UserModule` | User schema/service (no exposed controller beyond auth/admin) |
| `AdminModule` | `/admin/signup`, `/admin/login`, `/admin/create-user`, `/admin/get-users` |
| `PurchaseModule` | `/purchases/` CRUD for transactions |
| `SubscriptionModule` | `/subscription/` CRUD for subscription plans |
| `PaymentModule` | `/payments/initiate`, `/payments/verify`, `/payments/webhook`, `/payments/plans` (PayChangu) |
| `ResumeModule` | `/resumes/` CRUD + duplicate; server-side CV persistence (JWT required) |

### Authentication

- Passport + JWT strategy; tokens signed with `JWT_SECRET` and expire in **30 days**.
- `AuthGuard` (`backend/src/shared/guards/auth.guard.ts`) verifies the `Authorization: Bearer <token>` header.
- Roles are `admin` or `user`. Many admin routes check `req.user.role !== 'admin'`.
- Note: the `JwtStrategy` file contains a placeholder secret (`'your_secret_key'`), but the runtime guard reads from the env config. Keep the env secret in sync if using strategy-based validation.

### Data Layer

- **MongoDB** with **Mongoose**.
- Schemas: `User`, `Purchase`, `Subscription`, `Resume` (CV content stored as Mixed JSON).
- `UserService.createUser` assigns a `uid` via `nanoid()`.
- Soft-delete pattern: `active`, `deleted_at`, `deleted_by`.

### Query Pattern

- Controllers parse incoming query strings, then call `service.getParsedQuery(query)` to normalize them.
- Reusable aggregation helpers live in `backend/src/shared/helpers/aggregations.ts` (filter by `uid`, `email`, `name`, `active`, `user_uid`, `price`, etc.).
- Responses wrap data in objects like `{ users: ... }`, `{ purchases: ... }`.

### DTOs & Validation

- DTOs in `backend/src/shared/dto/user.dto.ts` and per-module `dto/index.ts`.
- Uses `class-validator` + `class-transformer`; `UpdateUserDto` extends `PartialType(CreateUserDto)`.
- Swagger annotations (`@ApiProperty`) are present.

---

## Client Architecture (`flowcv_client`)

### Routing

- Uses the **App Router** (`app/` directory).
- Key routes:
  - `/` — landing page
  - `/resume` — resume dashboard
  - `/resume/create` — resume editor
  - `/login`, `/signup`

### State Management

- **Redux Toolkit** + **redux-persist** (localStorage).
- Slices:
  - `auth` — current user and `access_token`
  - `resume` — full resume data and customization settings
- Store shape: `state.persistedReducer.auth` / `state.persistedReducer.resume`.
- Use the provided hooks: `useAppSelector` and `useAppDispatch` from `redux/hooks.js`.

### Resume Data Model

Resume state lives in `redux/resume/features.js` and `redux/resume/helper.js`.

- `personalInfo`: fullName, jobTitle, email, phone, address, links, image.
- Sections: `professionalExperience`, `education`, `courses`, `skills`, `languages`, `projects`, `certificates`, `interests`.
- `customization`: spacing, layout, colors, font, heading, header, name, job, photo, footer, date, skills/language/interest/certificate/education/professionalExperience display settings.
- `editObj` / `prevObj`: used for add/edit rollback patterns. Almost every edit component follows this:
  1. Sets `editObj` for the in-progress record.
  2. On **Save**, dispatches `resetEditObj` / `resetPrevObj`.
  3. On **Cancel**, either removes the new record or reverts to `prevObj`.

### Null Sentinel

- `NULL_VALUE = "NULL_VALUE"` in `utils/Constants.js` is used to explicitly clear a field when an empty value is intended, because an empty string would otherwise be treated as falsy in the merge helpers.
- Helper `_getValue` returns `obj1[key] === NULL_VALUE ? null : obj1[key] || obj2[key] || null`.

### Path Aliases

Defined in `frontend/flowcv_client/jsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@*": ["./*"]
    }
  }
}
```

Common aliases used in code:

- `@components/...`
- `@redux/...`
- `@utils/...`
- `@styles/...`

Import style is mixed — some use the alias, some use relative imports. Prefer aliases when adding new code.

### Styling

- **Tailwind CSS** with a custom theme.
- Global styles in `styles/globals.css` (imports many Google Fonts, CSS variables, utility classes).
- `next.config.js` whitelists `prod.flowcvassets.com` for `next/image`.
- ESLint is configured to `ignoreDuringBuilds: true` in `next.config.js`.

### Component Organization

| Directory | Purpose |
|-----------|---------|
| `components/LandingPage/` | Landing page sections |
| `components/ResumeComponents/` | Editor forms for resume sections |
| `components/ResumeTemplate/` | Render-only components used by the resume preview |
| `components/customization/` | Customization UI (colors, fonts, layout, spacing, etc.) |
| `components/UserProfile/` | User profile/sidebar |

### Key Libraries

- `@reduxjs/toolkit`, `react-redux`, `redux-persist`
- `lodash` (used for deep clones in reducers)
- `react-beautiful-dnd` (section reordering in customization)
- `react-icons`
- `tailwindcss`

### Adding a New Resume Section

1. Add a new form component under `components/ResumeComponents/`.
2. Add the corresponding template/preview component under `components/ResumeTemplate/`.
3. Add the reducer actions in `redux/resume/features.js`.
4. Add a helper in `redux/resume/helper.js` to normalize the data shape.
5. Add constants to `utils/Constants.js` (icons, IDs, etc.).
6. Register the section in `app/resume/create/page.jsx` and the dropdown/add-content list.

---

## Admin Architecture (`flowcv_admin`)

- Uses **Pages Router** (`pages/` directory).
- `pages/index.tsx` dynamically imports `src/App.tsx` with `ssr: false` because React Admin requires the browser.
- `src/App.tsx` wires up `react-admin` with `Admin`, `Resource`, `Dashboard`, custom `Layout`, and a placeholder `authProvider`.
- Data provider is currently pointed at `jsonplaceholder.typicode.com` for demo purposes (`ra-data-json-server`).
- Charts built with `chart.js` + `react-chartjs-2`.

---

## Code Style & Conventions

### Backend

- Imports grouped with comments:
  - `// THIRD PARTY IMPORTS`
  - `// INNER IMPORTS`
- Classes/Controllers/Services are PascalCase; methods are camelCase.
- DTOs are classes with decorators.
- Soft deletes use `active`, `deleted_at`, `deleted_by`.

### Frontend

- React components are default-exported and often use the same filename as the component.
- Mixed `.jsx` and `.js` files; the project is not TypeScript (admin package uses `.tsx`/`.ts`).
- Tailwind classes are heavily inline; custom CSS is in `globals.css` for variables and component-like classes.
- Redux actions are named like `add<Section>`, `update<Section>`, `remove<Section>`, `setEditObj`, `setPrevObj`, `resetEditObj`, `resetPrevObj`.

---

## Testing

- Backend has Jest configured in `package.json`.
- Frontend has no test setup currently.

Run backend tests with:

```bash
cd backend
npm run test
```

---

## Linting & Formatting

### Backend

- ESLint: `backend/.eslintrc.js` — TypeScript recommended + Prettier.
- Prettier: `backend/.prettierrc` — `singleQuote: true`, `trailingComma: "all"`.

### Client

- ESLint: `frontend/flowcv_client/.eslintrc.json` extends `next/core-web-vitals`.
- Prettier: `frontend/flowcv_client/.prettierrc.json` — `tabWidth: 4`, `singleQuote: false`, `printWidth: 150`, `trailingComma: "es5"`.

### Admin

- ESLint: `frontend/flowcv_admin/.eslintrc.json` extends `next/core-web-vitals`.
- TypeScript strict mode is enabled in `tsconfig.json`.

---

## Important Gotchas

1. **No root workspace or monorepo tooling.** Install dependencies and run scripts inside each package directory.
2. **Port collisions.** The backend defaults to 3000; `flowcv_client` dev server runs on 3001; `flowcv_admin` dev server runs on 3000. Do not run backend and admin dev servers at the same time without changing one port.
3. **Hardcoded API URL.** Login/signup forms call `https://flow-cv-backend.onrender.com`. Local backend testing requires editing those files.
4. **JWT secret mismatch.** `backend/src/modules/auth/strategies/jwt.strategy.ts` has a hardcoded secret. The app mostly uses the custom `AuthGuard` (which reads from env), but if Passport strategy validation is used, secrets must match.
5. **ESLint disabled during client builds.** `next.config.js` has `eslint: { ignoreDuringBuilds: true }`.
6. **Mongoose deprecation warnings.** The code sets `useNewUrlParser` and `useUnifiedTopology`; these may produce deprecation warnings on newer Mongoose versions.
7. **Edit/rollback pattern.** Resume sections rely on `editObj` and `prevObj` for cancel/undo behavior. Modifying the reducer structure without updating this pattern will break the editor cancel flow.
8. **NULL_VALUE sentinel.** Be careful using empty strings for cleared fields; the merge helpers expect `NULL_VALUE` to mean "explicitly empty."
9. **No tests for clients.** Changes to resume components should be manually tested in `/resume/create`.
10. **Admin data provider is mocked.** It currently reads from `jsonplaceholder.typicode.com`, not the local backend.

---

## Useful Files for Quick Reference

- Backend entry: `backend/src/main.ts`
- Backend auth guard: `backend/src/shared/guards/auth.guard.ts`
- Backend config: `backend/config/app.config.ts`
- Client layout/root: `frontend/flowcv_client/app/layout.jsx`
- Client redux store: `frontend/flowcv_client/redux/store.js`
- Resume editor page: `frontend/flowcv_client/app/resume/create/page.jsx`
- Resume constants: `frontend/flowcv_client/utils/Constants.js`
- Admin entry: `frontend/flowcv_admin/src/App.tsx`

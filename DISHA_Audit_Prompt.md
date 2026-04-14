## THE PROMPT

You are a senior MERN stack architect performing a standards compliance audit.

I am working on the **DISHA project** (IIT Hyderabad). My tech lead has defined strict engineering standards that all code must follow. I will give you:

1. The **official standards** (below)

Your job is to **compare my code against every standard**, find every violation or deviation, and produce a detailed Markdown report.

---

## OFFICIAL DISHA STANDARDS

### LAYER OVERVIEW

| Layer           | Technology         | Purpose                          |
| --------------- | ------------------ | -------------------------------- |
| Frontend HOST   | React + TypeScript | Shell application, shared UI     |
| Module Frontend | React + MFE        | Feature modules, micro-frontends |
| Backend API     | Node + Express     | Domain-driven REST API           |
| Database        | MongoDB + Prisma   | Data persistence                 |

---

### FRONTEND HOST — REQUIRED FOLDER STRUCTURE

```
src/
├── assets/          # Static files only — images, icons, fonts. No logic, no cross-imports.
├── config/          # env.ts, federation.ts, routes.ts, constants.ts
├── shared/          # Dumb/presentational components only. No business logic, no API calls.
│   ├── components/  # Button/, Input/, Modal/ etc.
│   ├── styles/
│   └── index.ts     # Must export everything via barrel export
├── features/        # One folder per business domain. Each is fully self-contained.
│   └── <FeatureName>/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── validators/
│       ├── types/
│       └── index.ts  # REQUIRED — public API only. Never skip this.
├── hooks/           # Global hooks used by 2+ features only (useDebounce, useAuth, useMediaQuery)
├── layouts/         # AuthLayout.tsx, DashboardLayout.tsx — structural shell, no business logic
├── pages/           # Route-level components. Composition only. No business logic, no API calls.
├── services/        # Global HTTP infrastructure only — httpClient.ts, authInterceptor.ts
├── styles/          # Global tokens — theme.ts, variables.css, tailwind.config.ts
├── stores/          # Global state only — auth.store.ts, user.store.ts
├── validators/      # Global schemas used by 2+ features — email.schema.ts, password.schema.ts
├── utils/           # Pure functions, no side effects — formatDate.ts, debounce.ts
└── types/           # Global TypeScript contracts — api.types.ts, user.types.ts
```

---

### MODULE FRONTEND — REQUIRED FOLDER STRUCTURE

```
src/
├── assets/
├── config/
├── shared/
├── modules/                        # Primary partitioning layer
│   └── <module-name>/              # kebab-case. E.g. leave/, apar/
│       ├── pages/                  # camelCase filenames. E.g. leaveSummaryPage.tsx
│       │   └── leaveSummaryPage.tsx
│       └── microFrontends/
│           └── <mfe-name>/         # kebab-case
│               ├── components/
│               ├── hooks/
│               ├── interfaces/     # Public contracts (props/events)
│               └── styles/
├── services/
└── utils/
```

---

### BACKEND API — REQUIRED FOLDER STRUCTURE

```
src/
├── config/
├── modules/                        # One folder per business domain
│   └── <domain>/                   # e.g. user/
│       ├── <domain>.controller.ts  # HTTP req/res only — delegates to service
│       ├── <domain>.service.ts     # Business logic — orchestrates repository
│       ├── <domain>.repository.ts  # Database queries — abstracts Prisma/MongoDB
│       ├── <domain>.routes.ts      # Express Router for this module
│       ├── <domain>.schema.ts      # Zod validation schemas
│       └── <domain>.types.ts       # TypeScript types for this module
├── shared/
│   ├── logger/
│   ├── errors/
│   └── response.ts
├── database/
│   ├── prisma/schema.prisma
│   ├── migrations/
│   └── index.ts                    # DB connection singleton
├── middlewares/
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── routes/
│   └── index.ts                    # Central route registration — single source of truth
├── utils/
│   ├── hash.ts
│   └── token.ts
└── server.ts                       # App entry point
```

---

### NAMING CONVENTIONS (STRICT — NO EXCEPTIONS)

| File/Folder Type                 | Convention                             | Valid Examples                                  | Invalid Examples                      |
| -------------------------------- | -------------------------------------- | ----------------------------------------------- | ------------------------------------- |
| Folders                          | kebab-case                             | `user-profile/`, `auth-flow/`                   | `UserProfile/`, `userProfile/`        |
| React component files (.tsx)     | PascalCase                             | `UserProfile.tsx`, `Login.tsx`                  | `userProfile.tsx`, `login.tsx`        |
| Non-React TypeScript files (.ts) | camelCase                              | `httpClient.ts`, `formatDate.ts`                | `HttpClient.ts`, `format-date.ts`     |
| Store files                      | `<name>.store.ts`                      | `auth.store.ts`, `cart.store.ts`                | `authStore.ts`, `auth-store.ts`       |
| Schema/Validator files           | `<name>.schema.ts`                     | `email.schema.ts`                               | `emailSchema.ts`, `emailValidator.ts` |
| Hook files                       | `use<Name>.ts`                         | `useAuth.ts`, `useDebounce.ts`                  | `authHook.ts`, `Auth.hook.ts`         |
| Index/barrel files               | `index.ts`                             | `features/User/index.ts`                        | `User.ts` used as barrel              |
| Backend controller               | `<domain>.controller.ts`               | `user.controller.ts`                            | `UserController.ts`                   |
| Backend service                  | `<domain>.service.ts`                  | `user.service.ts`                               | `UserService.ts`                      |
| Backend repository               | `<domain>.repository.ts`               | `user.repository.ts`                            | `UserRepo.ts`                         |
| TypeScript type files            | camelCase filename, PascalCase exports | `user.types.ts` with `export interface User {}` | `User.types.ts`                       |
| Module frontend page files       | camelCase                              | `leaveSummaryPage.tsx`                          | `LeaveSummaryPage.tsx`                |

---

### ARCHITECTURE RULES (HARD RULES — EACH VIOLATION MUST BE FLAGGED)

#### Dependency Direction

Dependencies must only flow in ONE direction:

```
pages/ → features/ → services/ → shared/
                  ↓
              utils/ / types/
```

**FORBIDDEN imports:**

- `shared/` importing from `features/` ← violation
- `utils/` importing from `features/` ← violation
- Module A importing directly from Module B ← violation
- `pages/` making direct API calls ← violation
- `shared/` components containing business logic ← violation

#### Feature Encapsulation

- Every feature folder MUST have an `index.ts` public API
- Internal files (services, validators, hooks) must NOT be imported directly from outside the feature
- All external consumers must import from `features/<Name>/index.ts` only

#### Pages = Composition Only

- Page files must NOT contain business logic
- Page files must NOT make direct API calls
- Pages import from features via their `index.ts` only

#### Shared = Dumb

- `shared/components/` must have NO feature-specific dependencies
- `shared/components/` must have NO API calls or data fetching
- `shared/` exports everything through `index.ts`

#### Backend Layer Separation

- Controllers must NOT contain business logic
- Controllers must NOT query the database directly
- Services must NOT query the database directly — they call repository methods
- All database queries must live in `*.repository.ts` files

#### Module Frontend Isolation

- Module pages must NOT make direct API calls
- Module pages must NOT own state
- Modules must NOT import from sibling modules
- MFEs communicate only via defined contracts (props/events) — no direct imports between MFEs

---

### MFE READINESS CHECKLIST

Before a feature can be extracted into an MFE, ALL must be true:

- Feature is fully self-contained in `features/<name>/`
- `index.ts` public API is clean and complete
- No cross-feature direct imports
- No shared global state dependency
- Backend module is aligned and independently deployable
- Communication contracts (props/events) are documented

---

### COMMON ANTI-PATTERNS (flag every occurrence)

- Importing directly from one feature into another (bypass of index.ts)
- API calls inside page components
- Business logic inside `shared/` components
- Folder names in PascalCase or camelCase instead of kebab-case
- Missing `index.ts` in a feature folder
- DB queries written directly in controllers
- Cross-module imports in module frontend
- Store files not ending in `.store.ts`
- Schema files not ending in `.schema.ts`
- Multiple React components in a single `.tsx` file

---

## YOUR TASK

Given my codebase (provided below / attached), produce a **Markdown audit report** with the following structure:

```
# DISHA Standards Audit Report

## Summary
- Total violations found: X
- Critical violations: X
- Minor violations: X

## Violations by Category

### 1. Folder Structure Violations
[List each violation with: location, what is wrong, what it should be]

### 2. Naming Convention Violations
[List each violation with: file/folder path, current name, correct name]

### 3. Architecture Rule Violations
[List each violation with: location, rule broken, description of the problem]

### 4. Missing Required Files
[List any required files like index.ts that are absent]

### 5. Anti-Pattern Occurrences
[List each anti-pattern found with file path and explanation]

## MFE Readiness Status
[For each feature/module: READY / NOT READY with blocking reasons]

## Recommended Fixes (Priority Order)
[Ordered list from most critical to least critical, with exact rename/move instructions]
```

Be exhaustive. Check every file and folder path I provide. Do not skip any rule from the standards above.

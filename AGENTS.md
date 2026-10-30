# test-app

> Built with the AI Engineering Kit — a spec-driven workflow for your coding agent.

<!-- AI-ENG-KIT:START (managed — do not edit by hand; refreshed by /verify-setup) -->
## AI Engineering Workflow

This project uses the AI Engineering Kit — a spec-driven workflow. Development runs in phases, each driven by a skill:

`/init → /write-spec → /architecture → /tasks → /build → /qa → /deploy`   (`/refine` & `/audit` anytime · `/dsgvo` when personal data is involved · `/e2e-tests` for critical flows · `/security-check` & `/cleanup` after `/deploy`)

- **Feature specs** live in `features/PROJ-X-name/`: `spec.md` (the contract — WHAT), `design.md` (the technical design — HOW), `tasks.md` (the ordered build plan), `qa-report.md` (the test report).
- **Acceptance Criteria** carry stable IDs (`AC-1`, `AC-2`, …). The chain is **AC → Task → Test**.
- **Project status** is tracked in `features/INDEX.md`.
- `spec.md` is **read-only during `/build`** — it is the stable contract.
- **One working language** for the whole project — the conversation *and* every document the skills write, acceptance criteria included. It is recorded under Key Conventions below.

# General Project Rules

## Working Language (MANDATORY)
The user chose one language for this project at setup. It is recorded in **the canonical memory file → Key Conventions → Working language** (`.ai-eng-kit` → `memory` names that file; a pointer file never carries it) and in `.ai-eng-kit` (`language`). Read it at the start of every session; if both are missing, ask the user once and record the answer in that file rather than guessing.

**This is the language you talk in, not just the language you write files in.** Everything the user reads comes in it:

- **The conversation itself** — every reply, question, interview turn, summary, approval checkpoint, hand-off instruction, status report, error explanation, and the "next step" suggestion at the end of a skill. If the working language is Deutsch, you answer in Deutsch, even when the user's own message is in English, even when the skill you are running is written in English, and even when you are only reporting a command's output. The skills are written in English because they are instructions **to you** — they are not a template for how you speak.
- `docs/PRD.md`, `docs/data-model.md`, `docs/app-shell.md`, `docs/privacy.md`, `docs/tech-debt.md`
- every feature artifact: `spec.md` (including **acceptance criteria and edge cases**), `design.md`, `tasks.md`, `qa-report.md`
- the feature names and descriptions in `features/INDEX.md`

The user can override it for a single reply just by asking ("answer in English this once"). That does not change the setting, and the next reply goes back to the working language. Only an explicit "from now on, use X" changes it — then update the line in the canonical memory file and `.ai-eng-kit`.

**The hand-off lines in the skills are examples of content, not scripts to read out.** Every skill ends with a quoted "next step" — those quotes are written in English because the kit is; say them in the working language. Both forms, so the shape is clear:
- English: "Design is ready. Next step: run `/tasks` to break it into an ordered task list."
- Deutsch: „Das Design steht. Nächster Schritt: `/tasks` ausführen, um daraus eine geordnete Aufgabenliste zu machen."

Half-translated output is the failure mode to avoid: a German spec with English acceptance criteria, English task lists under German designs, or a German conversation that switches to English the moment a skill starts running. One language, every document, every section, every message — including the templates' headings, which you translate as you fill them in.

**Stays English regardless of the setting** — these are code or kit-authored files, identical for every project:
- code: identifiers, types, database columns, API routes, file and folder names (`features/PROJ-3-user-login/`)
- commit messages (`feat(PROJ-X): ...`) and git branch names
- the kit's own files: `.codex/skills/*`, `AGENTS.md`, `docs/production/*`, `features/README.md`

Established technical terms are not translated into either language — *Acceptance Criteria*, *Edge Case*, *Deploy*, *Row Level Security*, *Bug*, *Severity* stay as they are. In German documents, legal terms keep both forms where `/dsgvo` says so (Auftragsverarbeitungsvertrag / DPA).

**Changing the language later** changes only what is written from then on. Never mass-translate existing documents on your own: AC- and EC-IDs and the AC → Task → Test chain must survive, so a retranslation is a deliberate job the user asks for explicitly.

## New Project Detection (MANDATORY)
Before starting ANY work, check if the project has been initialized:
1. Read `docs/PRD.md` - if it still contains placeholder text like "_Describe what you are building_", the project is NOT initialized
2. Read `features/INDEX.md` - if the features table is empty, no features have been defined

**If the project is not initialized:**
- Do NOT write any code or create any components
- Do NOT skip ahead to implementation
- Instead, tell the user — according to `mode` in `.ai-eng-kit`:
  - `new`: "This project hasn't been set up yet. Let's start by defining what you want to build. Run `/init` with a description of your idea (e.g. `/init I want to build a task management app`)."
  - `existing`: "The kit is installed, but it does not know yet how this project runs. Run `/map`, then `/init` — the map reads the project, `/init` proposes the answers and the features it already has, and you confirm them. No product pitch needed; the product already exists."
- If the user already described their idea in the current message, run `/init` automatically with their description

**If the project is initialized but the user requests a feature not yet in INDEX.md:**
- Guide them to run `/write-spec` first to create the feature spec before any implementation

## Change Routing (where every change goes)
Every change to app behavior belongs to a feature, so the docs never drift. Route by type:
- **New capability** (not in INDEX yet) → run `/write-spec` first. Never build straight from a chat request.
- **Change to an existing feature's behavior or scope** → `/refine PROJ-X` to update its spec, then re-run the downstream skills that are affected. **Extending a feature is this case** — a filter, a column, one more option on a screen that has a spec. A new ID is only for what could ship and be tested alone; a follow-up spec per change spreads one feature over contradicting files.
- **Bug in a feature that already has a spec** → the feature isn't meeting its contract. Reopen it: set its INDEX status back to **In Review**, fix it via `/build`, then `/qa` again (a re-verification, scoped to the diff). If the bug exists because a requirement was never written down, `/refine PROJ-X` to add the missing AC/EC first, then build.
- **Trivial, behavior-neutral change** (copy/typo fix, dependency bump, formatting) → make it directly and commit with a clear `chore:`/`fix:` message. No spec needed.

Avoid the drift trap: a conversational "just fix/add this" that changes behavior **without** routing through a skill leaves INDEX, `spec.md`, and `qa-report.md` stale. When unsure whether the docs still match reality, run `/audit`.

## Independent Verification
The verifier never carries the builder's context. `/qa` delegates verification to `qa-engineer` sub-agents that receive only the feature folder, the AC-IDs, the step of the skill that is their scope, `.ai-eng-kit` — or, where the agent has no named sub-agents, runs in a fresh session. A `/qa` typed into the conversation that built the feature is asked to move, not answered there.

## Test Runs
Full suites run only by `/build`'s main agent (per level, at the end) and `/qa`'s owner (once, before the fan-out). Sub-agents, lanes and red proofs run single files.

## Feature Tracking
- All features are tracked in `features/INDEX.md` - read it before starting any work
- Each feature lives in a folder `features/PROJ-X-feature-name/` with `spec.md` (contract), `design.md`, `tasks.md`, and `qa-report.md`
- Feature IDs: `<prefix>-<n>`, sequential (INDEX.md has the next). Prefix = `.ai-eng-kit` → `featurePrefix`, default `PROJ`; **every `PROJ-` in the kit's files stands for it**
- One feature per folder — never combine independent functionalities in one spec

## Git Conventions
- Commit format: `type(PROJ-X): description`
- Types: feat, fix, refactor, test, docs, deploy, chore
- **Feature branches:** each feature is built on its own branch `feat/PROJ-X-name`, never directly on `main`. The **user creates the branch** before `/build` — skills never create or switch branches on their own. The feature stays on that branch through `/build` → `/qa` → `/e2e-tests`. `/deploy` is the only skill that touches branch state: it takes stock of every `feat/*` branch against INDEX before shipping, merges the launch set into `main` after the user's go-ahead, and afterwards *offers* to delete the branches it just merged (`-d`, never `-D`). A branch that is unmerged, outside the launch set, or belongs to no known feature is **reported, never merged or deleted** — only the user knows whether it is unfinished work or something they dropped.
- Check existing features before creating new ones: `ls features/ | grep "<prefix>-"`
- Check existing components and APIs before building. In a kit-scaffolded project: `git ls-files src/components/` and `git ls-files src/app/api/`; in any other project the paths come from `docs/stacks/framework-*.md` or the code itself — never conclude "nothing exists" from a path that is not there

## Human-in-the-Loop
- Always ask for user approval before finalizing deliverables
- Present options using clear choices rather than open-ended questions
- Never proceed to the next workflow phase without user confirmation

## Status Updates (MANDATORY - Write-Then-Verify)
After completing work on any feature, you MUST update tracking files, in this sequence:

1. **Read** the feature files (`spec.md`, `design.md`, `tasks.md`) and `features/INDEX.md` BEFORE editing
2. **Write** your changes with the Edit tool — do NOT just describe them
3. **Re-read** the file to verify the changes are present; if they are missing, repeat step 2

**What to update per feature:**
- `features/INDEX.md` is the **single** place a feature's status lives — keep the status column current. `spec.md`, `design.md`, and `tasks.md` carry **no** status field on purpose: a second copy only ever drifts, and `spec.md` is read-only during `/build` precisely when the status would have to change. A status header found in one of them (older project): delete it, don't sync it.
- `spec.md` is the stable contract and stays **read-only during `/build`** — do not write implementation notes into it.
- Implementation notes (what was built, deviations from the design) go into `design.md` or the git commit; `/qa` writes results to `qa-report.md`.

**What to update in `features/INDEX.md`:**
- **Only the Status cell** (new row: name, one sentence, status, link). INDEX loads into every session — never write what you did into a row: no bug logs, measurements, decisions, notes. Those go into the commit message, `design.md`, `qa-report.md`.
- Valid statuses: Roadmap (after `/init`, no spec yet) → Planned (`/write-spec`) → Architected → Tasked → In Progress (`/build` starts) → In Review (`/qa` starts) → Approved (`/qa` passed, no critical/high bugs) → Deployed.
  - For features that predate the kit: **Mapped** (confirmed at `/init` from `/map`'s proposal, no spec folder yet) → **Spec'd** (after `/reverse-spec`: runs in production, not yet verified), joining the flow at `/qa`.
  - **Merged**: `/refine` folded this spec into another feature; the row names it, the folder is in `features/archive/`. Never build against it.

**NEVER:** claim an update without calling the Edit tool · summarize changes in chat instead of writing them · skip an update as "obvious" or "minor".

## File Handling
- ALWAYS read a file before modifying it - never assume contents from memory
- After context compaction, re-read files before continuing work
- When unsure about current project state, read `features/INDEX.md` first
- Run `git diff` to verify what has already been changed in this session
- Never guess at import paths, component names, or API routes - verify by reading

## Handoffs Between Skills
- After completing a skill, suggest the next skill to the user
- Format: "Next step: Run `/skillname` to [action]"
- Handoffs are always user-initiated, never automatic

## Layers (a repo with more than one runtime)
`.ai-eng-kit` → `layers` lists the runtimes this repo has beside the primary stack — a pipeline, a CLI, a worker — each with its `root`, its own `commands` and `probe`, and its `packs`. For any work under a layer's `root`: read that layer's `packs` (in order) **before** the stack packs, run its `commands` instead of the top level's, and verify against its `probe`. A layer's `null` is the same "ask, never guess" as at the top level. An empty list means one runtime, and nothing here applies.
# Security Rules

These hold in every project, whatever it is built with. Where a rule needs a concrete mechanism — a
validator, a throttle, a place to configure headers — the matching guide in `docs/stacks/` carries
it. **A missing pack is never a reason to skip a rule.** It is a reason to ask how this project does
it, and to say so plainly rather than inventing an answer.

## Secrets Management
- NEVER commit secrets, API keys, or credentials to git.
- Real secrets live in the project's local environment file, which is git-ignored.
- Every variable the project needs is documented, with a dummy value, in its example env file.
- **Know which values reach the browser.** Most frameworks expose an environment variable to
  client-side code only when its name follows a particular convention — `docs/stacks/framework-*.md`
  names the one this project uses. A server secret that accidentally follows that convention is
  baked into the deployed JavaScript and served to every visitor from the first page load. Check the
  name before you set the value, not after.

## Handling the real env file (don't fight the permissions)
- **Never read, edit, or create the project's real environment file** (`.env.local`, or whatever it
  is called here) — it holds the user's private keys and is permission-blocked. If a write is
  denied, do **not** retry it; that is by design.
- **The example env file is the one you may read and write.** When a feature needs a new variable,
  add a **placeholder** line there with a dummy value, so it is documented.
- **To put a real value into the real env file, ask the user in chat** — state the exact key and
  where to get the value ("add `X=…` — it's the API URL from your provider's dashboard"). The user
  pastes it themselves. Never try to write the real value yourself.

## Input Validation
- Validate ALL user input **on the server**, against a schema, at the boundary where it arrives
  (Zod in a kit-scaffolded project; otherwise whatever the project already uses).
- Never trust client-side validation alone — it is a convenience for the user, not a control.
- Sanitize data before it reaches the database.

## Authentication
- Always verify authentication before processing a request, in the request path itself — not only
  in the UI that leads there.
- **Enforce access at the data layer as well**, not only in application code: row-level policies,
  scoped queries, whatever this database offers. Two independent checks, because sooner or later one
  of them gets bypassed.
- **Rate-limit anything that checks a credential — login, signup, password reset, magic link, OTP,
  invite codes.** An unlimited login is a working login that anyone can guess their way into, so this
  is part of building auth, never a later hardening step.
  - Whatever the platform throttles for you is **the floor, not the answer.** Those limits are
    typically per IP: they do not stop a distributed attack or credential stuffing, and they cover
    nothing you wrote yourself.
  - Your own throttle is keyed per **IP and per account**, with a CAPTCHA on public forms.
  - The concrete mechanism lives in the stack packs (`docs/stacks/`) and in
    `docs/production/rate-limiting.md`. If neither covers this project, ask — never quietly skip it.
- **Never reveal whether an account exists** — the same message for an unknown address and for a
  wrong password, and comparable response times where it matters. Enumeration is what turns a
  brute-force attempt into an efficient one.
- **Auth forms must submit via POST, never GET.** A form left to submit natively puts every field in
  the URL. How a framework does a POST submit differs (`docs/stacks/framework-*.md`); that it must be
  one does not.

## Sensitive Data in URLs
- NEVER put credentials, tokens, session IDs, or PII in a URL or query string — they leak into
  browser history, server logs, and `Referer` headers.
- Forms carrying sensitive fields (password, email + password, tokens) must POST, never GET.
- A URL like `/login?email=…&password=…` is always a bug: it means a form submitted as a native GET
  instead of through the framework's POST path.

## Security Headers
These are HTTP, not framework-specific — every web project serves them, only the place they are
configured differs (`docs/stacks/framework-*.md`, and `docs/production/security-headers.md` for what
each one does):

- `X-Frame-Options: DENY` (or a CSP `frame-ancestors` directive)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- `Strict-Transport-Security` with `includeSubDomains`

A host can strip or override headers, so they are verified against the live URL, not against the
config file.

## Code Review Triggers
- Any change to **data-access rules** (row-level policies, permission checks, scoped queries)
  requires explicit user approval.
- Any change to the **authentication flow** requires explicit user approval.
- Any **new environment variable** must be documented in the example env file.
<!-- AI-ENG-KIT:END -->

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (copy-paste components)
- **Backend:** Supabase (PostgreSQL + Auth + Storage) - optional
- **Deployment:** Vercel or Hostinger (GitHub-connected auto-deploy)
- **Validation:** Zod + react-hook-form
- **State:** React useState / Context API

## Project Structure

```
src/
  app/              Pages (Next.js App Router)
  features/         Feature implementation: UI, rules, data and integrations together
  components/
    ui/             shadcn/ui components (NEVER recreate these)
  hooks/            Custom React hooks
  lib/              Named shared infrastructure (supabase/) and small shared utilities
supabase/           Created by `supabase init` in /init when the backend is Supabase
  migrations/       Schema changes as .sql files (one per change)
tests/              Playwright E2E tests (added by /e2e-tests)
features/           Feature specs, one folder per feature
  PROJ-X-name/      spec.md, design.md, tasks.md, qa-report.md
  INDEX.md          Feature status overview
docs/
  PRD.md            Product Requirements Document
  data-model.md     App-wide data model (entities + relationships); built by /init, refined by /architecture
  app-shell.md      App-wide frame (navigation, layout regions, page pattern); built by /init, refined by /architecture
  privacy.md        What personal data the product processes, why, how long; kept current by /dsgvo
  tech-debt.md      Internal work with a status (refactorings, coverage, cleanup); fed by /map, worked by /refactor
  kit/CHANGELOG.md  The AI Engineering Kit's own release history. Kit-authored; replaced on update.
  production/       Topic guides: error tracking, security headers, rate limiting, performance, DB
  stacks/           Stack packs — the concrete procedures for this project's stack, read by the
                    skills when they need a command or a path. Kit-authored; replaced on update.
```

## Key Conventions

- **Code structure and checks:** Follow the Next.js pack's feature/module convention. `npm run check`
  is the final build check; targeted tests remain the inner loop. See `docs/stacks/framework-nextjs.md`.

- **Working language: Deutsch.** Talk to the user in Deutsch and write every project document in Deutsch — see `AGENTS.md` → Working Language.
- **Feature IDs:** PROJ-1, PROJ-2, etc. (sequential)
- **Commits:** `feat(PROJ-X): description`, `fix(PROJ-X): description`
- **Single Responsibility:** One feature per folder
- **Feature branches:** you create a branch `feat/PROJ-X-name` before `/build`; work stays there through build/QA/E2E, and `/deploy` merges it into `main` to go live. `main` always stays deployable.
- **shadcn/ui first:** NEVER create custom versions of installed shadcn components
- **App shell:** navigation, layout regions, and the page pattern live in `docs/app-shell.md` and belong to the feature recorded there. Reuse those components — never add a second sidebar, header, or nav inside a feature. Changing how the shell behaves is a `/refine` on its owning feature.
- **Parallel build:** `/build` runs file-disjoint [P] tasks from `tasks.md` as isolated subagents
- **Human-in-the-loop:** All workflows have user approval checkpoints
- **Secrets / env files:** Never read, edit, or create `.env.local` (it's permission-blocked and holds your private keys). To document a variable, add a placeholder to `.env.local.example` (the one env file the agent may edit). When a real value is needed, the agent asks you in chat what to paste into `.env.local` — it never writes it itself.
- **Tests:** Unit tests co-located next to source files (`useHook.test.ts` next to `useHook.ts`), written by `/qa`. E2E tests live in `tests/`, added on demand by `/e2e-tests` for critical core journeys only.
- **Supabase environments:** The test-vs-live strategy (`local` / `two-projects` / `single` / `branching`) is chosen at `/init` and recorded in `docs/PRD.md` → Constraints. Default is **`local`** — Supabase runs in Docker while you build, then migrates to a hosted live project at `/deploy` (`supabase db push`). `.env.local` always holds **test** keys, never live. Schema changes are captured as `supabase/migrations/*.sql` and promoted to production at `/deploy`.

## Build & Test Commands

```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run start        # Production server
npm test             # Vitest unit/integration tests
npm run test:e2e     # Playwright E2E tests
npm run test:all     # Both test suites
```

## Product Context

@docs/PRD.md

## Data Model

@docs/data-model.md

## Feature Overview

@features/INDEX.md

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Frontend Build Workflow

This workflow replaces the Vue-oriented draft with the actual target stack for this project: Next.js App Router + React, backed by DB-service, AI-service, and Supabase as described in `TECH_STACK_CONTRACT.md`.

## Current State

- Source of truth for UI intent: `.design-artifact/design-blueprint.html`
- Feature and interaction handoff: `.design-artifact/README.md`
- Backend/API contract: `.design-artifact/TECH_STACK_CONTRACT.md`
- Impeccable strategy context: `PRODUCT.md`
- Visual system context: `DESIGN.md`

The blueprint is a design reference, not production code. Recreate it as real React components and typed application state.

## Step 1: Lock Context

Use:

```text
$impeccable init
```

Answer with:

```text
Register: product.

Brand personality: Calm, Precise, Reassuring.

Anti-references: not a generic SaaS admin dashboard, not a soulless Notion/Jira clone, not a cold bureaucratic government form, and not a gamified consumer app with badges, confetti, or streaks.

Accessibility: WCAG AA as the floor, with extra care for deadlines, money amounts, tabular figures, keyboard access, visible focus, reduced motion, and plain-language labels for Applicant, Family, and Counselor users.
```

This repo now has `PRODUCT.md` and `DESIGN.md`, so future Impeccable commands should use those files instead of asking the same strategy questions again.

## Step 2: Scaffold Next.js, Not Vue

Create the frontend as a Next.js App Router project. The browser must call only Next.js route handlers or Server Actions; it must not call DB-service or AI-service directly.

Recommended first implementation prompt:

```text
Build the initial Next.js App Router frontend for the German Master Application Tracker from `.design-artifact/design-blueprint.html`, `.design-artifact/README.md`, `PRODUCT.md`, and `DESIGN.md`.

Do not embed the blueprint HTML. Recreate the design as real React components.

Start with:
- `app/globals.css` containing the DESIGN.md tokens as CSS custom properties, including light/dark theme variables.
- `app/page.tsx` or `app/(app)/page.tsx` rendering a client-side prototype shell.
- `components/AppShell.tsx`
- `components/Sidebar.tsx`
- `components/LanguageSwitch.tsx`
- `components/FloatingChat.tsx`
- typed mock data matching the API contract fields.

Use Next.js + React + TypeScript. Keep role handling explicit with `role: "applicant" | "family" | "counselor"` and `readOnly` props for mutating controls.
```

## Step 3: Build Component by Component

Do not ask the AI to generate the whole app in one pass. Build one slice, run it, then audit.

Suggested order:

1. App shell, sidebar, language switch, role footer, and floating chat container.
2. Dashboard stat cards, upcoming deadlines, application status, cost donut, scholarship bars.
3. Universities page with `UniversityCard` and role-aware status select.
4. Documents checklist and document progress.
5. Document library with fixed slots plus free-form other files.
6. Costs and budget editor.
7. Timeline with merged university, scholarship, and custom milestones.
8. Scholarships page.
9. Access & Sharing page for Applicant only.
10. Chat assistant API route and streaming UI.

Reusable prompt pattern:

```text
$impeccable craft <component-or-page>

Use `.design-artifact/design-blueprint.html`, `.design-artifact/README.md`, `PRODUCT.md`, and `DESIGN.md`.

Implement `<component-or-page>` as React/TypeScript for Next.js App Router.
Match the blueprint closely for layout, spacing, typography, color, and states.
Use CSS variables from `app/globals.css`.
Accept `readOnly: boolean` wherever the component can mutate data.
Map fields to the API contract exactly, for example `tuitionPerSemester`, `gpaReq`, `apsRequired`, `deadline`, `status`, and `storagePath`.
Meet WCAG AA and provide keyboard-visible focus states.
```

## Step 4: Wire API Boundaries

Once the prototype UI is stable, replace mock state through Next.js route handlers:

- `/api/v1/universities`
- `/api/v1/documents`
- `/api/v1/library`
- `/api/v1/costs`
- `/api/v1/scholarships`
- `/api/v1/timeline`
- `/api/v1/access-tokens/:role`
- `/api/v1/access-tokens/redeem`
- `/api/v1/auth/logout`
- `/api/v1/chat`

Keep browser requests same-origin to Next.js. Next.js attaches session and role before forwarding to DB-service or AI-service.

## Step 5: Audit Before Expanding

Use:

```text
$impeccable audit app components
```

Audit prompt:

```text
Compare the React components in `app/` and `components/` against `.design-artifact/design-blueprint.html`, `PRODUCT.md`, and `DESIGN.md`.

Check:
- layout, spacing, type, color, and component states against the blueprint
- contrast and WCAG AA issues
- keyboard focus and semantic controls
- role gating: Family/Counselor must not see or use mutating actions
- API field mapping against `.design-artifact/TECH_STACK_CONTRACT.md`
- AI slop: generic SaaS cards, decorative gradients, mismatched controls, over-rounding, and weak hierarchy

Fix issues directly after listing them.
```

## Practical Rule

For this project, the best loop is:

```text
init context -> scaffold Next.js tokens and shell -> craft one component/page -> run and inspect -> audit -> move to the next component/page
```

The unit of progress is a working React surface that matches the blueprint, not a large generated file dump.

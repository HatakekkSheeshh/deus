# Handoff: German Master's Application Tracker

## Overview
A web app for tracking a Master's application to German universities (AI / Computer Science focus): university shortlist & entry conditions, a document checklist, a document/file library, cost & budget tracking, an application timeline, a scholarship tracker, role-based access (Applicant / Family / Counselor), and an in-app Q&A assistant.

## About the Design Files
The file in this bundle (`German Master Application.dc.html`) is a **design reference built as a single self-contained HTML prototype** — it demonstrates intended layout, copy, interaction, and visual system, but it is **not production code to copy directly**. It uses a proprietary template/component runtime (`support.js`, not included) that only works inside the design tool it was built in.

**Your task is to recreate this design in the target codebase's real environment** (React, Vue, native mobile, etc.), using that codebase's existing patterns, component libraries, and state management — not by embedding this HTML file. If no frontend framework exists yet in the target project, choose the most appropriate one for a data-heavy CRUD app with role-based views (React is a safe default).

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and interaction states are final-intent — recreate pixel-close using the target codebase's existing design system/component library where one exists. Where no matching component exists yet, follow the exact values below.

## Global layout
Two-pane shell: fixed-width **left sidebar** (260px) + flexible **main content** area, both full-height. Sidebar contains: app title/subtitle, language switch (EN/DE/VI segmented control), nav list (dot + label, active item gets white pill background + shadow), and a footer block (current role name, "view only" badge if applicable, log-out link, a data-source disclaimer).

A floating chat bubble (52px circle, bottom-right, fixed position) opens a 340×440 chat panel above it.

## Design tokens
The design uses a **CSS custom-property theme system**, computed from a small palette array `[bg, sidebarBg, card, accent, ink]`, so recreate it as design tokens rather than hardcoded colors:

- `--bg`, `--sidebar-bg`, `--card`, `--accent`, `--ink` — base palette (5 colors)
- `--ink-06` … `--ink-70` — the ink color at 16 fixed alpha steps (.06, .07, .08, .09, .1, .12, .15, .18, .25, .4, .45, .5, .55, .6, .65, .7) — used for all borders/muted text/dividers instead of a single gray
- `--r-lg` (16px), `--r-pill` (20px), `--r-md` (14/12px), `--r-sm` (8–10px) — radius scale; a "corner style" toggle swaps all four to ~3px for a sharper look
- `--font-heading` — `'Newsreader', serif` (editorial) or `'Work Sans', sans-serif` (utilitarian) — a "type character" toggle switches every heading between the two
- Four preset palettes were designed: warm cream/teal (default), cool slate/blue, deep forest (dark mode), warm terracotta. All are legitimate light/dark theme variants — implement as a proper theme switch, not just a color override.
- Fonts: **Newsreader** (serif, headings) + **Work Sans** (sans, body), loaded from Google Fonts.
- Category/status colors (not theme-dependent): amber `#c98a2e`, coral `#c65b43`, muted brown `#8a8378`, blue `#3a6a8a`, tan `#e8dcc8` — used for urgency and status badges.

## Screens / Views

### 1. Login
Centered card (400px) on the themed background. Language switch at top. Applicant path: email input + "Continue as Applicant" button (primary, full-width, accent background) — session-only, no persistence. Below an "or" divider: a second path for Family/Counselor — a text input for an access-token code (`XXXX-XXXX` format) + "Continue with token" button. Invalid token shows an inline error in coral.

### 2. Dashboard
- Header: greeting title (serif) + subtitle + "Today · <date>" chip.
- 4 stat cards in a row: Universities shortlisted (count), Documents ready (count + progress bar), Est. year-1 cost, Next deadline (colored by urgency + name).
- Row of 2: "Upcoming deadlines" list (4 nearest, dot + label + type + days-left) with a "View timeline →" link; "Application status" list (university name + status pill).
- Row of 2: "Cost breakdown" — a CSS `conic-gradient` donut chart (150px circle) + a color-swatch legend with per-category EUR amounts; "Scholarship progress" — horizontal bar chart, one bar per status (Not applied / In progress / Applied / Awarded) with count.

### 3. Universities
List of cards, one per shortlisted university: name (serif) + program + city, a status `<select>` (Not started / Researching / In progress / Submitted / Offer) styled as a colored pill, a 4-column grid of conditions (GPA requirement, Language, APS required, Application deadline), and a footer row with tuition/semester + external link to the program page.

Sample data (AI/CS programs): TU Munich, RWTH Aachen, Saarland University, KIT.

### 4. Documents (checklist)
Grouped by category (Academic, Personal, Language, APS & uni-assist, Financial). Each row is a click-to-toggle checkbox (custom 19px rounded square) + document name (strikethrough + dimmed when done). Header shows "N / total ready" + a progress bar.

### 5. Document Library
Three fixed categories, each listing named documents (e.g. "Goethe-Institut course materials", "CV draft (Europass)", "Bachelor degree certificate", "IELTS certificate") with an Upload/Replace button (native file input) and, once a file exists, a "View" link + "Remove" button.

A 4th section, **"Other files"**, is a free-form Drive-like area: a dashed dropzone (drag-and-drop + click-to-browse, multiple files) above a flat list of uploaded files (file-type badge, name, size, View/Remove). Unlike the 3 fixed categories, this list grows/shrinks freely — no predefined slots.

*Note: in the prototype, "uploaded" files are just `URL.createObjectURL()` references — they exist only for the browser tab's lifetime and are never sent anywhere. A real implementation needs actual upload to storage (S3/GCS/etc.) and persistence.*

### 6. Cost & Budget
Two cards: "Before you arrive" (Blocked account, APS fee, uni-assist fee, visa fee — one-time costs) and "Recurring living cost" (semester fee, tuition, health insurance/month, months to budget) — all editable number inputs. Below, a full-width accent-colored summary bar shows the computed total for year 1 with a breakdown sentence.

### 7. Timeline
A merged, date-sorted list combining: every university's application deadline, every scholarship's deadline, and user-added custom milestones. Each row: month/day (serif, large), a colored vertical divider, label + type, an editable `<input type="date">`, and a colored "in Nd" / "Nd overdue" / "Today" pill. Custom milestones get a delete (×) button; university/scholarship rows don't. An "Add milestone" form (text + date + button) sits above the list.

### 8. Scholarships
Cards listing name, provider + amount, deadline, a status `<select>` (Not applied / In progress / Applied / Awarded), and an external "Details" link. Sample data: DAAD Study Scholarships, DAAD EPOS, Deutschlandstipendium, Erasmus Mundus.

### 9. Access & Sharing (Applicant only, hidden from Family/Counselor)
Two cards — "Family member token" and "Counselor token" — each showing the current token (monospace, e.g. `GE69-SBNZ`) or "Not generated yet", with Generate/Regenerate and Copy buttons. A caption explains that regenerating invalidates the old token but doesn't log out anyone already using it.

### 10. Floating chat assistant
Bubble → panel with header (title + close ×), scrollable message list (user bubbles right-aligned/accent-colored, assistant bubbles left-aligned/sidebar-colored), a "thinking…" state, and a text input + Send button (Enter also sends).

## Interactions & Behavior
- **Role-based permissions**: `role = 'applicant' | 'family' | 'counselor'`. Only `applicant` can edit anything — every input/select/button that mutates data is `disabled` and dimmed for the other two roles (view-only). Nav item "Access & Sharing" only renders for `applicant`.
- **Auth flow**: Applicant signs in via email (no real auth in the prototype — any email "works"); this session is **not** persisted, so refreshing logs them out. Family/Counselor sign in with a token generated by the Applicant on the Access & Sharing page; on success, `{role, token}` is cached to `localStorage` so their session survives a reload, and is cleared on the "Log out" click. Tokens themselves are also persisted to `localStorage` so they survive reload for the Applicant too. **This is a client-side-only simulation — a real backend needs actual authentication (e.g. magic-link email for the applicant) and server-issued, revocable share tokens for family/counselor, not client-generated/validated codes.**
- **Language switch**: EN/DE/VI, changes all UI copy instantly (a full translation dictionary keyed by string ID — see "Content" below). Purely a client-side dictionary swap, no i18n library needed but any standard one works.
- **Chat assistant**: calls an LLM with a system prompt that includes the user's current university shortlist, cost assumptions, and scholarship list, so answers are grounded in their live data. In production, replace the prototype's LLM call with your own backend endpoint (never call a model provider directly from the client with a real key).
- **Timeline date edits**: editing a date on a university/scholarship row writes back to that entity's `deadline` field (single source of truth — the timeline doesn't own its own copy of these dates, only of custom milestones).
- **Hover/press states**: nav items and buttons use a subtle background/shadow change on the active/selected state; no elaborate hover animations — keep interactions calm and immediate.

## State Management
Suggested state shape (per user/session):
```
auth: { loggedIn: bool, role: 'applicant'|'family'|'counselor'|null }
accessTokens: { family: string|null, counselor: string|null }
lang: 'en'|'de'|'vi'
theme prefs: { palette, cornerStyle, typeCharacter }  // if you keep the theme picker
universities: [{ id, name, program, city, gpaReq, languageReq, apsRequired, tuitionPerSemester, deadline, status, link }]
documents: [{ id, name, category, done }]
libraryDocs: [{ id, name, category, fileUrl, fileName }]   // fixed slots
otherFiles: [{ id, name, size, fileUrl, uploadedAt }]      // free-form list
costs: { blockedAccountYear, semesterFee, apsFee, uniAssistFee, visaFee, tuitionPerSemester, healthInsuranceMonthly, months }
scholarships: [{ id, name, provider, amount, deadline, link, status }]
customEvents: [{ id, label, date }]           // extra timeline milestones
chatMessages: [{ role, content }]
```
Derived/computed (recompute on render, don't store): document-checklist progress %, year-1 cost total, cost-breakdown chart segments, scholarship-status bar counts, the merged+sorted timeline list, "days until" and urgency color for any date.

## Design Tokens Reference
- Spacing: cards use 20–24px padding, 14–20px gaps between cards, 40/48px page padding.
- Typography: page titles 30–34px/serif/600, card titles 17–19px/serif/600, body 13.5–15px, small labels 11–12.5px uppercase/letter-spacing .04–.05em.
- Shadows: cards have no shadow (border only); the chat panel and login card use a soft `0 8–12px 28–32px rgba(0,0,0,.06–.16)`.
- Borders: 1px, using the `--ink-08` token (roughly 8% black) on light theme.

## Content
All UI copy exists in three languages (EN/DE/VI) in the source file as a flat key→string dictionary per locale — copy this dictionary as your i18n source rather than re-translating from scratch.

## Assets
No external image assets — Google Fonts only (Newsreader, Work Sans). All "charts" are pure CSS (conic-gradient donut, flexbox bars), no chart library or images.

## Files
- `German Master Application.dc.html` — the full design reference (all screens, copy, and interaction logic live in this one file; read it top-to-bottom as the source of truth for anything this README doesn't cover in enough detail).

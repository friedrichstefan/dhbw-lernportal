# Homepage Redesign + Datenschutz/Impressum Links

**Date:** 2026-07-02
**Status:** Approved

## Overview

Replace the current dashboard homepage with a stats-focused layout (Option B) and ensure the existing Datenschutz and Impressum pages are properly linked from the footer.

## New Homepage Layout

### Greeting Row
- Personalised greeting: "Hallo, [Name] 👋" using `session.displayName`
- Subline: "2. Semester DHBW — Dein Lernfortschritt"
- Guest fallback: no name, show guest banner as before

### Stat Widgets (3 cards in a row)
1. **Gesamtfortschritt** — overall average % across all subjects, with a small progress bar underneath
2. **Ø Quiz-Ergebnis** — average of all `quiz_scores` last-results across subjects (KLR, FiBu, IT, Mathe, Programmieren), shown as %
3. **Offene Todos** — count of `todos` where `done === false`, shown as a number

On mobile (≤ 768px): widgets stack 1-column or 3-column compressed; use existing responsive breakpoints.

### Subjects List
- Compact table-style card (single `<div class="card">`) with one row per subject
- Each row: subject name, Klausur label (secondary text), progress bar, % value, arrow indicator
- Clicking a row navigates to `#klr`, `#fibu`, etc. (same as current grid)
- Subjects: KLR, Finanzbuchhaltung, IT 1 & IT 2, Mathematik, Programmieren

### Todo Section
- Heading "To-Do Liste" (same as current)
- Full todo functionality unchanged (add, check, delete)

### Footer
- Already present in `dashboard.js` with `#datenschutz` and `#impressum` links — keep as-is
- Both pages (`datenschutz.js`, `impressum.js`) already registered in `main.js` — routing works, no changes needed

## Datenschutz & Impressum Pages

Both pages (`src/pages/datenschutz.js`, `src/pages/impressum.js`) already exist and are fully implemented. Placeholders (`[Dein Name]`, `[Straße, PLZ Ort]`, `[deine@email.de]`) remain as-is intentionally — this is a private student project.

No changes needed to these files. The footer links in `dashboard.js` (`href="#datenschutz"` and `href="#impressum"`) are already correct.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/dashboard.js` | Rewrite `app.innerHTML` — new layout with greeting, 3 stat widgets, subject list |
| `src/style.css` | Add `.stat-widgets`, `.stat-widget`, `.subject-list`, `.subject-row` CSS classes |

No new files. No changes to routing, auth, or data loading.

## Data Sources

All data already loaded in `dashboard.js`:
- `getProgress()` → `flashcards`, `quiz_scores`, `exercises`, `todos`
- Existing `pctKnown()`, `pctEx()`, `quizPct()`, `avg()` helper functions — reuse as-is
- Quiz average: `avg(quizPct('klr', klrQuiz.length), quizPct('fibu', fibuQuiz.length), quizPct('it', itQuiz.length), quizPct('mathe', matheQuiz.length), quizPct('programmieren', progQuiz.length))`
- Open todos: `todos.filter(t => !t.done).length`

## Out of Scope

- No changes to Datenschutz/Impressum page content
- No new pages or routes
- No changes to SAP welcome toast or guest banner logic
- No dark mode special-casing beyond what CSS variables already handle

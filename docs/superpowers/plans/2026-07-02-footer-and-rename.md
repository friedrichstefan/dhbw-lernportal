# Footer & Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename "DHBW Lernportal" to "learn.portal" everywhere and add a minimal footer with Datenschutz, Impressum, and Copyright to the Login and Dashboard pages.

**Architecture:** The rename touches `index.html` (title + topnav brand + mobile drawer brand) and `login.js` (auth-logo heading). The footer is rendered inline by each page's JS (login.js, dashboard.js) since pages control their own `app.innerHTML`. A shared CSS block in `style.css` handles footer styling.

**Tech Stack:** Vanilla JS, Vite, CSS custom properties (`--color-stone`, `--color-hairline-soft`, `--space-*`)

---

### Task 1: Rename in index.html

**Files:**
- Modify: `lernportal/index.html`

- [ ] **Step 1: Update `<title>`**

In `index.html` line 6, change:
```html
<title>DHBW Lernportal — 2. Semester</title>
```
to:
```html
<title>learn.portal — 2. Semester</title>
```

- [ ] **Step 2: Update topnav brand**

In `index.html` line 13, change:
```html
<span class="topnav-brand">DHBW Lernportal</span>
```
to:
```html
<span class="topnav-brand">learn.portal</span>
```

- [ ] **Step 3: Update mobile drawer brand**

In `index.html` line 34, change:
```html
<span class="topnav-brand">DHBW Lernportal</span>
```
to:
```html
<span class="topnav-brand">learn.portal</span>
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:5173` — browser tab title should read "learn.portal — 2. Semester" and the navbar should show "learn.portal".

- [ ] **Step 5: Commit**

```bash
git -C /Users/I767513/2.Semester_DHBW_WWISEB25/lernportal add index.html
git -C /Users/I767513/2.Semester_DHBW_WWISEB25/lernportal commit -m "rename: DHBW Lernportal → learn.portal in index.html"
```

---

### Task 2: Rename in login.js

**Files:**
- Modify: `lernportal/src/pages/login.js:12-15`

- [ ] **Step 1: Update auth-logo heading and sub-line**

In `login.js` lines 12–15, change:
```html
<div class="auth-logo">
  <span class="auth-logo-text">DHBW Lernportal</span>
  <span class="auth-logo-sub">2. Semester</span>
</div>
```
to:
```html
<div class="auth-logo">
  <span class="auth-logo-text">learn.portal</span>
  <span class="auth-logo-sub">2. Semester · DHBW</span>
</div>
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:5173/#login` — the card header should show "learn.portal" with sub-line "2. Semester · DHBW".

- [ ] **Step 3: Commit**

```bash
git -C /Users/I767513/2.Semester_DHBW_WWISEB25/lernportal add src/pages/login.js
git -C /Users/I767513/2.Semester_DHBW_WWISEB25/lernportal commit -m "rename: update auth card heading to learn.portal"
```

---

### Task 3: Add footer CSS

**Files:**
- Modify: `lernportal/src/style.css`

- [ ] **Step 1: Append footer styles**

At the very end of `src/style.css`, add:

```css
/* ── Site Footer ──────────────────────────────────────── */
.site-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-xxl);
  font-size: 12px;
  color: var(--color-stone);
  border-top: 1px solid var(--color-hairline-soft);
  gap: var(--space-md);
}
.site-footer a {
  color: var(--color-stone);
  text-decoration: none;
}
.site-footer a:hover {
  color: var(--color-ink);
  text-decoration: underline;
}
.site-footer-links {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.site-footer-sep {
  opacity: 0.4;
}
@media (max-width: 600px) {
  .site-footer {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--space-lg) var(--space-base);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/I767513/2.Semester_DHBW_WWISEB25/lernportal add src/style.css
git -C /Users/I767513/2.Semester_DHBW_WWISEB25/lernportal commit -m "style: add .site-footer CSS"
```

---

### Task 4: Add footer to Login page

**Files:**
- Modify: `lernportal/src/pages/login.js:87`

- [ ] **Step 1: Add footer markup after auth-overlay**

In `login.js`, the `render()` function sets `app.innerHTML`. The current content ends with `</div>` (closing `.auth-overlay`) followed by a closing backtick. Replace that closing section:

Change:
```js
          <p class="auth-footer-note" style="margin-top:var(--space-md)">Gast-Fortschritt wird nur lokal gespeichert.</p>
        </div>
      </div>`
```
to:
```js
          <p class="auth-footer-note" style="margin-top:var(--space-md)">Gast-Fortschritt wird nur lokal gespeichert.</p>
        </div>
      </div>
      <footer class="site-footer">
        <span>© 2026 learn.portal</span>
        <div class="site-footer-links">
          <a href="#datenschutz">Datenschutz</a>
          <span class="site-footer-sep">·</span>
          <a href="#impressum">Impressum</a>
        </div>
      </footer>`
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:5173/#login` — a slim footer should appear below the auth card with "© 2026 learn.portal" on the left and "Datenschutz · Impressum" on the right.

- [ ] **Step 3: Commit**

```bash
git -C /Users/I767513/2.Semester_DHBW_WWISEB25/lernportal add src/pages/login.js
git -C /Users/I767513/2.Semester_DHBW_WWISEB25/lernportal commit -m "feat: add site footer to login page"
```

---

### Task 5: Add footer to Dashboard page

**Files:**
- Modify: `lernportal/src/pages/dashboard.js`

- [ ] **Step 1: Locate the end of app.innerHTML in dashboard.js**

Open `src/pages/dashboard.js`. Find the line where `app.innerHTML = \`` is set (around line 53). The template ends with a closing `</div>` and backtick after the page-container div.

- [ ] **Step 2: Append footer after closing page-container**

Find the closing of the main `app.innerHTML` template. It will look like:
```js
    </div>`
```
(the closing of `.page-container`)

Change it to:
```js
    </div>
    <footer class="site-footer">
      <span>© 2026 learn.portal</span>
      <div class="site-footer-links">
        <a href="#datenschutz">Datenschutz</a>
        <span class="site-footer-sep">·</span>
        <a href="#impressum">Impressum</a>
      </div>
    </footer>`
```

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:5173/#dashboard` — the footer should appear below the dashboard content with the same layout as on the login page.

- [ ] **Step 4: Check mobile layout**

Resize browser to < 600px width — footer should stack vertically and center-align.

- [ ] **Step 5: Commit**

```bash
git -C /Users/I767513/2.Semester_DHBW_WWISEB25/lernportal add src/pages/dashboard.js
git -C /Users/I767513/2.Semester_DHBW_WWISEB25/lernportal commit -m "feat: add site footer to dashboard page"
```

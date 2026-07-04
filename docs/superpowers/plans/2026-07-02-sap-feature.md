# SAP-Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SAP-Nutzer mit `@sap.com` E-Mail erhalten beim Login einen exklusiven Bereich, einen Willkommens-Toast und können zwischen drei Themes (Standard/SAP/Minimalist) mit SAP-Intensitätsstufen wählen.

**Architecture:** SAP-Erkennung in `auth.js` beim Anlegen des Userdokuments, drei neue Firestore-Felder (`isSapUser`, `theme`, `sapIntensity`). Theme-Anwendung via CSS-Klassen auf `<body>`, gesetzt in `main.js` nach Auth-State. Neue geschützte Route `#sap` in `src/pages/sap.js`.

**Tech Stack:** Vanilla JS, Firebase Auth + Firestore, CSS Custom Properties, Vite

---

## Dateiübersicht

| Datei | Aktion | Verantwortlichkeit |
|-------|--------|-------------------|
| `src/auth.js` | Modifizieren | SAP-Erkennung in `ensureUserDoc()`, `getSession()` erweitern |
| `src/main.js` | Modifizieren | Theme-Klassen auf `<body>` setzen, SAP-Nav-Link, `#sap` Route schützen |
| `src/style.css` | Modifizieren | CSS-Variablen für SAP- und Minimalist-Theme |
| `src/pages/dashboard.js` | Modifizieren | Willkommens-Toast für SAP-Nutzer |
| `src/pages/profile.js` | Modifizieren | "Erscheinungsbild"-Abschnitt mit Theme-Auswahl |
| `src/pages/sap.js` | Erstellen | Neue geschützte SAP-Seite mit Platzhalter-Inhalten |
| `index.html` | Modifizieren | SAP-Nav-Link im Desktop- und Mobile-Nav |

---

## Task 1: Firestore-Felder + SAP-Erkennung in auth.js

**Files:**
- Modify: `src/auth.js`

- [ ] **Step 1: `ensureUserDoc()` erweitern — SAP-Erkennung beim Anlegen**

  In `src/auth.js` die Funktion `ensureUserDoc` so ändern, dass neue Nutzer mit `@sap.com` automatisch `isSapUser: true`, `theme: 'sap'`, `sapIntensity: 'full'` bekommen. Alle anderen bekommen `isSapUser: false`, `theme: 'default'`.

  Ersetze den Block ab `if (!snap.exists())` in `ensureUserDoc`:

  ```js
  async function ensureUserDoc(firebaseUser, extra = {}) {
    const ref = doc(db, 'users', firebaseUser.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      const colorIndex = Math.floor(Math.random() * AVATAR_COLORS.length)
      const isSap = (firebaseUser.email || '').endsWith('@sap.com')
      await setDoc(ref, {
        displayName: firebaseUser.displayName || extra.displayName || 'Nutzer',
        avatarColor: AVATAR_COLORS[colorIndex],
        createdAt: serverTimestamp(),
        provider: extra.provider || 'email',
        isSapUser: isSap,
        theme: isSap ? 'sap' : 'default',
        sapIntensity: isSap ? 'full' : 'badge',
      })
    }
    return (await getDoc(ref)).data()
  }
  ```

- [ ] **Step 2: `getSession()` erweitern — neue Felder zurückgeben**

  Die Funktion `getSession()` muss `isSapUser`, `theme` und `sapIntensity` zurückgeben:

  ```js
  export async function getSession() {
    const user = auth.currentUser
    if (!user) return null
    const snap = await getDoc(doc(db, 'users', user.uid))
    if (!snap.exists()) return null
    const data = snap.data()
    return {
      uid: user.uid,
      email: user.email,
      displayName: data.displayName,
      avatarColor: data.avatarColor,
      isSapUser: data.isSapUser ?? false,
      theme: data.theme ?? 'default',
      sapIntensity: data.sapIntensity ?? 'badge',
    }
  }
  ```

- [ ] **Step 3: `updateTheme()` Export hinzufügen**

  Neue exportierte Funktion am Ende von `src/auth.js` hinzufügen (vor dem Ende der Datei):

  ```js
  export async function updateTheme(theme, sapIntensity) {
    const user = auth.currentUser
    if (!user) return { error: 'Nicht angemeldet.' }
    try {
      await updateDoc(doc(db, 'users', user.uid), { theme, sapIntensity })
      return { ok: true }
    } catch (e) {
      return { error: 'Theme konnte nicht gespeichert werden: ' + e.message }
    }
  }
  ```

- [ ] **Step 4: Manuell testen**

  Dev-Server starten: `cd lernportal && npm run dev`
  
  - Mit einer `@sap.com`-Adresse registrieren (oder in Firebase Console ein Test-User anlegen)
  - In Firebase Console → Firestore → `users/{uid}` prüfen: `isSapUser: true`, `theme: "sap"`, `sapIntensity: "full"` vorhanden
  - Mit einer normalen Adresse registrieren → `isSapUser: false`, `theme: "default"`

- [ ] **Step 5: Commit**

  ```bash
  git add src/auth.js
  git commit -m "feat: SAP-Erkennung und Theme-Felder in auth.js"
  ```

---

## Task 2: CSS-Theme-Klassen in style.css

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: SAP-Theme CSS-Variablen hinzufügen**

  Am Ende von `src/style.css` (nach dem `html.dark` Block) hinzufügen:

  ```css
  /* ── SAP Theme ─────────────────────────────────────── */
  body.theme-sap {
    --color-sap-gold: #F0AB00;
    --color-sap-blue: #003366;
  }

  body.theme-sap.theme-sap-full {
    --color-primary: #F0AB00;
    --color-primary-deep: #d99a00;
    --color-ink-deep: #003366;
  }

  body.theme-sap.theme-sap-subtle {
    --color-primary: #F0AB00;
    --color-primary-deep: #d99a00;
  }

  /* Badge-only: keine Farbänderung, nur Badge sichtbar */

  /* ── Minimalist Theme ───────────────────────────────── */
  body.theme-minimalist {
    --color-primary: #555555;
    --color-primary-deep: #333333;
    --color-canvas: #ffffff;
    --color-surface-soft: #f8f8f8;
    --color-ink-deep: #111111;
    --color-hairline-soft: #e0e0e0;
  }

  /* ── SAP Badge ──────────────────────────────────────── */
  .sap-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #003366;
    color: #F0AB00;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    letter-spacing: 0.5px;
  }

  /* ── SAP Logo im Header (nur theme-sap-full) ────────── */
  body.theme-sap.theme-sap-full .topnav-brand::before {
    content: 'SAP ';
    color: #F0AB00;
  }

  /* ── Toast ──────────────────────────────────────────── */
  .sap-toast {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #003366;
    color: #F0AB00;
    padding: 12px 24px;
    border-radius: var(--radius-full);
    font-size: 14px;
    font-weight: 700;
    z-index: 9999;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    animation: sap-toast-in 0.3s ease;
  }

  @keyframes sap-toast-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/style.css
  git commit -m "feat: CSS-Theme-Klassen für SAP und Minimalist"
  ```

---

## Task 3: Theme auf `<body>` setzen in main.js

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: `applyTheme()` Hilfsfunktion hinzufügen**

  In `src/main.js` direkt nach den `const`-Deklarationen am Anfang der Datei (nach Zeile 10, nach `const mobileNavClose`) eine neue Funktion einfügen:

  ```js
  function applyTheme(session) {
    const body = document.body
    body.classList.remove('theme-sap', 'theme-sap-badge', 'theme-sap-subtle', 'theme-sap-full', 'theme-minimalist')
    if (!session) return
    const { theme, sapIntensity } = session
    if (theme === 'sap') {
      body.classList.add('theme-sap', `theme-sap-${sapIntensity ?? 'badge'}`)
    } else if (theme === 'minimalist') {
      body.classList.add('theme-minimalist')
    }
  }
  ```

- [ ] **Step 2: `applyTheme()` in `renderNav()` aufrufen**

  In `renderNav()` (Zeile ~137) direkt nach `const session = user ? await getSession() : null` einfügen:

  ```js
  applyTheme(session)
  ```

  Die Funktion `renderNav()` sieht dann so aus:

  ```js
  async function renderNav() {
    const user = getCurrentUser()
    closePopup()

    const session = user ? await getSession() : null
    applyTheme(session)          // ← neu
    const guest = !user && isGuest()
    // ... Rest unverändert
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/main.js
  git commit -m "feat: Theme-Klassen auf body via applyTheme()"
  ```

---

## Task 4: SAP-Seite erstellen (src/pages/sap.js)

**Files:**
- Create: `src/pages/sap.js`

- [ ] **Step 1: Datei erstellen**

  Neue Datei `src/pages/sap.js` mit folgendem Inhalt:

  ```js
  import { registerPage } from '../main.js'
  import { getSession } from '../auth.js'

  registerPage('sap', async (app) => {
    const session = await getSession()
    if (!session?.isSapUser) {
      window.location.hash = 'dashboard'
      return
    }

    app.innerHTML = `
      <div class="page-container">
        <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-xxl)">
          <h1 class="page-title" style="margin-bottom:0">SAP-Bereich</h1>
          <span class="sap-badge">SAP Intern</span>
        </div>

        <div class="card-grid">
          ${['SAP-Lernmaterialien', 'Interne Dokumentation', 'SAP-Tutorials', 'Praxisprojekte'].map(title => `
            <div class="card" style="opacity:0.6;cursor:default">
              <h2 style="font-size:18px;font-weight:700;color:var(--color-ink-deep);margin-bottom:var(--space-md)">${title}</h2>
              <p class="text-secondary" style="font-size:14px">Inhalte folgen demnächst.</p>
              <div style="margin-top:var(--space-lg);padding:var(--space-lg);background:var(--color-surface-soft);border-radius:var(--radius-lg);text-align:center">
                <span style="font-size:24px">🔒</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`
  })
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/pages/sap.js
  git commit -m "feat: SAP-Seite mit Platzhalter-Inhalten"
  ```

---

## Task 5: SAP-Nav-Link + Route-Schutz in main.js und index.html

**Files:**
- Modify: `src/main.js`
- Modify: `index.html`

- [ ] **Step 1: `sap` zur PROTECTED-Liste und zum Import hinzufügen**

  In `src/main.js` Zeile 37 die `PROTECTED`-Konstante erweitern:

  ```js
  const PROTECTED = ['dashboard', 'klr', 'fibu', 'it', 'mathe', 'programmieren', 'profile', 'sap']
  ```

  Im `Promise.all`-Import-Block am Ende von `main.js` (Zeile ~229) `sap.js` hinzufügen:

  ```js
  Promise.all([
    import('./pages/login.js'),
    import('./pages/dashboard.js'),
    import('./pages/klr.js'),
    import('./pages/fibu.js'),
    import('./pages/it.js'),
    import('./pages/mathe.js'),
    import('./pages/programmieren.js'),
    import('./pages/profile.js'),
    import('./pages/sap.js'),       // ← neu
  ]).then(async () => {
  ```

- [ ] **Step 2: Route-Schutz für `#sap` in `route()` hinzufügen**

  In `route()` nach dem bestehenden Profil-Schutz (nach Zeile ~199) einfügen:

  ```js
  if (hash === 'sap' && (!user || !(await getSession())?.isSapUser)) {
    window.location.hash = 'dashboard'
    return route()
  }
  ```

- [ ] **Step 3: SAP-Link in Desktop-Nav (index.html)**

  In `index.html` im `<nav class="pill-tabs" id="main-nav">` Block nach dem Programmieren-Link einfügen:

  ```html
  <a href="#sap" class="pill-tab sap-nav-link" data-page="sap" style="display:none">SAP</a>
  ```

  Im mobilen Nav-Drawer nach dem Programmieren-Link:

  ```html
  <a href="#sap" class="mobile-nav-link sap-nav-link" data-page="sap" style="display:none">SAP</a>
  ```

- [ ] **Step 4: SAP-Nav-Links ein-/ausblenden in renderNav()**

  In `renderNav()` in `src/main.js`, direkt nach `applyTheme(session)`, einfügen:

  ```js
  document.querySelectorAll('.sap-nav-link').forEach(el => {
    el.style.display = session?.isSapUser ? '' : 'none'
  })
  ```

- [ ] **Step 5: Manuell testen**

  - Als SAP-Nutzer anmelden → "SAP"-Tab im Nav sichtbar, Seite lädt mit Platzhaltern
  - Als normaler Nutzer → Tab unsichtbar, direkte URL `#sap` leitet zu `#dashboard` weiter

- [ ] **Step 6: Commit**

  ```bash
  git add src/main.js index.html
  git commit -m "feat: SAP-Nav-Link und Route-Schutz"
  ```

---

## Task 6: Willkommens-Toast in dashboard.js

**Files:**
- Modify: `src/pages/dashboard.js`

- [ ] **Step 1: `getSession` importieren**

  In `src/pages/dashboard.js` den Import oben erweitern:

  ```js
  import { registerPage } from '../main.js'
  import { getProgress, setTodos } from '../progress.js'
  import { isGuest } from '../guest.js'
  import { escapeHtml } from '../escape.js'
  import { getSession } from '../auth.js'    // ← neu
  ```

- [ ] **Step 2: Toast-Funktion hinzufügen und aufrufen**

  Am Ende der Datei (nach der `mountTodos`-Funktion) eine neue Funktion hinzufügen:

  ```js
  function showSapWelcomeToast() {
    if (localStorage.getItem('sap_welcomed') === '1') return
    localStorage.setItem('sap_welcomed', '1')
    const toast = document.createElement('div')
    toast.className = 'sap-toast'
    toast.textContent = '👋 Willkommen! Dein exklusiver SAP-Bereich ist jetzt verfügbar.'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 4000)
  }
  ```

  In der `registerPage('dashboard', async (app) => { ... })` Callback, direkt nach `app.innerHTML = ...` und dem `mountTodos`-Aufruf einfügen:

  ```js
  const session = await getSession()
  if (session?.isSapUser) showSapWelcomeToast()
  ```

  Der betreffende Abschnitt sieht dann so aus:

  ```js
  app.innerHTML = `...`

  mountTodos(document.getElementById('todo-container'), todos)

  const session = await getSession()          // ← neu
  if (session?.isSapUser) showSapWelcomeToast()  // ← neu

  const registerBtn = document.getElementById('guest-register-btn')
  ```

- [ ] **Step 3: Manuell testen**

  - Als SAP-Nutzer anmelden → Toast erscheint oben auf dem Dashboard, verschwindet nach 4s
  - Dashboard neu laden → Toast erscheint nicht mehr (localStorage-Flag gesetzt)
  - `localStorage.removeItem('sap_welcomed')` im Browser-Dev-Tools ausführen → Toast erscheint wieder

- [ ] **Step 4: Commit**

  ```bash
  git add src/pages/dashboard.js
  git commit -m "feat: Willkommens-Toast für SAP-Nutzer"
  ```

---

## Task 7: Theme-Einstellungen in profile.js

**Files:**
- Modify: `src/pages/profile.js`

- [ ] **Step 1: `updateTheme` importieren**

  Den Import oben in `src/pages/profile.js` erweitern:

  ```js
  import { getCurrentUser, getSession, updateProfile, changePassword, deleteAccount, logout, updateTheme } from '../auth.js'
  ```

- [ ] **Step 2: Theme-Zustand zur Profil-Seite hinzufügen**

  In `registerPage('profile', async (app) => { ... })` nach `let pwMsg = ''` einfügen:

  ```js
  let selectedTheme = session.theme ?? 'default'
  let selectedSapIntensity = session.sapIntensity ?? 'badge'
  let themeMsg = ''
  ```

- [ ] **Step 3: "Erscheinungsbild"-Abschnitt in render() einfügen**

  In der `render()`-Funktion, direkt nach dem Passwort-Abschnitt und vor dem Abmelden-Abschnitt, den folgenden Block in `app.innerHTML` einfügen:

  ```js
  <div class="card" style="margin-bottom:var(--space-lg)">
    <h2 class="section-title" style="font-size:18px;margin-bottom:var(--space-lg)">Erscheinungsbild</h2>
    <form id="theme-form">
      <div class="form-field">
        <label class="form-label">Theme</label>
        <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
          ${['default', 'minimalist', ...(session.isSapUser ? ['sap'] : [])].map(t => `
            <label style="display:flex;align-items:center;gap:var(--space-md);cursor:pointer;padding:var(--space-md);border-radius:var(--radius-lg);border:1px solid ${selectedTheme === t ? 'var(--color-primary)' : 'var(--color-hairline-soft)'}">
              <input type="radio" name="theme" value="${t}" ${selectedTheme === t ? 'checked' : ''} style="accent-color:var(--color-primary)" />
              <span style="font-weight:${selectedTheme === t ? '700' : '400'}">${t === 'default' ? 'Standard' : t === 'sap' ? 'SAP' : 'Minimalist'}</span>
            </label>
          `).join('')}
        </div>
      </div>
      ${session.isSapUser && selectedTheme === 'sap' ? `
      <div class="form-field" style="margin-top:var(--space-lg)">
        <label class="form-label">SAP-Intensität</label>
        <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
          ${[['badge', 'Badge (nur Label)'], ['subtle', 'Subtil (Akzentfarbe)'], ['full', 'Vollständig (SAP-Branding)']].map(([val, label]) => `
            <label style="display:flex;align-items:center;gap:var(--space-md);cursor:pointer;padding:var(--space-md);border-radius:var(--radius-lg);border:1px solid ${selectedSapIntensity === val ? 'var(--color-primary)' : 'var(--color-hairline-soft)'}">
              <input type="radio" name="sapIntensity" value="${val}" ${selectedSapIntensity === val ? 'checked' : ''} style="accent-color:var(--color-primary)" />
              <span style="font-weight:${selectedSapIntensity === val ? '700' : '400'}">${label}</span>
            </label>
          `).join('')}
        </div>
      </div>
      ` : ''}
      ${themeMsg ? `<p class="auth-msg ${themeMsg.startsWith('✓') ? 'auth-msg-ok' : 'auth-error'}">${escapeHtml(themeMsg)}</p>` : ''}
      <button type="submit" class="btn btn-primary btn-sm" style="margin-top:var(--space-md)">Theme speichern</button>
    </form>
  </div>
  ```

- [ ] **Step 4: Theme-Form-Handler nach render() verdrahten**

  In `render()` nach den bestehenden Event-Bindings (nach dem `color-swatch`-Block) hinzufügen:

  ```js
  const themeForm = document.getElementById('theme-form')
  if (themeForm) {
    themeForm.querySelectorAll('input[name="theme"]').forEach(radio => {
      radio.onchange = () => { selectedTheme = radio.value; render() }
    })
    themeForm.querySelectorAll('input[name="sapIntensity"]').forEach(radio => {
      radio.onchange = () => { selectedSapIntensity = radio.value; render() }
    })
    themeForm.onsubmit = async (e) => {
      e.preventDefault()
      const result = await updateTheme(selectedTheme, selectedSapIntensity)
      if (result.ok) {
        session.theme = selectedTheme
        session.sapIntensity = selectedSapIntensity
        themeMsg = '✓ Theme gespeichert.'
        window.dispatchEvent(new Event('auth-change'))
      } else {
        themeMsg = result.error
      }
      render()
    }
  }
  ```

- [ ] **Step 5: Manuell testen**

  - Als SAP-Nutzer in Profil → "Erscheinungsbild"-Abschnitt zeigt Standard/SAP/Minimalist + SAP-Intensität
  - Theme wechseln → UI aktualisiert sich sofort (via `auth-change` Event → `applyTheme()`)
  - Als normaler Nutzer → nur Standard/Minimalist sichtbar, keine SAP-Intensität

- [ ] **Step 6: Commit**

  ```bash
  git add src/pages/profile.js
  git commit -m "feat: Theme-Einstellungen im Profil"
  ```

---

## Task 8: SAP-Badge im Nav (theme-sap)

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: SAP-Badge in renderNav() einblenden**

  In `renderNav()` in `src/main.js`, den Abschnitt für `avatarHtml` beim eingeloggten Nutzer erweitern. Nach dem bestehenden Avatar-Button das Badge einfügen:

  ```js
  if (session) {
    const label = session.displayName || session.email
    const sapBadge = session.isSapUser
      ? `<span class="sap-badge" id="nav-sap-badge">SAP Intern</span>`
      : ''
    avatarHtml = `
      ${sapBadge}
      <button id="nav-avatar-btn" class="nav-avatar" style="background:${escapeHtml(session.avatarColor)}" title="${escapeHtml('Profil: ' + label)}">
        ${escapeHtml(initials(label))}
      </button>`
  }
  ```

- [ ] **Step 2: Badge nur bei theme-sap sichtbar machen (CSS)**

  In `src/style.css` zum `.sap-badge`-Abschnitt ergänzen:

  ```css
  /* Badge im Nav nur sichtbar wenn SAP-Theme aktiv */
  #nav-sap-badge {
    display: none;
  }
  body.theme-sap #nav-sap-badge {
    display: inline-flex;
  }
  ```

- [ ] **Step 3: Manuell testen**

  - Als SAP-Nutzer mit SAP-Theme → Badge "SAP Intern" im Header sichtbar
  - Theme auf Standard wechseln → Badge verschwindet

- [ ] **Step 4: Commit**

  ```bash
  git add src/main.js src/style.css
  git commit -m "feat: SAP-Badge im Nav-Header"
  ```

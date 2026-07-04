# SAP-Feature Design

**Datum:** 2026-07-02
**Status:** Approved

## Überblick

Nutzer, die sich mit einer `@sap.com` E-Mail-Adresse registrieren oder anmelden, erhalten Zugang zu einem exklusiven SAP-Bereich und können zwischen verschiedenen Themes wählen. Beim ersten SAP-Login erscheint ein einmaliger Willkommens-Toast.

## Datenschicht

Drei neue Felder im Firestore-Userdokument (`users/{uid}`):

| Feld | Typ | Werte | Default |
|------|-----|-------|---------|
| `isSapUser` | boolean | `true` / `false` | `false` |
| `theme` | string | `"default"` / `"sap"` / `"minimalist"` | `"default"` |
| `sapIntensity` | string | `"badge"` / `"subtle"` / `"full"` | `"full"` |

`sapIntensity` ist nur relevant wenn `theme === "sap"`.

## SAP-Erkennung

In `auth.js` → `ensureUserDoc()`: Beim erstmaligen Anlegen des Userdokuments wird geprüft ob `firebaseUser.email.endsWith('@sap.com')`. Falls ja:
- `isSapUser: true`
- `theme: "sap"`
- `sapIntensity: "full"`

Für bestehende Nutzer ohne diese Felder gilt `isSapUser: false`, `theme: "default"`.

## Theme-System

### CSS-Klassen auf `<body>`

| Zustand | Body-Klassen |
|---------|-------------|
| Standard | *(keine extra Klasse)* |
| SAP Badge | `theme-sap theme-sap-badge` |
| SAP Subtle | `theme-sap theme-sap-subtle` |
| SAP Full | `theme-sap theme-sap-full` |
| Minimalist | `theme-minimalist` |

### Visuelle Auswirkungen

| Theme | Primärfarbe | Header | Badge |
|-------|------------|--------|-------|
| Standard | Blau `#0064e0` | "DHBW Lernportal" | — |
| SAP Full | SAP Gold `#F0AB00` + Dunkelblau `#003366` | SAP-Logo + "Lernportal" | "SAP Intern" |
| SAP Subtle | SAP Gold `#F0AB00` als Akzent | "DHBW Lernportal" | "SAP Intern" |
| SAP Badge | Unverändert | "DHBW Lernportal" | "SAP Intern" |
| Minimalist | Grau/Weiß, kein Primärblau | "DHBW Lernportal" | — |

Theme-Klassen werden in `main.js` beim Auth-State-Change auf `<body>` gesetzt.

## SAP-Bereich (`#sap`)

- Neue Seite `src/pages/sap.js`
- Neuer Menüpunkt im Nav — nur sichtbar wenn `isSapUser === true`
- Zugriffsschutz: Nicht-SAP-Nutzer werden zu `#dashboard` weitergeleitet
- Inhalt: Platzhalter-Karten mit "Inhalte folgen demnächst"

## Willkommens-Toast

- Erscheint beim ersten Besuch des Dashboards nach SAP-Login
- Bedingung: `isSapUser === true` UND `localStorage.getItem('sap_welcomed') !== '1'`
- Text: *"Willkommen! Dein exklusiver SAP-Bereich ist jetzt verfügbar."*
- Verschwindet automatisch nach 4 Sekunden
- Nach Anzeige: `localStorage.setItem('sap_welcomed', '1')`

## Account-Seite (`profile.js`)

Neuer Abschnitt "Erscheinungsbild" in der Profil-Seite:

1. **Gesamt-Theme:** Radio-Auswahl Standard / SAP / Minimalist
2. **SAP-Intensität:** Nur sichtbar wenn Theme = SAP — Radio-Auswahl Badge / Subtil / Vollständig
3. SAP-Optionen nur sichtbar wenn `isSapUser === true`
4. Änderung wird sofort auf `<body>` angewendet und in Firestore gespeichert

## Dateien die geändert werden

| Datei | Änderung |
|-------|---------|
| `src/auth.js` | `ensureUserDoc()` — SAP-Erkennung + neue Felder |
| `src/auth.js` | `getSession()` — `isSapUser`, `theme`, `sapIntensity` zurückgeben |
| `src/main.js` | Theme-Klassen auf `<body>` bei Auth-Change setzen |
| `src/style.css` | CSS-Variablen für SAP- und Minimalist-Theme |
| `src/pages/dashboard.js` | Willkommens-Toast + SAP-Nav-Link |
| `src/pages/profile.js` | "Erscheinungsbild"-Abschnitt |
| `src/pages/sap.js` | Neue Seite (neu erstellen) |

## Nicht in Scope

- Microsoft-Login (als spätere Erweiterung vorgesehen)
- Echter Inhalt im SAP-Bereich (Platzhalter)
- Google/Apple SAP-Mail-Erkennung

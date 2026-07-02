# DHBW Lernportal — Hinweise für Claude

## Firebase Auth — NICHT ANFASSEN

**`signInWithRedirect` darf NICHT verwendet werden.**

Apple und Microsoft Login laufen über `signInWithPopup` (`src/auth.js`). Das ist so gewollt und funktioniert.

Grund: `signInWithRedirect` zwingt das Firebase SDK dazu, beim Seitenstart `apis.google.com/js/api.js` zu laden. Dieser Request hängt mehrere Minuten und blockiert die gesamte App. Außerdem entsteht in Safari ein Login-Loop, weil `onAuthStateChanged` nach dem Redirect kurz `null` emittiert bevor der echte User verfügbar ist.

**Nicht ändern:**
- `signInWithPopup` in `loginWithApple()` und `loginWithMicrosoft()`
- `handleRedirectResult()` bleibt ein No-op
- `waitForAuthReady()` bleibt einfach (kein Settling-Timer nötig)

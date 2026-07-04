import { registerPage } from '../main.js'
import { getSession } from '../auth.js'

/* SAP diagonal slash — mirrors the logo's white slash */
const SLASH_SVG = `
<svg style="position:absolute;top:0;bottom:0;height:100%;pointer-events:none;opacity:.18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 400" preserveAspectRatio="none">
  <polygon points="0,400 60,0 60,400" fill="#ffffff"/>
</svg>`

const tiles = [
  { icon: '📚', title: 'SAP-Lernmaterialien',    desc: 'Offizielle Kurse & Guides direkt aus dem SAP-Ökosystem.' },
  { icon: '📄', title: 'Interne Dokumentation',   desc: 'Prozessstandards und interne Richtlinien für deinen Alltag.' },
  { icon: '🎓', title: 'SAP-Tutorials',            desc: 'Schritt-für-Schritt Anleitungen zu S/4HANA, Fiori & Co.' },
  { icon: '💼', title: 'Praxisprojekte',           desc: 'Echte Systemzugänge und praxisnahe Übungsszenarien.' },
]

function renderTile(t) {
  return `
    <div class="hp-card-category">
      <div class="hp-card-category-icon">${t.icon}</div>
      <h3 class="hp-card-category-title">${t.title}</h3>
      <p class="hp-card-category-desc">${t.desc}</p>
      <div class="hp-card-category-footer">
        <span class="hp-badge-outline">Bald verfügbar</span>
      </div>
    </div>`
}

registerPage('sap', async (app) => {
  const session = await getSession()
  if (!session?.isSapUser) {
    window.location.hash = 'dashboard'
    return
  }

  app.innerHTML = `
    <div class="hp-page">

      <!-- Utility Strip -->
      <div class="hp-utility-strip">
        <span>Exklusiver Bereich für SAP-Mitarbeiter</span>
        <span class="hp-utility-sep">|</span>
        <span class="hp-wordmark-inline">SAP</span>
        <span style="opacity:.6">Duales Studium · DHBW</span>
      </div>

      <!-- Hero -->
      <div class="hp-hero-section">
        <div class="hp-hero-card">
          <div class="hp-hero-visual">
            ${SLASH_SVG}
            <img src="${import.meta.env.BASE_URL}sap-logo.png" alt="SAP" class="hp-sap-logo" />
          </div>
          <div class="hp-hero-copy">
            <p class="hp-eyebrow">SAP-Bereich</p>
            <h1 class="hp-display-lg">Dein exklusiver<br>SAP-Zugang</h1>
            <p class="hp-body-lg" style="margin-bottom:1.5rem">
              Interne Ressourcen, Dokumentationen und praxisnahe
              SAP-Materialien – speziell für DHBW-Dualstudierende bei SAP.
            </p>
            <div class="hp-cta-row">
              <button class="hp-btn hp-btn--primary">LERNPFAD STARTEN</button>
              <button class="hp-btn hp-btn--outline">MEHR ERFAHREN</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Tiles -->
      <div class="hp-section hp-section--cloud">
        <div class="hp-container">
          <h2 class="hp-display-md" style="margin-bottom:1.5rem">Inhaltsbereiche</h2>
          <div class="hp-category-grid">
            ${tiles.map(renderTile).join('')}
          </div>
        </div>
      </div>

      <!-- Dark Ink Slab -->
      <div class="hp-ink-slab">
        <div class="hp-container">
          <div class="hp-ink-slab-inner">
            <div>
              <p class="hp-eyebrow" style="color:rgba(255,255,255,.55)">IN VORBEREITUNG</p>
              <h2 class="hp-display-md" style="color:#fff;margin-bottom:.75rem">
                Inhalte werden bald freigeschaltet
              </h2>
              <p class="hp-body-md" style="color:rgba(255,255,255,.7);max-width:460px">
                Wir bereiten aktuell alle Materialien für dich vor.
                Du wirst benachrichtigt, sobald neue Inhalte verfügbar sind.
              </p>
            </div>
            <button class="hp-btn hp-btn--gold">BENACHRICHTIGEN</button>
          </div>
        </div>
      </div>

    </div>`
})

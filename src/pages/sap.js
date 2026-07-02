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

import { registerPage } from '../main.js'

registerPage('impressum', (app) => {
  app.innerHTML = `
    <div class="page-container" style="max-width:720px">
      <h1 class="page-title">Impressum</h1>

      <div class="card" style="margin-bottom:var(--space-xl)">
        <h2 style="font-size:1.1rem;margin-bottom:var(--space-md)">Angaben gemäß § 5 TMG</h2>
        <p class="text-secondary" style="line-height:1.9">
          <strong>[Dein Name]</strong><br>
          [Straße Hausnummer]<br>
          [PLZ] [Stadt]<br>
          Deutschland
        </p>
      </div>

      <div class="card" style="margin-bottom:var(--space-xl)">
        <h2 style="font-size:1.1rem;margin-bottom:var(--space-md)">Kontakt</h2>
        <p class="text-secondary" style="line-height:1.9">
          E-Mail: <a href="mailto:[deine@email.de]">[deine@email.de]</a>
        </p>
      </div>

      <div class="card" style="margin-bottom:var(--space-xl)">
        <h2 style="font-size:1.1rem;margin-bottom:var(--space-md)">Hinweis zur Verantwortlichkeit</h2>
        <p class="text-secondary" style="line-height:1.7">
          Dieses Portal ist ein privates, nicht-kommerzielles Studentenprojekt und dient ausschließlich der Prüfungsvorbereitung für das 2. Semester an der DHBW. Es besteht keine Gewinnerzielungsabsicht.
        </p>
      </div>

      <div class="card" style="margin-bottom:var(--space-xl)">
        <h2 style="font-size:1.1rem;margin-bottom:var(--space-md)">Haftung für Inhalte</h2>
        <p class="text-secondary" style="line-height:1.7">
          Die Inhalte dieses Portals wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. Als privater Betreiber bin ich gemäß § 7 Abs. 1 TMG für eigene Inhalte nach den allgemeinen Gesetzen verantwortlich. Eine Verpflichtung zur Überwachung übermittelter oder gespeicherter fremder Informationen besteht nicht.
        </p>
      </div>

      <div class="card" style="margin-bottom:var(--space-xl)">
        <h2 style="font-size:1.1rem;margin-bottom:var(--space-md)">Urheberrecht</h2>
        <p class="text-secondary" style="line-height:1.7">
          Die durch den Betreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
        </p>
      </div>

      <p class="text-secondary" style="font-size:12px;margin-top:var(--space-xl)">Stand: Juli 2026</p>
    </div>`
})

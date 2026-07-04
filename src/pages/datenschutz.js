import { registerPage } from '../main.js'

registerPage('datenschutz', (app) => {
  app.innerHTML = `
    <div class="page-container" style="max-width:720px">
      <h1 class="page-title">Datenschutzerklärung</h1>

      <div class="card" style="margin-bottom:var(--space-xl)">
        <h2 style="font-size:1.1rem;margin-bottom:var(--space-md)">1. Verantwortlicher</h2>
        <p class="text-secondary" style="line-height:1.7">
          Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist:<br><br>
          <strong>Stefan Friedrich</strong><br>
          Seckenheimer Landstraße 4A<br>
          Neuostheim, 68163 Mannheim<br>
          Germany<br>
          E-Mail: <a href="mailto:delta.corelabs@gmail.com">delta.corelabs@gmail.com</a>
        </p>
      </div>

      <div class="card" style="margin-bottom:var(--space-xl)">
        <h2 style="font-size:1.1rem;margin-bottom:var(--space-md)">2. Welche Daten wir erheben</h2>
        <p class="text-secondary" style="line-height:1.7;margin-bottom:var(--space-md)">
          Bei der Registrierung und Nutzung des Portals werden folgende personenbezogene Daten verarbeitet:
        </p>
        <ul class="text-secondary" style="line-height:1.9;padding-left:var(--space-xl)">
          <li><strong>E-Mail-Adresse</strong> – zur Identifikation und Anmeldung</li>
          <li><strong>Anzeigename</strong> – zur Personalisierung der Oberfläche</li>
          <li><strong>Lernfortschritt</strong> – Ergebnisse aus Flashcards, Quiz und Übungen</li>
          <li><strong>Authentifizierungsdaten</strong> – bei Anmeldung via Google, Apple oder Microsoft werden die jeweiligen OAuth-Token verwendet; es werden keine Passwörter dieser Dienste gespeichert</li>
        </ul>
        <p class="text-secondary" style="line-height:1.7;margin-top:var(--space-md)">
          Gäste ohne Konto speichern ihren Fortschritt ausschließlich lokal im Browser (localStorage). Es werden dabei keine personenbezogenen Daten an Server übermittelt.
        </p>
      </div>

      <div class="card" style="margin-bottom:var(--space-xl)">
        <h2 style="font-size:1.1rem;margin-bottom:var(--space-md)">3. Zweck und Rechtsgrundlage</h2>
        <p class="text-secondary" style="line-height:1.7">
          Die Daten werden ausschließlich zur Bereitstellung des Lernportals und zur Speicherung deines persönlichen Lernfortschritts verwendet. Rechtsgrundlage ist
          <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> (Vertragserfüllung) sowie
          <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> (berechtigtes Interesse an einer funktionierenden Anwendung). Eine Weitergabe an Dritte zu Werbezwecken findet nicht statt.
        </p>
      </div>

      <div class="card" style="margin-bottom:var(--space-xl)">
        <h2 style="font-size:1.1rem;margin-bottom:var(--space-md)">4. Auftragsverarbeiter: Firebase (Google)</h2>
        <p class="text-secondary" style="line-height:1.7">
          Dieses Portal nutzt <strong>Firebase Authentication</strong> und <strong>Cloud Firestore</strong> der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Firebase verarbeitet Anmeldedaten und Nutzerdaten in unserem Auftrag gemäß Art. 28 DSGVO. Google ist unter dem EU-US Data Privacy Framework zertifiziert, sodass ein angemessenes Datenschutzniveau gewährleistet ist. Weitere Informationen:
          <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">firebase.google.com/support/privacy</a>.
        </p>
      </div>

      <div class="card" style="margin-bottom:var(--space-xl)">
        <h2 style="font-size:1.1rem;margin-bottom:var(--space-md)">5. Speicherdauer</h2>
        <p class="text-secondary" style="line-height:1.7">
          Deine Daten werden so lange gespeichert, wie dein Account aktiv ist. Du kannst deinen Account und alle damit verbundenen Daten jederzeit über die Profileinstellungen dauerhaft löschen.
        </p>
      </div>

      <div class="card" style="margin-bottom:var(--space-xl)">
        <h2 style="font-size:1.1rem;margin-bottom:var(--space-md)">6. Deine Rechte</h2>
        <p class="text-secondary" style="line-height:1.7;margin-bottom:var(--space-md)">
          Du hast nach der DSGVO folgende Rechte gegenüber uns:
        </p>
        <ul class="text-secondary" style="line-height:1.9;padding-left:var(--space-xl)">
          <li><strong>Auskunft</strong> (Art. 15 DSGVO) – welche Daten wir über dich speichern</li>
          <li><strong>Berichtigung</strong> (Art. 16 DSGVO) – Korrektur unrichtiger Daten</li>
          <li><strong>Löschung</strong> (Art. 17 DSGVO) – Löschung deiner Daten ("Recht auf Vergessenwerden")</li>
          <li><strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
          <li><strong>Widerspruch</strong> (Art. 21 DSGVO) – gegen die Verarbeitung auf Basis berechtigten Interesses</li>
          <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
        </ul>
        <p class="text-secondary" style="line-height:1.7;margin-top:var(--space-md)">
          Zur Ausübung deiner Rechte wende dich per E-Mail an <a href="mailto:delta.corelabs@gmail.com">delta.corelabs@gmail.com</a>. Du hast außerdem das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren – zuständig ist der
          <strong>Landesbeauftragte für Datenschutz und Informationsfreiheit Baden-Württemberg</strong>
          (<a href="https://www.baden-wuerttemberg.datenschutz.de" target="_blank" rel="noopener">www.baden-wuerttemberg.datenschutz.de</a>).
        </p>
      </div>

      <div class="card" style="margin-bottom:var(--space-xl)">
        <h2 style="font-size:1.1rem;margin-bottom:var(--space-md)">7. Cookies und lokaler Speicher</h2>
        <p class="text-secondary" style="line-height:1.7">
          Das Portal setzt keine Tracking-Cookies. Firebase Authentication nutzt technisch notwendige Tokens im <code>localStorage</code> des Browsers zur Aufrechterhaltung der Anmeldesitzung. Gast-Fortschritt wird ebenfalls im <code>localStorage</code> abgelegt und verlässt deinen Browser nicht.
        </p>
      </div>

      <p class="text-secondary" style="font-size:12px;margin-top:var(--space-xl)">Stand: Juli 2026</p>
    </div>`
})

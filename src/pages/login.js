import { registerPage } from '../main.js'
import { login, register } from '../auth.js'

registerPage('login', (app) => {
  let mode = 'login'

  function render() {
    app.innerHTML = `
      <div class="auth-overlay">
        <div class="auth-card">
          <div class="auth-logo">
            <span class="auth-logo-text">DHBW Lernportal</span>
            <span class="auth-logo-sub">2. Semester</span>
          </div>

          <div class="sub-tabs" style="justify-content:center;margin-bottom:var(--space-xl)">
            <button class="sub-tab ${mode === 'login' ? 'active' : ''}" id="tab-login">Anmelden</button>
            <button class="sub-tab ${mode === 'register' ? 'active' : ''}" id="tab-register">Registrieren</button>
          </div>

          ${mode === 'login' ? `
            <form id="auth-form" autocomplete="on">
              <div class="form-field">
                <label class="form-label">Benutzername</label>
                <input class="form-input" id="f-username" type="text" autocomplete="username" placeholder="benutzername" maxlength="30" />
              </div>
              <div class="form-field">
                <label class="form-label">Passwort</label>
                <input class="form-input" id="f-password" type="password" autocomplete="current-password" placeholder="••••••" />
              </div>
              <div id="auth-error" class="auth-error" style="display:none"></div>
              <button type="submit" class="btn btn-buy" style="width:100%;margin-top:var(--space-lg)">Anmelden</button>
            </form>
          ` : `
            <form id="auth-form" autocomplete="on">
              <div class="form-field">
                <label class="form-label">Anzeigename</label>
                <input class="form-input" id="f-displayname" type="text" autocomplete="name" placeholder="Dein Name" maxlength="40" />
              </div>
              <div class="form-field">
                <label class="form-label">Benutzername <span class="form-hint">(nur a-z, 0-9, _)</span></label>
                <input class="form-input" id="f-username" type="text" autocomplete="username" placeholder="benutzername" maxlength="30" />
              </div>
              <div class="form-field">
                <label class="form-label">Passwort <span class="form-hint">(mind. 6 Zeichen)</span></label>
                <input class="form-input" id="f-password" type="password" autocomplete="new-password" placeholder="••••••" />
              </div>
              <div class="form-field">
                <label class="form-label">Passwort bestätigen</label>
                <input class="form-input" id="f-password2" type="password" autocomplete="new-password" placeholder="••••••" />
              </div>
              <div id="auth-error" class="auth-error" style="display:none"></div>
              <button type="submit" class="btn btn-buy" style="width:100%;margin-top:var(--space-lg)">Account erstellen</button>
            </form>
          `}

          <p class="auth-footer-note">Alle Daten werden nur lokal in deinem Browser gespeichert.</p>
        </div>
      </div>`

    document.getElementById('tab-login').onclick = () => { mode = 'login'; render() }
    document.getElementById('tab-register').onclick = () => { mode = 'register'; render() }

    document.getElementById('auth-form').onsubmit = async (e) => {
      e.preventDefault()
      const errEl = document.getElementById('auth-error')
      errEl.style.display = 'none'
      const btn = e.target.querySelector('button[type="submit"]')
      btn.disabled = true

      let result
      if (mode === 'login') {
        const username = document.getElementById('f-username').value
        const password = document.getElementById('f-password').value
        result = await login(username, password)
      } else {
        const displayName = document.getElementById('f-displayname').value
        const username = document.getElementById('f-username').value
        const password = document.getElementById('f-password').value
        const password2 = document.getElementById('f-password2').value
        if (password !== password2) {
          result = { error: 'Passwörter stimmen nicht überein.' }
        } else {
          result = await register(username, password, displayName)
        }
      }

      if (result.error) {
        errEl.textContent = result.error
        errEl.style.display = 'block'
        btn.disabled = false
      } else {
        window.location.hash = 'dashboard'
        window.dispatchEvent(new Event('auth-change'))
      }
    }
  }

  render()
})

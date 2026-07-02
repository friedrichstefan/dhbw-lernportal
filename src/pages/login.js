import { registerPage } from '../main.js'
import { login, register, loginWithGoogle, loginWithApple, loginWithMicrosoft } from '../auth.js'
import { activateGuest, clearGuest } from '../guest.js'

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

          <div style="display:flex;flex-direction:column;gap:var(--space-sm);margin-bottom:var(--space-xl)">
            <button id="btn-google" class="btn btn-secondary" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.16C6.51 42.62 14.62 48 24 48z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.16C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.75l7.97-6.16z"/><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.16C12.43 13.72 17.74 9.5 24 9.5z"/></svg>
              Mit Google anmelden
            </button>
            <button id="btn-apple" class="btn btn-secondary" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px">
              <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-152.2-96.7C81 453 80 435.2 80 388.8c0-148.6 99.5-227.7 197.4-227.7 70.4 0 112.9 46.3 157.2 46.3 42.8 0 92.4-49.3 171.9-49.3zm-5.8-298.8c37 0 84.4-24 113.3-55.4 26.2-28.8 45.1-70.9 45.1-113.1 0-5.9-.5-11.8-1.6-16.8-43.3 1.6-95 28.8-126.3 62.2-24.8 27-48.2 68.9-48.2 111.7 0 6.1.6 12.2 1.1 14.2 2.7.4 5.4.6 8.2.6z"/></svg>
              Mit Apple anmelden
            </button>
            <button id="btn-microsoft" class="btn btn-secondary" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px">
              <svg width="18" height="18" viewBox="0 0 23 23"><path fill="#f3f3f3" d="M0 0h23v23H0z"/><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
              Mit Microsoft anmelden
            </button>
          </div>

          <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-xl)">
            <div style="flex:1;height:1px;background:var(--color-hairline-soft)"></div>
            <span class="text-secondary" style="font-size:13px">oder mit E-Mail</span>
            <div style="flex:1;height:1px;background:var(--color-hairline-soft)"></div>
          </div>

          ${mode === 'login' ? `
            <form id="auth-form" autocomplete="on">
              <div class="form-field">
                <label class="form-label">E-Mail</label>
                <input class="form-input" id="f-email" type="email" autocomplete="email" placeholder="name@example.com" />
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
                <label class="form-label">E-Mail</label>
                <input class="form-input" id="f-email" type="email" autocomplete="email" placeholder="name@example.com" />
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

          <div style="display:flex;align-items:center;gap:var(--space-md);margin-top:var(--space-xl)">
            <div style="flex:1;height:1px;background:var(--color-hairline-soft)"></div>
            <span class="text-secondary" style="font-size:13px">oder</span>
            <div style="flex:1;height:1px;background:var(--color-hairline-soft)"></div>
          </div>
          <button id="btn-guest" class="btn btn-secondary" style="width:100%;margin-top:var(--space-lg)">Als Gast fortfahren</button>
          <p class="auth-footer-note" style="margin-top:var(--space-md)">Gast-Fortschritt wird nur lokal gespeichert.</p>
        </div>
      </div>`

    document.getElementById('tab-login').onclick = () => { mode = 'login'; render() }
    document.getElementById('tab-register').onclick = () => { mode = 'register'; render() }

    const oauthHandlers = {
      'btn-google': loginWithGoogle,
      'btn-apple':  loginWithApple,
      'btn-microsoft': loginWithMicrosoft,
    }

    for (const [id, fn] of Object.entries(oauthHandlers)) {
      document.getElementById(id).onclick = async (e) => {
        const btn = e.currentTarget
        btn.disabled = true
        const origText = btn.textContent
        btn.textContent = 'Anmelden…'
        clearError()
        const result = await fn()
        if (result?.ok) {
          window.location.hash = 'dashboard'
          window.dispatchEvent(new Event('auth-change'))
        } else {
          btn.disabled = false
          btn.textContent = origText
          if (result?.error) showError(result.error)
        }
      }
    }

    document.getElementById('btn-guest').onclick = () => {
      activateGuest()
      window.location.hash = 'dashboard'
      window.dispatchEvent(new Event('auth-change'))
    }

    document.getElementById('auth-form').onsubmit = async (e) => {
      e.preventDefault()
      const btn = e.target.querySelector('button[type="submit"]')
      btn.disabled = true
      clearError()

      const email = document.getElementById('f-email').value
      const password = document.getElementById('f-password').value
      let result

      if (mode === 'login') {
        result = await login(email, password)
      } else {
        const displayName = document.getElementById('f-displayname').value
        const password2 = document.getElementById('f-password2').value
        if (password !== password2) {
          result = { error: 'Passwörter stimmen nicht überein.' }
        } else {
          result = await register(email, password, displayName)
        }
      }

      if (result?.error) {
        showError(result.error)
        btn.disabled = false
      } else if (result?.ok) {
        clearGuest()
        window.location.hash = 'dashboard'
        window.dispatchEvent(new Event('auth-change'))
      } else {
        showError('Unbekannter Fehler. Bitte erneut versuchen.')
        btn.disabled = false
      }
    }

    function showError(msg) {
      const el = document.getElementById('auth-error')
      if (el) { el.textContent = msg; el.style.display = 'block' }
    }

    function clearError() {
      const el = document.getElementById('auth-error')
      if (el) { el.textContent = ''; el.style.display = 'none' }
    }
  }

  render()
})

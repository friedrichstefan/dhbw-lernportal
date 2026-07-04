import { registerPage } from '../main.js'
import { getCurrentUser, getSession, updateProfile, changePassword, deleteAccount, logout, updateTheme } from '../auth.js'
import { escapeHtml } from '../escape.js'

const AVATAR_COLORS = [
  { label: 'Blau', value: '#0064e0' },
  { label: 'Grün', value: '#31a24c' },
  { label: 'Rot', value: '#e41e3f' },
  { label: 'Gelb', value: '#f7b928' },
  { label: 'Lila', value: '#a121ce' },
  { label: 'Cyan', value: '#00a884' },
  { label: 'Orange', value: '#f0784a' },
  { label: 'Pink', value: '#f0284a' },
]

registerPage('profile', async (app) => {
  const firebaseUser = getCurrentUser()
  if (!firebaseUser) { window.location.hash = 'login'; return }

  const session = await getSession()
  if (!session) { window.location.hash = 'login'; return }

  const isEmailProvider = firebaseUser.providerData.some(p => p.providerId === 'password')
  let selectedColor = session.avatarColor
  let profileMsg = ''
  let pwMsg = ''
  let deleteMsg = ''
  let selectedTheme = session.theme ?? 'default'
  let selectedSapIntensity = session.sapIntensity ?? 'badge'
  let themeMsg = ''

  function initials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  function render() {
    app.innerHTML = `
      <div class="page-container" style="max-width:640px">
        <h1 class="page-title">Profil</h1>

        <div class="card profile-hero" style="margin-bottom:var(--space-xxl)">
          <div class="avatar-big" style="background:${escapeHtml(selectedColor)}">${escapeHtml(initials(session.displayName))}</div>
          <div>
            <p style="font-size:20px;font-weight:700;color:var(--color-ink-deep)">${escapeHtml(session.displayName)}</p>
            <p class="text-secondary">${escapeHtml(session.email)}</p>
          </div>
        </div>

        <div class="card" style="margin-bottom:var(--space-lg)">
          <h2 class="section-title" style="font-size:18px;margin-bottom:var(--space-lg)">Profil bearbeiten</h2>
          <form id="profile-form">
            <div class="form-field">
              <label class="form-label">Anzeigename</label>
              <input class="form-input" id="pf-displayname" type="text" maxlength="40" />
            </div>
            <div class="form-field">
              <label class="form-label">Avatar-Farbe</label>
              <div class="color-picker-row">
                ${AVATAR_COLORS.map(c => `
                  <button type="button" class="color-swatch ${selectedColor === c.value ? 'selected' : ''}"
                    style="background:${c.value}" data-color="${c.value}" title="${c.label}"></button>
                `).join('')}
              </div>
            </div>
            ${profileMsg ? `<p class="auth-msg ${profileMsg.startsWith('✓') ? 'auth-msg-ok' : 'auth-error'}">${escapeHtml(profileMsg)}</p>` : ''}
            <button type="submit" class="btn btn-primary btn-sm" style="margin-top:var(--space-md)">Speichern</button>
          </form>
        </div>

        ${isEmailProvider ? `
        <div class="card" style="margin-bottom:var(--space-lg)">
          <h2 class="section-title" style="font-size:18px;margin-bottom:var(--space-lg)">Passwort ändern</h2>
          <form id="pw-form">
            <div class="form-field">
              <label class="form-label">Aktuelles Passwort</label>
              <input class="form-input" id="pw-old" type="password" autocomplete="current-password" placeholder="••••••" />
            </div>
            <div class="form-field">
              <label class="form-label">Neues Passwort</label>
              <input class="form-input" id="pw-new" type="password" autocomplete="new-password" placeholder="••••••" />
            </div>
            <div class="form-field">
              <label class="form-label">Neues Passwort bestätigen</label>
              <input class="form-input" id="pw-new2" type="password" autocomplete="new-password" placeholder="••••••" />
            </div>
            ${pwMsg ? `<p class="auth-msg ${pwMsg.startsWith('✓') ? 'auth-msg-ok' : 'auth-error'}">${escapeHtml(pwMsg)}</p>` : ''}
            <button type="submit" class="btn btn-primary btn-sm" style="margin-top:var(--space-md)">Passwort ändern</button>
          </form>
        </div>
        ` : ''}

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

        <div class="card" style="margin-bottom:var(--space-xxl)">
          <h2 class="section-title" style="font-size:18px;margin-bottom:var(--space-sm)">Abmelden</h2>
          <p class="text-secondary" style="margin-bottom:var(--space-lg)">Du wirst zur Login-Seite weitergeleitet.</p>
          <button id="btn-logout" class="btn btn-secondary btn-sm">Abmelden</button>
        </div>

        <details class="danger-zone">
          <summary>Account löschen</summary>
          <div style="margin-top:var(--space-lg)">
            <p class="text-secondary" style="margin-bottom:var(--space-lg)">Alle deine Lernfortschritte werden unwiderruflich gelöscht.</p>
            ${deleteMsg ? `<p class="auth-msg auth-error">${escapeHtml(deleteMsg)}</p>` : ''}
            <button id="btn-delete" class="btn btn-danger btn-sm">Account dauerhaft löschen</button>
          </div>
        </details>
      </div>`

    app.querySelectorAll('.color-swatch').forEach(btn => {
      btn.onclick = () => { selectedColor = btn.dataset.color; render() }
    })

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

    const displayNameInput = document.getElementById('pf-displayname')
    if (displayNameInput) displayNameInput.value = session.displayName || ''

    document.getElementById('profile-form').onsubmit = async (e) => {
      e.preventDefault()
      const displayName = document.getElementById('pf-displayname').value
      const result = await updateProfile(displayName, selectedColor)
      if (result.ok) {
        session.displayName = displayName.trim()
        session.avatarColor = selectedColor
        profileMsg = '✓ Profil gespeichert.'
        window.dispatchEvent(new Event('auth-change'))
      } else {
        profileMsg = result.error
      }
      render()
    }

    if (isEmailProvider) {
      document.getElementById('pw-form').onsubmit = async (e) => {
        e.preventDefault()
        const oldPw = document.getElementById('pw-old').value
        const newPw = document.getElementById('pw-new').value
        const newPw2 = document.getElementById('pw-new2').value
        if (newPw !== newPw2) { pwMsg = 'Passwörter stimmen nicht überein.'; render(); return }
        const result = await changePassword(oldPw, newPw)
        pwMsg = result.ok ? '✓ Passwort geändert.' : result.error
        render()
      }
    }

    document.getElementById('btn-logout').onclick = async () => {
      await logout()
      window.dispatchEvent(new Event('auth-change'))
      window.location.hash = 'login'
    }

    document.getElementById('btn-delete').onclick = async () => {
      if (!confirm('Account wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return

      if (isEmailProvider) {
        const password = prompt('Gib dein Passwort ein, um den Account zu löschen:')
        if (!password) return
        const result = await deleteAccount(password)
        if (result.ok) {
          window.dispatchEvent(new Event('auth-change'))
          window.location.hash = 'login'
        } else {
          deleteMsg = result.error
          render()
        }
      } else {
        // Google/Apple: redirect-based re-auth, deletion happens on return
        await deleteAccount()
      }
    }
  }

  render()
})

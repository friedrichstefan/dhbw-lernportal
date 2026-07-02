import { onAuthChange, getCurrentUser, getSession, logout, handleRedirectResult, waitForAuthReady, finishDeleteAfterRedirect } from './auth.js'
import { isGuest, clearGuest } from './guest.js'
import { escapeHtml } from './escape.js'

const app = document.getElementById('app')
const nav = document.getElementById('main-nav')
const themeToggle = document.getElementById('theme-toggle')
const hamburgerBtn = document.getElementById('hamburger-btn')
const mobileNavOverlay = document.getElementById('mobile-nav-overlay')
const mobileNavClose = document.getElementById('mobile-nav-close')

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

function openMobileNav() {
  closePopup()
  mobileNavOverlay.classList.add('open')
  hamburgerBtn.setAttribute('aria-expanded', 'true')
  document.body.style.overflow = 'hidden'
}

function closeMobileNav() {
  mobileNavOverlay.classList.remove('open')
  hamburgerBtn.setAttribute('aria-expanded', 'false')
  document.body.style.overflow = ''
}

hamburgerBtn.addEventListener('click', openMobileNav)
mobileNavClose.addEventListener('click', closeMobileNav)
mobileNavOverlay.addEventListener('click', (e) => {
  if (e.target === mobileNavOverlay) closeMobileNav()
})

const pages = {}

export function registerPage(name, renderFn) {
  pages[name] = renderFn
}

const PROTECTED = ['dashboard', 'klr', 'fibu', 'it', 'mathe', 'programmieren', 'profile', 'sap']

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function providerBadge(user) {
  const id = user.providerData?.[0]?.providerId ?? 'password'
  if (id === 'google.com') return `<span class="avatar-popup-badge"><svg width="12" height="12" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.16C6.51 42.62 14.62 48 24 48z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.16C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.75l7.97-6.16z"/><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.16C12.43 13.72 17.74 9.5 24 9.5z"/></svg>Google</span>`
  if (id === 'apple.com')  return `<span class="avatar-popup-badge"><svg width="12" height="12" viewBox="0 0 814 1000" fill="currentColor"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-152.2-96.7C81 453 80 435.2 80 388.8c0-148.6 99.5-227.7 197.4-227.7 70.4 0 112.9 46.3 157.2 46.3 42.8 0 92.4-49.3 171.9-49.3zm-5.8-298.8c37 0 84.4-24 113.3-55.4 26.2-28.8 45.1-70.9 45.1-113.1 0-5.9-.5-11.8-1.6-16.8-43.3 1.6-95 28.8-126.3 62.2-24.8 27-48.2 68.9-48.2 111.7 0 6.1.6 12.2 1.1 14.2 2.7.4 5.4.6 8.2.6z"/></svg>Apple</span>`
  return `<span class="avatar-popup-badge">✉ E-Mail</span>`
}

let popupOpen = false

function closePopup() {
  const existing = document.getElementById('avatar-popup')
  if (existing) existing.remove()
  popupOpen = false
}

function openPopup(user, session) {
  if (popupOpen) { closePopup(); return }
  popupOpen = true

  const popup = document.createElement('div')
  popup.id = 'avatar-popup'
  popup.className = 'avatar-popup'
  popup.innerHTML = `
    <div class="avatar-popup-header">
      <div class="avatar-popup-name">${escapeHtml(session.displayName)}</div>
      <div class="avatar-popup-email">${escapeHtml(session.email)}</div>
      ${providerBadge(user)}
    </div>
    <div class="avatar-popup-actions">
      <a href="#profile" class="avatar-popup-link" id="popup-profile">👤 Profil bearbeiten</a>
      <button class="avatar-popup-link danger" id="popup-logout">⎋ Abmelden</button>
    </div>`

  const wrap = document.getElementById('nav-avatar-slot')
  wrap.appendChild(popup)

  popup.querySelector('#popup-profile').addEventListener('click', closePopup)
  popup.querySelector('#popup-logout').addEventListener('click', async () => {
    closePopup()
    await logout()
    window.location.hash = 'login'
  })

  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      if (!popup.contains(e.target) && !document.getElementById('nav-avatar-btn')?.contains(e.target)) {
        closePopup()
        document.removeEventListener('click', handler)
      }
    })
  }, 0)
}

function openGuestPopup() {
  if (popupOpen) { closePopup(); return }
  popupOpen = true

  const popup = document.createElement('div')
  popup.id = 'avatar-popup'
  popup.className = 'avatar-popup'
  popup.innerHTML = `
    <div class="avatar-popup-header">
      <div class="avatar-popup-name">Gast</div>
      <div class="avatar-popup-email">Fortschritt wird nur lokal gespeichert</div>
      <span class="avatar-popup-badge">Gast</span>
    </div>
    <div class="avatar-popup-actions">
      <a href="#login" class="avatar-popup-link" id="popup-login">🔑 Anmelden</a>
      <a href="#login" class="avatar-popup-link" id="popup-register">✏️ Registrieren</a>
      <button class="avatar-popup-link danger" id="popup-guest-logout">⎋ Gast-Sitzung beenden</button>
    </div>`

  const wrap = document.getElementById('nav-avatar-slot')
  wrap.appendChild(popup)

  popup.querySelector('#popup-login').addEventListener('click', closePopup)
  popup.querySelector('#popup-register').addEventListener('click', closePopup)
  popup.querySelector('#popup-guest-logout').addEventListener('click', () => {
    closePopup()
    clearGuest()
    window.location.hash = 'login'
  })

  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      if (!popup.contains(e.target) && !document.getElementById('nav-avatar-btn')?.contains(e.target)) {
        closePopup()
        document.removeEventListener('click', handler)
      }
    })
  }, 0)
}

async function renderNav() {
  const user = getCurrentUser()
  closePopup()

  const session = user ? await getSession() : null
  applyTheme(session)
  document.querySelectorAll('.sap-nav-link').forEach(el => {
    el.style.display = session?.isSapUser ? '' : 'none'
  })
  const guest = !user && isGuest()

  const userInfo = document.getElementById('nav-user-info')
  if (userInfo) {
    if (session) {
      userInfo.textContent = session.displayName || session.email
    } else {
      userInfo.textContent = ''
    }
  }

  let avatarHtml = ''
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
  } else if (guest) {
    avatarHtml = `
      <button id="nav-avatar-btn" class="nav-avatar" style="background:#6b7280" title="Gast">G</button>`
  }
  const existingAvatar = document.getElementById('nav-avatar-slot')
  if (existingAvatar) existingAvatar.remove()
  const slot = document.createElement('div')
  slot.id = 'nav-avatar-slot'
  slot.className = 'avatar-popup-wrap'
  slot.innerHTML = avatarHtml
  themeToggle.parentNode.insertBefore(slot, themeToggle)

  const btn = document.getElementById('nav-avatar-btn')
  if (btn) {
    if (user && session) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        openPopup(user, session)
      })
    } else if (guest) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        openGuestPopup()
      })
    }
  }
}

async function route() {
  closeMobileNav()
  const hash = location.hash.slice(1) || 'dashboard'
  const user = getCurrentUser()

  document.querySelector('.topnav').style.display = hash === 'login' ? 'none' : ''

  if (PROTECTED.includes(hash) && !user && !isGuest()) {
    window.location.hash = 'login'
    return route()
  }
  if (hash === 'profile' && !user) {
    window.location.hash = 'login'
    return route()
  }
  if (hash === 'sap' && (!user || !(await getSession())?.isSapUser)) {
    window.location.hash = 'dashboard'
    return route()
  }
  if (hash === 'login' && (user || isGuest())) {
    window.location.hash = 'dashboard'
    return route()
  }

  nav.querySelectorAll('.pill-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.page === hash)
  })
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === hash)
  })

  await renderNav()

  const render = pages[hash]
  if (render) {
    app.innerHTML = ''
    await render(app)
  } else {
    app.innerHTML = `<div class="page-container"><p class="text-secondary">Seite nicht gefunden.</p></div>`
  }
}

window.addEventListener('hashchange', route)
window.addEventListener('auth-change', renderNav)

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
  await waitForAuthReady()

  // Handle pending account deletion after OAuth redirect
  const deleteResult = await finishDeleteAfterRedirect()
  if (deleteResult.ok) {
    window.location.hash = 'login'
    route()
    return
  }
  if (deleteResult.error) {
    alert('Account-Löschung fehlgeschlagen: ' + deleteResult.error)
  }

  await handleRedirectResult()
  await waitForAuthReady()
  onAuthChange(() => {
    renderNav()
    route()
  })
  route()
})

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark')
  themeToggle.textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙'
  localStorage.setItem('dhbw_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light')
})

if (localStorage.getItem('dhbw_theme') === 'dark') {
  document.documentElement.classList.add('dark')
  themeToggle.textContent = '☀️'
}

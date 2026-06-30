import { getSession, logout } from './auth.js'

const app = document.getElementById('app')
const nav = document.getElementById('main-nav')
const themeToggle = document.getElementById('theme-toggle')

const pages = {}

export function registerPage(name, renderFn) {
  pages[name] = renderFn
}

const PROTECTED = ['dashboard', 'klr', 'fibu', 'it', 'mathe', 'programmieren', 'profile']

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function renderNav() {
  const session = getSession()

  let avatarHtml = ''
  if (session) {
    avatarHtml = `
      <a href="#profile" class="nav-avatar" style="background:${session.avatarColor}" title="Profil: ${session.displayName}">
        ${initials(session.displayName)}
      </a>`
  }

  const existingAvatar = document.getElementById('nav-avatar-slot')
  if (existingAvatar) existingAvatar.remove()

  const slot = document.createElement('div')
  slot.id = 'nav-avatar-slot'
  slot.innerHTML = avatarHtml
  themeToggle.parentNode.insertBefore(slot, themeToggle)
}

async function route() {
  const hash = location.hash.slice(1) || 'dashboard'
  const session = getSession()

  if (PROTECTED.includes(hash) && !session) {
    window.location.hash = 'login'
    return
  }
  if (hash === 'login' && session) {
    window.location.hash = 'dashboard'
    return
  }

  nav.querySelectorAll('.pill-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.page === hash)
  })

  renderNav()

  const render = pages[hash]
  if (render) {
    app.innerHTML = ''
    await render(app)
  } else {
    app.innerHTML = `<div class="page-container"><p class="text-secondary">Seite nicht gefunden.</p></div>`
  }
}

window.addEventListener('hashchange', route)
window.addEventListener('auth-change', () => {
  renderNav()
  route()
})

Promise.all([
  import('./pages/login.js'),
  import('./pages/dashboard.js'),
  import('./pages/klr.js'),
  import('./pages/fibu.js'),
  import('./pages/it.js'),
  import('./pages/mathe.js'),
  import('./pages/programmieren.js'),
  import('./pages/profile.js'),
]).then(route)

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark')
  themeToggle.textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙'
  localStorage.setItem('dhbw_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light')
})

if (localStorage.getItem('dhbw_theme') === 'dark') {
  document.documentElement.classList.add('dark')
  themeToggle.textContent = '☀️'
}

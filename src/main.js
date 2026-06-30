const app = document.getElementById('app')
const nav = document.getElementById('main-nav')
const themeToggle = document.getElementById('theme-toggle')

const pages = {}

export function registerPage(name, renderFn) {
  pages[name] = renderFn
}

async function route() {
  const hash = location.hash.slice(1) || 'dashboard'
  nav.querySelectorAll('.pill-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.page === hash)
  })
  const render = pages[hash]
  if (render) {
    app.innerHTML = ''
    await render(app)
  } else {
    app.innerHTML = `<div class="page-container"><p class="text-secondary">Seite nicht gefunden.</p></div>`
  }
}

window.addEventListener('hashchange', route)

Promise.all([
  import('./pages/dashboard.js'),
  import('./pages/klr-fibu.js'),
  import('./pages/it.js'),
  import('./pages/mathe.js'),
  import('./pages/programmieren.js'),
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

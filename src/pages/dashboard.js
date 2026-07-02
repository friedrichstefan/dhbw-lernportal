import { registerPage } from '../main.js'
import { getProgress, setTodos } from '../progress.js'
import { isGuest } from '../guest.js'
import { escapeHtml } from '../escape.js'
import { getSession } from '../auth.js'

registerPage('dashboard', async (app) => {
  const [klrCards, klrQuiz, klrEx, fibuCards, fibuQuiz, fibuEx, itCards, itQuiz, matheCards, matheQuiz, matheEx, progCards, progQuiz] = await Promise.all([
    fetch(import.meta.env.BASE_URL + 'data/klr/flashcards.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/klr/quiz.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/klr/exercises.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/fibu/flashcards.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/fibu/quiz.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/fibu/exercises.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/it/flashcards.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/it/quiz.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/mathe/flashcards.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/mathe/quiz.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/mathe/exercises.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/programmieren/flashcards.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/programmieren/quiz.json').then(r => r.json())
  ])

  const { flashcards, quiz_scores, exercises, todos } = await getProgress()

  function pctKnown(cards) {
    if (!cards.length) return 0
    return Math.round(cards.filter(c => flashcards[c.id] === 'known').length / cards.length * 100)
  }
  function pctEx(exs) {
    if (!exs.length) return 0
    return Math.round(exs.filter(e => exercises[e.id] === 'correct').length / exs.length * 100)
  }
  function quizPct(key, max) {
    const s = quiz_scores[key]
    return s ? Math.round(s.last / max * 100) : 0
  }
  function avg(...vals) {
    const v = vals.filter(x => x !== null && x !== undefined)
    return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0
  }

  const subjects = [
    { name: 'KLR', href: '#klr', klasse: 'Kombi-Klausur 1', pct: avg(pctKnown([...klrCards]), quizPct('klr', klrQuiz.length), pctEx(klrEx)) },
    { name: 'Finanzbuchhaltung', href: '#fibu', klasse: 'Kombi-Klausur 1', pct: avg(pctKnown([...fibuCards]), quizPct('fibu', fibuQuiz.length), pctEx(fibuEx)) },
    { name: 'IT 1 & IT 2', href: '#it', klasse: 'Kombi-Klausur 2', pct: avg(pctKnown([...itCards]), quizPct('it', itQuiz.length)) },
    { name: 'Mathematik', href: '#mathe', klasse: 'Einzelklausur', pct: avg(pctKnown([...matheCards]), quizPct('mathe', matheQuiz.length), pctEx(matheEx)) },
    { name: 'Programmieren', href: '#programmieren', klasse: 'Einzelklausur', pct: avg(pctKnown([...progCards]), quizPct('programmieren', progQuiz.length)) }
  ]
  const overall = avg(...subjects.map(s => s.pct))

  app.innerHTML = `
    <div class="page-container">
      <h1 class="page-title">Dashboard</h1>
      ${isGuest() ? `<div class="guest-banner"><span>Du bist als Gast angemeldet. Dein Fortschritt wird nur lokal gespeichert.</span><button class="btn btn-primary btn-sm" id="guest-register-btn">Konto erstellen</button></div>` : ''}

      <div class="card" style="margin-bottom:var(--space-xl)">
        <div style="display:flex;align-items:center;gap:var(--space-xl);flex-wrap:wrap;">
          <div>
            <p class="text-secondary" style="margin-bottom:4px;">Gesamtfortschritt 2. Semester</p>
            <p class="dashboard-overall-pct">${overall}%</p>
          </div>
          <div style="flex:1;min-width:200px;">
            <div class="progress-bar" style="height:12px;">
              <div class="progress-bar-fill" style="width:${overall}%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-grid" style="margin-bottom:var(--space-xxl)">
        ${subjects.map(s => `
          <a href="${s.href}" style="text-decoration:none;">
            <div class="card" style="cursor:pointer;transition:box-shadow 0.15s;">
              <p class="text-secondary" style="margin-bottom:4px;">${s.klasse}</p>
              <h2 style="font-size:18px;font-weight:700;color:var(--color-ink-deep);margin-bottom:var(--space-lg);">${s.name}</h2>
              <div style="display:flex;align-items:center;gap:var(--space-md);">
                <div class="progress-bar" style="flex:1"><div class="progress-bar-fill" style="width:${s.pct}%"></div></div>
                <span style="font-size:14px;font-weight:700;color:var(--color-primary)">${s.pct}%</span>
              </div>
            </div>
          </a>`).join('')}
      </div>

      <h2 class="section-title">To-Do Liste</h2>
      <div id="todo-container"></div>
    </div>`

  mountTodos(document.getElementById('todo-container'), todos)

  const session = await getSession()
  if (session?.isSapUser) showSapWelcomeToast()

  const registerBtn = document.getElementById('guest-register-btn')
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      window.location.hash = ''
      window.location.hash = 'login'
    })
  }
})

function mountTodos(container, initialTodos) {
  let todos = [...initialTodos]

  function render() {
    container.innerHTML = `
      <div class="todo-list">
        ${todos.map((t, i) => `
          <div class="todo-item ${t.done ? 'done' : ''}" data-i="${i}">
            <input type="checkbox" ${t.done ? 'checked' : ''} data-idx="${i}" />
            <span style="flex:1">${escapeHtml(t.text)}</span>
            <button class="btn btn-sm" style="background:transparent;color:var(--color-critical);border:none;cursor:pointer;" data-del="${i}">✕</button>
          </div>`).join('')}
      </div>
      <div class="todo-add-row">
        <input class="todo-input" id="todo-input" type="text" placeholder="Neue Aufgabe hinzufügen..." maxlength="200" />
        <button class="btn btn-primary btn-sm" id="todo-add">Hinzufügen</button>
      </div>`

    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.onchange = () => {
        todos[parseInt(cb.dataset.idx)].done = cb.checked
        setTodos(todos)
        render()
      }
    })
    container.querySelectorAll('[data-del]').forEach(btn => {
      btn.onclick = () => {
        todos.splice(parseInt(btn.dataset.del), 1)
        setTodos(todos)
        render()
      }
    })

    const input = document.getElementById('todo-input')
    const addBtn = document.getElementById('todo-add')
    const add = () => {
      const text = input.value.trim()
      if (!text) return
      todos.push({ id: `t${Date.now()}`, text, done: false })
      setTodos(todos)
      render()
    }
    addBtn.onclick = add
    input.onkeydown = e => { if (e.key === 'Enter') add() }
  }

  render()
}

function showSapWelcomeToast() {
  if (localStorage.getItem('sap_welcomed') === '1') return
  localStorage.setItem('sap_welcomed', '1')
  const toast = document.createElement('div')
  toast.className = 'sap-toast'
  toast.textContent = '👋 Willkommen! Dein exklusiver SAP-Bereich ist jetzt verfügbar.'
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 4000)
}

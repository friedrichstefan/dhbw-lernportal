import { registerPage, setPageCleanup } from '../main.js'
import { mountFlashcards } from '../components/flashcard.js'
import { mountQuiz } from '../components/quiz.js'
import { mountCalculator } from '../components/calculator.js'
import { mountTextExercises } from '../components/exercises.js'
import { getProgress } from '../progress.js'
import { isGuest } from '../guest.js'
import { fetchJson } from '../data.js'

registerPage('fibu', async (app) => {
  const [cards, questions, exercises, textExercises, pdfs] = await Promise.all([
    fetchJson('data/fibu/flashcards.json'),
    fetchJson('data/fibu/quiz.json'),
    fetchJson('data/fibu/exercises.json'),
    fetchJson('data/fibu/text_exercises.json'),
    fetchJson('downloads/fibu/index.json'),
  ])

  async function calcPcts() {
    const { flashcards: fc, quiz_scores: qs, exercises: ex } = await getProgress()
    const totalCards = cards.length
    const cardPct = totalCards ? Math.round(cards.filter(c => fc[c.id] === 'known').length / totalCards * 100) : 0
    const totalQuiz = questions.length
    const quizPct = totalQuiz ? Math.round((qs['fibu']?.last ?? 0) / totalQuiz * 100) : 0
    const totalEx = exercises?.length ?? 0
    const exPct = totalEx ? Math.round(exercises.filter(e => ex[e.id] === 'correct').length / totalEx * 100) : 0
    const parts = [cardPct]
    if (totalQuiz) parts.push(quizPct)
    if (totalEx) parts.push(exPct)
    const overallPct = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
    return { overallPct, cardPct, quizPct, exPct, totalQuiz, totalEx }
  }

  async function renderProgressBars() {
    const el = app.querySelector('#fibu-progress-section')
    if (!el) return
    el.innerHTML = progressBarsHtml(await calcPcts())
  }

  const p = await calcPcts()

  app.innerHTML = `
    <div class="page-container">
      <h1 class="page-title">Finanzbuchhaltung</h1>
      <div class="card" style="margin-bottom:var(--space-xl)">
        <p class="text-secondary" style="margin-bottom:var(--space-sm)">Dein Lernfortschritt — Finanzbuchhaltung</p>
        <div id="fibu-progress-section">
          ${progressBarsHtml(p)}
        </div>
      </div>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Finanzbuchhaltung · Kombi-Klausur 1</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten</button>
        <button class="sub-tab" data-tab="quiz">Quiz</button>
        <button class="sub-tab" data-tab="rechnen">Rechenaufgaben</button>
        <button class="sub-tab" data-tab="aufgaben">Aufgaben</button>
      </div>
      <div id="tab-content"></div>
      <div class="downloads-section">
        <h2 class="downloads-title">Downloads</h2>
        <div class="downloads-grid">
          <div class="downloads-card" id="pdf-section">
            <h3 class="downloads-card-title">Skripte</h3>
            <div id="pdf-list"></div>
          </div>
          <div class="downloads-card">
            <h3 class="downloads-card-title">Lerndaten</h3>
            <div class="downloads-list">
              ${isGuest() ? `
              <span class="download-btn download-btn--locked" title="Anmeldung erforderlich">Karteikarten (JSON)</span>
              <span class="download-btn download-btn--locked" title="Anmeldung erforderlich">Quiz (JSON)</span>
              <span class="download-btn download-btn--locked" title="Anmeldung erforderlich">Rechenaufgaben (JSON)</span>
              ` : `
              <a class="download-btn" href="${import.meta.env.BASE_URL}data/fibu/flashcards.json" download="fibu-flashcards.json">Karteikarten (JSON)</a>
              <a class="download-btn" href="${import.meta.env.BASE_URL}data/fibu/quiz.json" download="fibu-quiz.json">Quiz (JSON)</a>
              <a class="download-btn" href="${import.meta.env.BASE_URL}data/fibu/exercises.json" download="fibu-exercises.json">Rechenaufgaben (JSON)</a>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>`

  setupTabs(app, { flashcards: cards, quiz: questions, rechnen: exercises, aufgaben: textExercises })
  renderPdfs(app.querySelector('#pdf-list'), app.querySelector('#pdf-section'), pdfs, import.meta.env.BASE_URL + 'downloads/fibu/')

  window.addEventListener('progress-updated', renderProgressBars)
  setPageCleanup(() => window.removeEventListener('progress-updated', renderProgressBars))
})

function progressBarsHtml({ overallPct, cardPct, quizPct, exPct, totalQuiz, totalEx }) {
  return `
    <div style="display:flex;align-items:center;gap:var(--space-xl);flex-wrap:wrap;margin-bottom:var(--space-md)">
      <div><span style="font-size:32px;font-weight:500;color:var(--color-primary)">${overallPct}%</span> <span class="text-secondary">gesamt</span></div>
      <div style="flex:1;min-width:160px"><div class="progress-bar" style="height:10px"><div class="progress-bar-fill" style="width:${overallPct}%"></div></div></div>
    </div>
    <div class="stat-row">
      <div style="display:flex;align-items:center;gap:var(--space-sm)">
        <span style="font-size:13px;color:var(--color-steel)">Karteikarten</span>
        <div class="progress-bar" style="width:80px"><div class="progress-bar-fill" style="width:${cardPct}%"></div></div>
        <span style="font-size:13px;font-weight:600;color:var(--color-primary)">${cardPct}%</span>
      </div>
      ${totalQuiz ? `<div style="display:flex;align-items:center;gap:var(--space-sm)">
        <span style="font-size:13px;color:var(--color-steel)">Quiz</span>
        <div class="progress-bar" style="width:80px"><div class="progress-bar-fill" style="width:${quizPct}%"></div></div>
        <span style="font-size:13px;font-weight:600;color:var(--color-primary)">${quizPct}%</span>
      </div>` : ''}
      ${totalEx ? `<div style="display:flex;align-items:center;gap:var(--space-sm)">
        <span style="font-size:13px;color:var(--color-steel)">Aufgaben</span>
        <div class="progress-bar" style="width:80px"><div class="progress-bar-fill" style="width:${exPct}%"></div></div>
        <span style="font-size:13px;font-weight:600;color:var(--color-primary)">${exPct}%</span>
      </div>` : ''}
    </div>`
}

function setupTabs(app, data) {
  const tabs = app.querySelectorAll('.sub-tab')
  const content = app.querySelector('#tab-content')

  function tabSkeleton(name) {
    if (name === 'flashcards') return `<div class="skeleton skeleton-fc"></div>`
    if (name === 'quiz') return Array(3).fill(`
      <div class="skeleton-card" style="margin-bottom:var(--space-md)">
        <div class="skeleton skeleton-text" style="width:80%;margin-bottom:var(--space-lg)"></div>
        <div class="skeleton skeleton-text" style="width:100%;margin-bottom:var(--space-sm)"></div>
        <div class="skeleton skeleton-text" style="width:100%;margin-bottom:var(--space-sm)"></div>
        <div class="skeleton skeleton-text" style="width:100%"></div>
      </div>`).join('')
    return Array(3).fill(`
      <div class="skeleton-card" style="margin-bottom:var(--space-md)">
        <div class="skeleton skeleton-text" style="width:55%;margin-bottom:var(--space-md)"></div>
        <div class="skeleton skeleton-text" style="width:90%;margin-bottom:var(--space-sm)"></div>
        <div class="skeleton skeleton-text" style="width:70%"></div>
      </div>`).join('')
  }

  function activate(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name))
    content.innerHTML = tabSkeleton(name)
    if (name === 'flashcards') mountFlashcards(content, data.flashcards)
    if (name === 'quiz') mountQuiz(content, data.quiz, 'fibu')
    if (name === 'rechnen') mountCalculator(content, data.rechnen)
    if (name === 'aufgaben') mountTextExercises(content, data.aufgaben)
  }

  tabs.forEach(t => { t.onclick = () => activate(t.dataset.tab) })
  activate('flashcards')
}

function renderPdfs(list, section, pdfs, baseUrl) {
  if (!pdfs || pdfs.length === 0) {
    section.style.display = 'none'
    return
  }
  if (isGuest()) {
    list.innerHTML = pdfs.map(p =>
      `<span class="download-btn download-btn--locked" title="Anmeldung erforderlich">${p.name}</span>`
    ).join('')
  } else {
    list.innerHTML = pdfs.map(p =>
      `<a class="download-btn" href="${baseUrl}${p.file}" download="${p.file}">${p.name}</a>`
    ).join('')
  }
}

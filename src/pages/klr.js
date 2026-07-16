import { registerPage, setPageCleanup } from '../main.js'
import { mountFlashcards } from '../components/flashcard.js'
import { mountQuiz } from '../components/quiz.js'
import { mountCalculator } from '../components/calculator.js'
import { mountTextExercises } from '../components/exercises.js'
import { getProgress } from '../progress.js'
import { isGuest } from '../guest.js'
import { fetchJson } from '../data.js'

registerPage('klr', async (app) => {
  const [cards, questions, exercises, textExercises, pdfs] = await Promise.all([
    fetchJson('data/klr/flashcards.json'),
    fetchJson('data/klr/quiz.json'),
    fetchJson('data/klr/exercises.json'),
    fetchJson('data/klr/text_exercises.json'),
    fetchJson('downloads/klr/index.json'),
  ])

  async function calcPcts() {
    const { flashcards: fc, quiz_scores: qs, exercises: ex } = await getProgress()
    const totalCards = cards.length
    const cardPct = totalCards ? Math.round(cards.filter(c => fc[c.id] === 'known').length / totalCards * 100) : 0
    const totalQuiz = questions.length
    const quizPct = totalQuiz ? Math.round((qs['klr']?.last ?? 0) / totalQuiz * 100) : 0
    const totalEx = exercises?.length ?? 0
    const exPct = totalEx ? Math.round(exercises.filter(e => ex[e.id] === 'correct').length / totalEx * 100) : 0
    const parts = [cardPct]
    if (totalQuiz) parts.push(quizPct)
    if (totalEx) parts.push(exPct)
    const overallPct = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
    return { overallPct, cardPct, quizPct, exPct, totalQuiz, totalEx }
  }

  async function renderProgressBars() {
    const el = app.querySelector('#klr-progress-section')
    if (!el) return
    const p = await calcPcts()
    el.innerHTML = progressBarsHtml(p)
  }

  const p = await calcPcts()

  app.innerHTML = `
    <div class="page-container">
      <h1 class="page-title">KLR</h1>
      <div class="card" style="margin-bottom:var(--space-xl)">
        <p class="text-secondary" style="margin-bottom:var(--space-sm)">Dein Lernfortschritt — KLR</p>
        <div id="klr-progress-section">
          ${progressBarsHtml(p)}
        </div>
      </div>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Kosten- und Leistungsrechnung · Kombi-Klausur 1</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten</button>
        <button class="sub-tab" data-tab="quiz">Quiz</button>
        <button class="sub-tab" data-tab="rechnen">Rechenaufgaben</button>
        <button class="sub-tab" data-tab="aufgaben">Aufgaben</button>
        <button class="sub-tab" data-tab="probeklausuren">Probeklausuren</button>
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
              <a class="download-btn" href="${import.meta.env.BASE_URL}data/klr/flashcards.json" download="klr-flashcards.json">Karteikarten (JSON)</a>
              <a class="download-btn" href="${import.meta.env.BASE_URL}data/klr/quiz.json" download="klr-quiz.json">Quiz (JSON)</a>
              <a class="download-btn" href="${import.meta.env.BASE_URL}data/klr/exercises.json" download="klr-exercises.json">Rechenaufgaben (JSON)</a>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>`

  setupTabs(app, { flashcards: cards, quiz: questions, rechnen: exercises, aufgaben: textExercises, baseUrl: import.meta.env.BASE_URL })
  renderPdfs(app.querySelector('#pdf-list'), app.querySelector('#pdf-section'), pdfs, import.meta.env.BASE_URL + 'downloads/klr/')

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
    if (name === 'probeklausuren') return `<div class="skeleton skeleton-text" style="width:60%;height:32px;margin-bottom:var(--space-md)"></div><div class="skeleton" style="width:100%;height:60vh;border-radius:var(--radius-md)"></div>`
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
    if (name === 'quiz') mountQuiz(content, data.quiz, 'klr')
    if (name === 'rechnen') mountCalculator(content, data.rechnen)
    if (name === 'aufgaben') mountTextExercises(content, data.aufgaben)
    if (name === 'probeklausuren') mountProbeklausuren(content, data.baseUrl)
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

function mountProbeklausuren(container, baseUrl) {
  const klausuren = [
    { label: 'Probeklausur 1', file: 'Probeklausur_KLR_1.html' },
    { label: 'Probeklausur 2', file: 'Probeklausur_KLR_2.html' },
    { label: 'Probeklausur 3', file: 'Probeklausur_KLR_3.html' },
  ]
  const downloadsBase = `${baseUrl}downloads/klr/`

  container.innerHTML = `
    <div style="margin-bottom:var(--space-md);display:flex;gap:var(--space-sm);flex-wrap:wrap;align-items:center">
      ${klausuren.map((k, i) =>
        `<button class="pk-select-btn${i === 0 ? ' active' : ''}" data-idx="${i}">${k.label}</button>`
      ).join('')}
      ${isGuest()
        ? `<span class="download-btn download-btn--locked" style="margin-left:auto" title="Anmeldung erforderlich">Herunterladen</span>`
        : `<a id="pk-download-link" class="download-btn" style="margin-left:auto"
             href="${downloadsBase}${klausuren[0].file}" download="${klausuren[0].file}">Herunterladen</a>`
      }
    </div>
    <iframe id="pk-frame"
      src="${downloadsBase}${klausuren[0].file}"
      style="width:100%;height:80vh;border:1px solid var(--color-border);border-radius:var(--radius-md);background:#fff"
      title="${klausuren[0].label}">
    </iframe>
    <style>
      .pk-select-btn {
        padding: 6px 14px; border-radius: var(--radius-pill); border: 1.5px solid var(--color-border);
        background: var(--color-surface); color: var(--color-text); cursor: pointer;
        font-size: 13px; font-weight: 500; transition: background .15s, border-color .15s;
      }
      .pk-select-btn.active, .pk-select-btn:hover {
        background: var(--color-primary); color: #fff; border-color: var(--color-primary);
      }
    </style>`

  const frame = container.querySelector('#pk-frame')
  const downloadLink = container.querySelector('#pk-download-link')
  container.querySelectorAll('.pk-select-btn').forEach(btn => {
    btn.onclick = () => {
      container.querySelectorAll('.pk-select-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      const k = klausuren[Number(btn.dataset.idx)]
      frame.src = downloadsBase + k.file
      frame.title = k.label
      if (downloadLink) {
        downloadLink.href = downloadsBase + k.file
        downloadLink.download = k.file
      }
    }
  })
}

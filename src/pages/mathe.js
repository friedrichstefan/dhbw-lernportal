import { registerPage, setPageCleanup } from '../main.js'
import { mountFlashcards } from '../components/flashcard.js'
import { mountQuiz } from '../components/quiz.js'
import { mountCalculator } from '../components/calculator.js'
import { mountTextExercises } from '../components/exercises.js'
import { getProgress } from '../progress.js'
import { fetchJson } from '../data.js'

registerPage('mathe', async (app) => {
  const [cards, questions, exercises, textExercises] = await Promise.all([
    fetchJson('data/mathe/flashcards.json'),
    fetchJson('data/mathe/quiz.json'),
    fetchJson('data/mathe/exercises.json'),
    fetchJson('data/mathe/text_exercises.json'),
  ])

  async function calcPcts() {
    const { flashcards: fc, quiz_scores: qs, exercises: ex } = await getProgress()
    const totalCards = cards.length
    const cardPct = totalCards ? Math.round(cards.filter(c => fc[c.id] === 'known').length / totalCards * 100) : 0
    const totalQuiz = questions.length
    const quizPct = totalQuiz ? Math.round((qs['mathe']?.last ?? 0) / totalQuiz * 100) : 0
    const totalEx = exercises?.length ?? 0
    const exPct = totalEx ? Math.round(exercises.filter(e => ex[e.id] === 'correct').length / totalEx * 100) : 0
    const parts = [cardPct]
    if (totalQuiz) parts.push(quizPct)
    if (totalEx) parts.push(exPct)
    const overallPct = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
    return { overallPct, cardPct, quizPct, exPct, totalQuiz, totalEx }
  }

  async function renderProgressBars() {
    const el = app.querySelector('#mathe-progress-section')
    if (!el) return
    el.innerHTML = progressBarsHtml(await calcPcts())
  }

  const p = await calcPcts()

  app.innerHTML = `
    <div class="page-container">
      <h1 class="page-title">Mathematik</h1>
      <div class="card" style="margin-bottom:var(--space-xl)">
        <p class="text-secondary" style="margin-bottom:var(--space-sm)">Dein Lernfortschritt — Mathematik</p>
        <div id="mathe-progress-section">
          ${progressBarsHtml(p)}
        </div>
      </div>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Einzelklausur · Logik, Algebra, Analysis, Kryptographie</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten</button>
        <button class="sub-tab" data-tab="quiz">Quiz</button>
        <button class="sub-tab" data-tab="rechnen">Rechenaufgaben</button>
        <button class="sub-tab" data-tab="aufgaben">Aufgaben</button>
      </div>
      <div id="tab-content"></div>
    </div>`

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
    if (name === 'flashcards') mountFlashcards(content, cards)
    if (name === 'quiz') mountQuiz(content, questions, 'mathe')
    if (name === 'rechnen') mountCalculator(content, exercises)
    if (name === 'aufgaben') mountTextExercises(content, textExercises)
  }
  tabs.forEach(t => { t.onclick = () => activate(t.dataset.tab) })
  activate('flashcards')

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

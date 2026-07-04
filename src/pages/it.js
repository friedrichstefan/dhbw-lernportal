import { registerPage, setPageCleanup } from '../main.js'
import { mountFlashcards } from '../components/flashcard.js'
import { mountQuiz } from '../components/quiz.js'
import { mountCalculator } from '../components/calculator.js'
import { mountTextExercises } from '../components/exercises.js'
import { getProgress } from '../progress.js'
import { fetchJson } from '../data.js'

const SUBJECTS = {
  it1: {
    label: 'Einführung IT 1',
    desc: 'Algorithmen, Komplexität, Datenstrukturen, XML, Zahlensysteme & Hardware',
    prefix: 'it1',
    textExercises: true
  },
  bs: {
    label: 'Betriebssysteme',
    desc: 'Prozesse, Scheduling, Speicher, Dateisysteme & mehr',
    prefix: 'bs',
    textExercises: false
  },
  ks: {
    label: 'Kommunikationssysteme',
    desc: 'OSI-Modell, TCP/IP, Subnetting, Protokolle & mehr',
    prefix: 'ks',
    textExercises: false
  }
}

registerPage('it', async (app) => {
  const [it1Cards, it1Questions, it1Exercises, bsCards, bsQuestions, bsExercises, bsTextExercises, ksCards, ksQuestions, ksExercises, ksTextExercises] = await Promise.all([
    fetchJson('data/it1/flashcards.json'),
    fetchJson('data/it1/quiz.json'),
    fetchJson('data/it1/exercises.json'),
    fetchJson('data/bs/flashcards.json'),
    fetchJson('data/bs/quiz.json'),
    fetchJson('data/bs/exercises.json'),
    fetchJson('data/bs/text_exercises.json'),
    fetchJson('data/ks/flashcards.json'),
    fetchJson('data/ks/quiz.json'),
    fetchJson('data/ks/exercises.json'),
    fetchJson('data/ks/text_exercises.json'),
  ])

  const { flashcards: fc, quiz_scores: qs } = await getProgress()
  const allCards = [...it1Cards, ...bsCards, ...ksCards]
  const allQuestions = [...it1Questions, ...bsQuestions, ...ksQuestions]

  async function calcPcts() {
    const { flashcards: fc2, quiz_scores: qs2 } = await getProgress()
    const totalCards = allCards.length
    const cardPct = totalCards ? Math.round(allCards.filter(c => fc2[c.id] === 'known').length / totalCards * 100) : 0
    const totalQuiz = allQuestions.length
    const quizScore = (qs2['it1']?.last ?? 0) + (qs2['bs']?.last ?? 0) + (qs2['ks']?.last ?? 0)
    const quizPct = totalQuiz ? Math.round(quizScore / totalQuiz * 100) : 0
    const parts = [cardPct]
    if (totalQuiz) parts.push(quizPct)
    const overallPct = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
    return { overallPct, cardPct, quizPct, totalQuiz }
  }

  async function renderProgressBars() {
    const el = app.querySelector('#it-progress-section')
    if (!el) return
    el.innerHTML = progressBarsHtml(await calcPcts())
  }

  const totalCards = allCards.length
  const knownCards = allCards.filter(c => fc[c.id] === 'known').length
  const cardPct = totalCards ? Math.round(knownCards / totalCards * 100) : 0
  const totalQuiz = allQuestions.length
  const it1Score = qs['it1'] ? qs['it1'].last : 0
  const bsScore = qs['bs'] ? qs['bs'].last : 0
  const ksScore = qs['ks'] ? qs['ks'].last : 0
  const quizScore = it1Score + bsScore + ksScore
  const quizPct = totalQuiz ? Math.round(quizScore / totalQuiz * 100) : 0
  const parts = [cardPct]
  if (totalQuiz) parts.push(quizPct)
  const overallPct = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
  const totalEx = 0

  app.innerHTML = `
    <div class="page-container">
      <h1 class="page-title">IT 1 &amp; IT 2</h1>
      <div class="card" style="margin-bottom:var(--space-xl)">
        <p class="text-secondary" style="margin-bottom:var(--space-sm)">Dein Lernfortschritt — IT 1 &amp; IT 2</p>
        <div id="it-progress-section">
          ${progressBarsHtml({ overallPct, cardPct, quizPct, totalQuiz })}
        </div>
      </div>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Einführung IT 1, Betriebssysteme &amp; Kommunikationssysteme</p>
      <div class="main-tabs" style="display:flex;gap:8px;margin-bottom:var(--space-xl)">
        <button class="main-tab-btn active" data-subject="it1" style="flex:1;padding:14px 8px;border-radius:var(--radius-md);border:2px solid var(--primary);background:var(--primary);color:#fff;font-weight:700;cursor:pointer;font-size:1rem;transition:all .2s">Einf. IT 1</button>
        <button class="main-tab-btn" data-subject="bs" style="flex:1;padding:14px 8px;border-radius:var(--radius-md);border:2px solid var(--border);background:var(--surface);color:var(--text);font-weight:600;cursor:pointer;font-size:1rem;transition:all .2s">Betriebssysteme</button>
        <button class="main-tab-btn" data-subject="ks" style="flex:1;padding:14px 8px;border-radius:var(--radius-md);border:2px solid var(--border);background:var(--surface);color:var(--text);font-weight:600;cursor:pointer;font-size:1rem;transition:all .2s">Komm.systeme</button>
      </div>
      <div id="subject-content"></div>
      <div class="downloads-section">
        <h2 class="downloads-title">Lesematerial</h2>
        <div class="downloads-grid">
          <div class="downloads-card">
            <h3 class="downloads-card-title">GdIT II – Lernbuch (KS &amp; BS)</h3>
            <div class="downloads-list">
              <a class="download-btn" href="${import.meta.env.BASE_URL}downloads/it/GdIT2-Lernbuch.html" target="_blank">GdIT II Lernbuch – 13 Kapitel (HTML)</a>
            </div>
            <p style="margin-top:8px;font-size:0.82rem;color:var(--color-steel)">Kommunikationssysteme (OSI, TCP/IP, Routing, DNS) &amp; Betriebssysteme (Prozesse, Scheduling, Speicher, Dateisysteme) — inkl. Prüfungshinweisen &amp; Übungsaufgaben</p>
          </div>
        </div>
      </div>
    </div>`

  const mainBtns = app.querySelectorAll('.main-tab-btn')
  const subjectContent = app.querySelector('#subject-content')

  const dataBySubject = {
    it1: { cards: it1Cards, questions: it1Questions, exercises: it1Exercises },
    bs: { cards: bsCards, questions: bsQuestions, exercises: bsExercises, textExercises: bsTextExercises },
    ks: { cards: ksCards, questions: ksQuestions, exercises: ksExercises, textExercises: ksTextExercises }
  }

  async function loadSubject(key) {
    return dataBySubject[key]
  }

  async function activateSubject(key) {
    mainBtns.forEach(b => {
      const active = b.dataset.subject === key
      b.classList.toggle('active', active)
      b.style.background = active ? 'var(--primary)' : 'var(--surface)'
      b.style.color = active ? '#fff' : 'var(--text)'
      b.style.borderColor = active ? 'var(--primary)' : 'var(--border)'
    })

    subjectContent.innerHTML = `
      <div class="skeleton-tabs">
        <div class="skeleton skeleton-tab"></div>
        <div class="skeleton skeleton-tab"></div>
        <div class="skeleton skeleton-tab"></div>
      </div>
      <div class="skeleton skeleton-fc"></div>`
    const { cards, questions, exercises, textExercises } = await loadSubject(key)
    const sub = SUBJECTS[key]

    subjectContent.innerHTML = `<p class="text-secondary" style="margin-bottom:var(--space-lg)">${sub.desc}</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten (${cards.length})</button>
        <button class="sub-tab" data-tab="quiz">Quiz (${questions.length})</button>
        <button class="sub-tab" data-tab="exercises">Übungen (${exercises.length})</button>
        ${textExercises && textExercises.length ? `<button class="sub-tab" data-tab="aufgaben">Aufgaben (${textExercises.length})</button>` : ''}
      </div>
      <div id="tab-content-${key}"></div>`

    const tabs = subjectContent.querySelectorAll('.sub-tab')
    const content = subjectContent.querySelector(`#tab-content-${key}`)

    function activateTab(name) {
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name))
      if (name === 'flashcards') {
        content.innerHTML = `<div class="skeleton skeleton-fc"></div>`
        mountFlashcards(content, cards)
      } else if (name === 'quiz') {
        content.innerHTML = Array(3).fill(`
          <div class="skeleton-card" style="margin-bottom:var(--space-md)">
            <div class="skeleton skeleton-text" style="width:80%;margin-bottom:var(--space-lg)"></div>
            <div class="skeleton skeleton-text" style="width:100%;margin-bottom:var(--space-sm)"></div>
            <div class="skeleton skeleton-text" style="width:100%"></div>
          </div>`).join('')
        mountQuiz(content, questions, key)
      } else {
        content.innerHTML = Array(3).fill(`
          <div class="skeleton-card" style="margin-bottom:var(--space-md)">
            <div class="skeleton skeleton-text" style="width:55%;margin-bottom:var(--space-md)"></div>
            <div class="skeleton skeleton-text" style="width:90%;margin-bottom:var(--space-sm)"></div>
            <div class="skeleton skeleton-text" style="width:70%"></div>
          </div>`).join('')
        if (name === 'exercises') {
          if (SUBJECTS[key].textExercises) mountTextExercises(content, exercises)
          else mountCalculator(content, exercises)
        }
        if (name === 'aufgaben') mountTextExercises(content, textExercises)
      }
    }

    tabs.forEach(t => { t.onclick = () => activateTab(t.dataset.tab) })
    activateTab('flashcards')
  }

  mainBtns.forEach(b => { b.onclick = () => activateSubject(b.dataset.subject) })
  await activateSubject('it1')

  window.addEventListener('progress-updated', renderProgressBars)
  setPageCleanup(() => window.removeEventListener('progress-updated', renderProgressBars))
})

function progressBarsHtml({ overallPct, cardPct, quizPct, totalQuiz }) {
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
    </div>`
}

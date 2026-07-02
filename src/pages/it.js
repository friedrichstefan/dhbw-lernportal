import { registerPage } from '../main.js'
import { mountFlashcards } from '../components/flashcard.js'
import { mountQuiz } from '../components/quiz.js'
import { mountCalculator } from '../components/calculator.js'
import { getProgress } from '../progress.js'

const SUBJECTS = {
  bs: {
    label: 'Betriebssysteme',
    desc: 'Prozesse, Scheduling, Speicher, Dateisysteme & mehr',
    prefix: 'bs'
  },
  ks: {
    label: 'Kommunikationssysteme',
    desc: 'OSI-Modell, TCP/IP, Subnetting, Protokolle & mehr',
    prefix: 'ks'
  }
}

registerPage('it', async (app) => {
  const [bsCards, bsQuestions, bsExercises, ksCards, ksQuestions, ksExercises] = await Promise.all([
    fetch(import.meta.env.BASE_URL + 'data/bs/flashcards.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/bs/quiz.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/bs/exercises.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/ks/flashcards.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/ks/quiz.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/ks/exercises.json').then(r => r.json())
  ])

  const { flashcards: fc, quiz_scores: qs } = await getProgress()
  const allCards = [...bsCards, ...ksCards]
  const allQuestions = [...bsQuestions, ...ksQuestions]
  const totalCards = allCards.length
  const knownCards = allCards.filter(c => fc[c.id] === 'known').length
  const cardPct = totalCards ? Math.round(knownCards / totalCards * 100) : 0
  const totalQuiz = allQuestions.length
  const bsScore = qs['bs'] ? qs['bs'].last : 0
  const ksScore = qs['ks'] ? qs['ks'].last : 0
  const quizScore = bsScore + ksScore
  const quizPct = totalQuiz ? Math.round(quizScore / totalQuiz * 100) : 0
  const parts = [cardPct]
  if (totalQuiz) parts.push(quizPct)
  const overallPct = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
  const totalEx = 0

  app.innerHTML = `
    <div class="page-container">
      <h1 class="page-title">IT 2</h1>
      <div class="card" style="margin-bottom:var(--space-xl)">
        <p class="text-secondary" style="margin-bottom:var(--space-sm)">Dein Lernfortschritt — IT 1 &amp; IT 2</p>
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
        </div>
      </div>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Betriebssysteme &amp; Kommunikationssysteme</p>
      <div class="main-tabs" style="display:flex;gap:8px;margin-bottom:var(--space-xl)">
        <button class="main-tab-btn active" data-subject="bs" style="flex:1;padding:14px 8px;border-radius:var(--radius-md);border:2px solid var(--primary);background:var(--primary);color:#fff;font-weight:700;cursor:pointer;font-size:1rem;transition:all .2s">Betriebssysteme</button>
        <button class="main-tab-btn" data-subject="ks" style="flex:1;padding:14px 8px;border-radius:var(--radius-md);border:2px solid var(--border);background:var(--surface);color:var(--text);font-weight:600;cursor:pointer;font-size:1rem;transition:all .2s">Kommunikationssysteme</button>
      </div>
      <div id="subject-content"></div>
    </div>`

  const mainBtns = app.querySelectorAll('.main-tab-btn')
  const subjectContent = app.querySelector('#subject-content')

  const dataCache = {
    bs: { cards: bsCards, questions: bsQuestions, exercises: bsExercises },
    ks: { cards: ksCards, questions: ksQuestions, exercises: ksExercises }
  }

  async function loadSubject(key) {
    if (!dataCache[key]) {
      const base = import.meta.env.BASE_URL + `data/${key}/`
      const [cards, questions, exercises] = await Promise.all([
        fetch(base + 'flashcards.json').then(r => r.json()),
        fetch(base + 'quiz.json').then(r => r.json()),
        fetch(base + 'exercises.json').then(r => r.json())
      ])
      dataCache[key] = { cards, questions, exercises }
    }
    return dataCache[key]
  }

  async function activateSubject(key) {
    mainBtns.forEach(b => {
      const active = b.dataset.subject === key
      b.classList.toggle('active', active)
      b.style.background = active ? 'var(--primary)' : 'var(--surface)'
      b.style.color = active ? '#fff' : 'var(--text)'
      b.style.borderColor = active ? 'var(--primary)' : 'var(--border)'
    })

    subjectContent.innerHTML = `<p class="text-secondary" style="text-align:center;padding:20px">Lade Inhalte…</p>`
    const { cards, questions, exercises } = await loadSubject(key)
    const sub = SUBJECTS[key]

    subjectContent.innerHTML = `
      <p class="text-secondary" style="margin-bottom:var(--space-lg)">${sub.desc}</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten (${cards.length})</button>
        <button class="sub-tab" data-tab="quiz">Quiz (${questions.length})</button>
        <button class="sub-tab" data-tab="exercises">Übungen (${exercises.length})</button>
      </div>
      <div id="tab-content-${key}"></div>`

    const tabs = subjectContent.querySelectorAll('.sub-tab')
    const content = subjectContent.querySelector(`#tab-content-${key}`)

    function activateTab(name) {
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name))
      content.innerHTML = ''
      if (name === 'flashcards') mountFlashcards(content, cards)
      if (name === 'quiz') mountQuiz(content, questions, key)
      if (name === 'exercises') mountCalculator(content, exercises)
    }

    tabs.forEach(t => { t.onclick = () => activateTab(t.dataset.tab) })
    activateTab('flashcards')
  }

  mainBtns.forEach(b => { b.onclick = () => activateSubject(b.dataset.subject) })
  await activateSubject('bs')
})

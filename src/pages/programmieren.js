import { registerPage } from '../main.js'
import { mountFlashcards } from '../components/flashcard.js'
import { mountQuiz } from '../components/quiz.js'
import { getProgress } from '../progress.js'

registerPage('programmieren', async (app) => {
  const [cards, questions] = await Promise.all([
    fetch(import.meta.env.BASE_URL + 'data/programmieren/flashcards.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/programmieren/quiz.json').then(r => r.json())
  ])

  const { flashcards: fc, quiz_scores: qs } = await getProgress()
  const totalCards = cards.length
  const knownCards = cards.filter(c => fc[c.id] === 'known').length
  const cardPct = totalCards ? Math.round(knownCards / totalCards * 100) : 0
  const totalQuiz = questions.length
  const quizScore = qs['programmieren'] ? qs['programmieren'].last : 0
  const quizPct = totalQuiz ? Math.round(quizScore / totalQuiz * 100) : 0
  const parts = [cardPct]
  if (totalQuiz) parts.push(quizPct)
  const overallPct = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
  const totalEx = 0

  const codeExamples = [
    { title: 'Fibonacci (rekursiv)', lang: 'python', code: `def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(10))  # 55` },
    { title: 'Bubblesort', lang: 'python', code: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr` },
    { title: 'Lineare Suche', lang: 'python', code: `def linear_search(arr, target):\n    for i, val in enumerate(arr):\n        if val == target:\n            return i\n    return -1` }
  ]

  app.innerHTML = `
    <div class="page-container">
      <h1 class="page-title">Programmieren</h1>
      <div class="card" style="margin-bottom:var(--space-xl)">
        <p class="text-secondary" style="margin-bottom:var(--space-sm)">Dein Lernfortschritt — Programmieren</p>
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
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Einzelklausur · Python &amp; Algorithmen</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten</button>
        <button class="sub-tab" data-tab="quiz">Quiz</button>
        <button class="sub-tab" data-tab="code">Code-Beispiele</button>
      </div>
      <div id="tab-content"></div>
    </div>`

  const tabs = app.querySelectorAll('.sub-tab')
  const content = app.querySelector('#tab-content')

  function renderCode() {
    content.innerHTML = codeExamples.map(ex => `
      <div class="card" style="margin-bottom:var(--space-lg)">
        <h3 style="font-size:18px;font-weight:700;margin-bottom:var(--space-lg)">${ex.title}</h3>
        <div class="code-block">
          <button class="copy-btn" data-code="${encodeURIComponent(ex.code)}">Kopieren</button>
          <pre><code>${ex.code.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>
        </div>
      </div>`).join('')
    content.querySelectorAll('.copy-btn').forEach(btn => {
      btn.onclick = () => {
        navigator.clipboard.writeText(decodeURIComponent(btn.dataset.code))
        btn.textContent = '✓ Kopiert!'
        setTimeout(() => btn.textContent = 'Kopieren', 2000)
      }
    })
  }

  function activate(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name))
    content.innerHTML = ''
    if (name === 'flashcards') mountFlashcards(content, cards)
    if (name === 'quiz') mountQuiz(content, questions, 'programmieren')
    if (name === 'code') renderCode()
  }
  tabs.forEach(t => { t.onclick = () => activate(t.dataset.tab) })
  activate('flashcards')
})

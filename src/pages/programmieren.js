import { registerPage } from '../main.js'
import { mountFlashcards } from '../components/flashcard.js'
import { mountQuiz } from '../components/quiz.js'

registerPage('programmieren', async (app) => {
  const [cards, questions] = await Promise.all([
    fetch('./data/programmieren/flashcards.json').then(r => r.json()),
    fetch('./data/programmieren/quiz.json').then(r => r.json())
  ])

  const codeExamples = [
    { title: 'Fibonacci (rekursiv)', lang: 'python', code: `def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(10))  # 55` },
    { title: 'Bubblesort', lang: 'python', code: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr` },
    { title: 'Lineare Suche', lang: 'python', code: `def linear_search(arr, target):\n    for i, val in enumerate(arr):\n        if val == target:\n            return i\n    return -1` }
  ]

  app.innerHTML = `
    <div class="page-container">
      <h1 class="page-title">Programmieren</h1>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Einzelklausur · Python & Algorithmen</p>
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

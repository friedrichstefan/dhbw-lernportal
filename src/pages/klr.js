import { registerPage } from '../main.js'
import { mountFlashcards } from '../components/flashcard.js'
import { mountQuiz } from '../components/quiz.js'
import { mountCalculator } from '../components/calculator.js'

registerPage('klr', async (app) => {
  const [cards, questions, exercises, pdfs] = await Promise.all([
    fetch(import.meta.env.BASE_URL + 'data/klr/flashcards.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/klr/quiz.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/klr/exercises.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'downloads/klr/index.json').then(r => r.json()).catch(() => [])
  ])

  app.innerHTML = `
    <div class="page-container">
      <h1 class="page-title">KLR</h1>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Kosten- und Leistungsrechnung · Kombi-Klausur 1</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten</button>
        <button class="sub-tab" data-tab="quiz">Quiz</button>
        <button class="sub-tab" data-tab="rechnen">Rechenaufgaben</button>
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
              <a class="download-btn" href="${import.meta.env.BASE_URL}data/klr/flashcards.json" download="klr-flashcards.json">Karteikarten (JSON)</a>
              <a class="download-btn" href="${import.meta.env.BASE_URL}data/klr/quiz.json" download="klr-quiz.json">Quiz (JSON)</a>
              <a class="download-btn" href="${import.meta.env.BASE_URL}data/klr/exercises.json" download="klr-exercises.json">Rechenaufgaben (JSON)</a>
            </div>
          </div>
        </div>
      </div>
    </div>`

  setupTabs(app, { flashcards: cards, quiz: questions, rechnen: exercises })
  renderPdfs(app.querySelector('#pdf-list'), app.querySelector('#pdf-section'), pdfs, import.meta.env.BASE_URL + 'downloads/klr/')
})

function setupTabs(app, data) {
  const tabs = app.querySelectorAll('.sub-tab')
  const content = app.querySelector('#tab-content')

  function activate(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name))
    content.innerHTML = ''
    if (name === 'flashcards') mountFlashcards(content, data.flashcards)
    if (name === 'quiz') mountQuiz(content, data.quiz, 'klr')
    if (name === 'rechnen') mountCalculator(content, data.rechnen)
  }

  tabs.forEach(t => { t.onclick = () => activate(t.dataset.tab) })
  activate('flashcards')
}

function renderPdfs(list, section, pdfs, baseUrl) {
  if (!pdfs || pdfs.length === 0) {
    section.style.display = 'none'
    return
  }
  list.innerHTML = pdfs.map(p =>
    `<a class="download-btn" href="${baseUrl}${p.file}" download="${p.file}">${p.name}</a>`
  ).join('')
}

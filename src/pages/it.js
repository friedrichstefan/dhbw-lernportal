import { registerPage } from '../main.js'
import { mountFlashcards } from '../components/flashcard.js'
import { mountQuiz } from '../components/quiz.js'

registerPage('it', async (app) => {
  const [cards, questions] = await Promise.all([
    fetch('./data/it/flashcards.json').then(r => r.json()),
    fetch('./data/it/quiz.json').then(r => r.json())
  ])

  app.innerHTML = `
    <div class="page-container">
      <h1 class="page-title">IT 1 & IT 2</h1>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Kombi-Klausur 2 · Betriebssysteme & Kommunikationssysteme</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten</button>
        <button class="sub-tab" data-tab="quiz">Quiz</button>
      </div>
      <div id="tab-content"></div>
    </div>`

  const tabs = app.querySelectorAll('.sub-tab')
  const content = app.querySelector('#tab-content')
  function activate(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name))
    content.innerHTML = ''
    if (name === 'flashcards') mountFlashcards(content, cards)
    if (name === 'quiz') mountQuiz(content, questions, 'it')
  }
  tabs.forEach(t => { t.onclick = () => activate(t.dataset.tab) })
  activate('flashcards')
})

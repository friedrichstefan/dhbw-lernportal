import { registerPage } from '../main.js'
import { mountFlashcards } from '../components/flashcard.js'
import { mountQuiz } from '../components/quiz.js'
import { mountCalculator } from '../components/calculator.js'

registerPage('mathe', async (app) => {
  const [cards, questions, exercises] = await Promise.all([
    fetch(import.meta.env.BASE_URL + 'data/mathe/flashcards.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/mathe/quiz.json').then(r => r.json()),
    fetch(import.meta.env.BASE_URL + 'data/mathe/exercises.json').then(r => r.json())
  ])

  app.innerHTML = `
    <div class="page-container">
      <h1 class="page-title">Mathematik</h1>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Einzelklausur · Logik, Algebra, Analysis, Kryptographie</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten</button>
        <button class="sub-tab" data-tab="quiz">Quiz</button>
        <button class="sub-tab" data-tab="rechnen">Rechenaufgaben</button>
      </div>
      <div id="tab-content"></div>
    </div>`

  const tabs = app.querySelectorAll('.sub-tab')
  const content = app.querySelector('#tab-content')
  function activate(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name))
    content.innerHTML = ''
    if (name === 'flashcards') mountFlashcards(content, cards)
    if (name === 'quiz') mountQuiz(content, questions, 'mathe')
    if (name === 'rechnen') mountCalculator(content, exercises)
  }
  tabs.forEach(t => { t.onclick = () => activate(t.dataset.tab) })
  activate('flashcards')
})

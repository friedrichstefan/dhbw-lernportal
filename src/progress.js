const KEY = 'dhbw_lernportal_v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getProgress() {
  const d = load()
  return {
    flashcards: d.flashcards || {},
    quiz_scores: d.quiz_scores || {},
    exercises: d.exercises || {},
    todos: d.todos || []
  }
}

export function setFlashcard(id, status) {
  const d = load()
  if (!d.flashcards) d.flashcards = {}
  d.flashcards[id] = status
  save(d)
}

export function setQuizScore(subject, last, max) {
  const d = load()
  if (!d.quiz_scores) d.quiz_scores = {}
  d.quiz_scores[subject] = { last, max, date: new Date().toISOString().slice(0, 10) }
  save(d)
}

export function setExercise(id, status) {
  const d = load()
  if (!d.exercises) d.exercises = {}
  d.exercises[id] = status
  save(d)
}

export function setTodos(todos) {
  const d = load()
  d.todos = todos
  save(d)
}

export function calcFlashcardProgress(cards, subject) {
  const { flashcards } = getProgress()
  const ids = cards.filter(c => c.id.startsWith(subject)).map(c => c.id)
  if (!ids.length) return 0
  const known = ids.filter(id => flashcards[id] === 'known').length
  return Math.round((known / ids.length) * 100)
}

export function calcExerciseProgress(exercises, subject) {
  const { exercises: ex } = getProgress()
  const ids = exercises.filter(e => e.id.startsWith(subject)).map(e => e.id)
  if (!ids.length) return 0
  const correct = ids.filter(id => ex[id] === 'correct').length
  return Math.round((correct / ids.length) * 100)
}

export function calcSubjectProgress(subject, flashcards, quizScore, totalQuiz, exercises) {
  const parts = []
  if (flashcards !== undefined) parts.push(flashcards)
  if (quizScore !== undefined && totalQuiz > 0) parts.push(Math.round((quizScore / totalQuiz) * 100))
  if (exercises !== undefined) parts.push(exercises)
  if (!parts.length) return 0
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
}

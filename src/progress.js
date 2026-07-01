import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase.js'
import { getCurrentUser } from './auth.js'

function progressRef(fachId) {
  const user = getCurrentUser()
  if (!user) throw new Error('Nicht angemeldet')
  return doc(db, 'users', user.uid, 'progress', fachId)
}

async function loadFach(fachId) {
  try {
    const snap = await getDoc(progressRef(fachId))
    return snap.exists() ? snap.data() : {}
  } catch {
    return {}
  }
}

async function saveFach(fachId, data) {
  try {
    await setDoc(progressRef(fachId), { ...data, lastSeen: serverTimestamp() }, { merge: true })
  } catch (e) {
    console.error('Progress save failed:', e)
  }
}

export async function getProgress() {
  const user = getCurrentUser()
  if (!user) return { flashcards: {}, quiz_scores: {}, exercises: {}, todos: [] }
  try {
    const [fc, qs, ex, td] = await Promise.all([
      loadFach('flashcards'),
      loadFach('quiz_scores'),
      loadFach('exercises'),
      loadFach('todos')
    ])
    return {
      flashcards: fc.data || {},
      quiz_scores: qs.data || {},
      exercises: ex.data || {},
      todos: td.list || []
    }
  } catch {
    return { flashcards: {}, quiz_scores: {}, exercises: {}, todos: [] }
  }
}

export async function setFlashcard(id, status) {
  const current = await loadFach('flashcards')
  const data = current.data || {}
  data[id] = status
  await saveFach('flashcards', { data })
}

export async function setQuizScore(subject, last, max) {
  const current = await loadFach('quiz_scores')
  const data = current.data || {}
  data[subject] = { last, max, date: new Date().toISOString().slice(0, 10) }
  await saveFach('quiz_scores', { data })
}

export async function setExercise(id, status) {
  const current = await loadFach('exercises')
  const data = current.data || {}
  data[id] = status
  await saveFach('exercises', { data })
}

export async function setTodos(todos) {
  await saveFach('todos', { list: todos })
}

export async function calcFlashcardProgress(cards, subject) {
  const { flashcards } = await getProgress()
  const ids = cards.filter(c => c.id.startsWith(subject)).map(c => c.id)
  if (!ids.length) return 0
  const known = ids.filter(id => flashcards[id] === 'known').length
  return Math.round((known / ids.length) * 100)
}

export async function calcExerciseProgress(exercises, subject) {
  const { exercises: ex } = await getProgress()
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

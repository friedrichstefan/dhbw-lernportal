import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase.js'
import { getCurrentUser } from './auth.js'

function progressDocRef() {
  const user = getCurrentUser()
  if (!user) throw new Error('Nicht angemeldet')
  return doc(db, 'users', user.uid, 'progress', 'data')
}

async function loadAll() {
  try {
    const snap = await getDoc(progressDocRef())
    return snap.exists() ? snap.data() : {}
  } catch {
    return {}
  }
}

async function saveAll(data) {
  try {
    await setDoc(progressDocRef(), { ...data, lastSeen: serverTimestamp() }, { merge: true })
  } catch (e) {
    console.error('Progress save failed:', e)
  }
}

export async function getProgress() {
  const user = getCurrentUser()
  if (!user) return { flashcards: {}, quiz_scores: {}, exercises: {}, todos: [] }
  const d = await loadAll()
  return {
    flashcards: d.flashcards || {},
    quiz_scores: d.quiz_scores || {},
    exercises: d.exercises || {},
    todos: d.todos || []
  }
}

export async function setFlashcard(id, status) {
  const d = await loadAll()
  const flashcards = d.flashcards || {}
  flashcards[id] = status
  await saveAll({ ...d, flashcards })
}

export async function setQuizScore(subject, last, max) {
  const d = await loadAll()
  const quiz_scores = d.quiz_scores || {}
  quiz_scores[subject] = { last, max, date: new Date().toISOString().slice(0, 10) }
  await saveAll({ ...d, quiz_scores })
}

export async function setExercise(id, status) {
  const d = await loadAll()
  const exercises = d.exercises || {}
  exercises[id] = status
  await saveAll({ ...d, exercises })
}

export async function setTodos(todos) {
  const d = await loadAll()
  await saveAll({ ...d, todos })
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

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
  updateProfile as fbUpdateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase.js'

const AVATAR_COLORS = ['#0064e0', '#31a24c', '#e41e3f', '#f7b928', '#a121ce', '#1876f2', '#f0284a', '#00a884']

async function ensureUserDoc(firebaseUser, extra = {}) {
  const ref = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const colorIndex = Math.floor(Math.random() * AVATAR_COLORS.length)
    await setDoc(ref, {
      displayName: firebaseUser.displayName || extra.displayName || 'Nutzer',
      avatarColor: AVATAR_COLORS[colorIndex],
      createdAt: serverTimestamp(),
      provider: extra.provider || 'email'
    })
  }
  return (await getDoc(ref)).data()
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

export function getCurrentUser() {
  return auth.currentUser
}

export async function getSession() {
  const user = auth.currentUser
  if (!user) return null
  const snap = await getDoc(doc(db, 'users', user.uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return { uid: user.uid, email: user.email, displayName: data.displayName, avatarColor: data.avatarColor }
}

export async function login(email, password) {
  try {
    await setPersistence(auth, browserLocalPersistence)
    await signInWithEmailAndPassword(auth, email, password)
    return { ok: true }
  } catch (e) {
    if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
      return { error: 'E-Mail oder Passwort falsch.' }
    }
    return { error: 'Anmeldung fehlgeschlagen: ' + e.message }
  }
}

export async function register(email, password, displayName) {
  if (!email || !email.includes('@')) return { error: 'Gültige E-Mail-Adresse eingeben.' }
  if (!password || password.length < 6) return { error: 'Passwort muss mindestens 6 Zeichen haben.' }
  if (!displayName || !displayName.trim()) return { error: 'Anzeigename darf nicht leer sein.' }
  try {
    await setPersistence(auth, browserLocalPersistence)
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await fbUpdateProfile(cred.user, { displayName: displayName.trim() })
    await ensureUserDoc(cred.user, { displayName: displayName.trim(), provider: 'email' })
    return { ok: true }
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') return { error: 'E-Mail bereits registriert.' }
    return { error: 'Registrierung fehlgeschlagen: ' + e.message }
  }
}

export async function loginWithGoogle() {
  try {
    await setPersistence(auth, browserLocalPersistence)
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    await ensureUserDoc(cred.user, { provider: 'google' })
    return { ok: true }
  } catch (e) {
    if (e.code === 'auth/popup-closed-by-user') return { error: null }
    return { error: 'Google-Anmeldung fehlgeschlagen: ' + e.message }
  }
}

export async function loginWithApple() {
  try {
    await setPersistence(auth, browserLocalPersistence)
    const provider = new OAuthProvider('apple.com')
    provider.addScope('email')
    provider.addScope('name')
    const cred = await signInWithPopup(auth, provider)
    await ensureUserDoc(cred.user, { provider: 'apple' })
    return { ok: true }
  } catch (e) {
    if (e.code === 'auth/popup-closed-by-user') return { error: null }
    return { error: 'Apple-Anmeldung fehlgeschlagen: ' + e.message }
  }
}

export function logout() {
  return signOut(auth)
}

export async function changePassword(oldPassword, newPassword) {
  if (!newPassword || newPassword.length < 6) return { error: 'Neues Passwort muss mindestens 6 Zeichen haben.' }
  const user = auth.currentUser
  if (!user || !user.email) return { error: 'Nicht angemeldet.' }
  try {
    const cred = EmailAuthProvider.credential(user.email, oldPassword)
    await reauthenticateWithCredential(user, cred)
    await updatePassword(user, newPassword)
    return { ok: true }
  } catch (e) {
    if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') return { error: 'Aktuelles Passwort falsch.' }
    return { error: 'Fehler: ' + e.message }
  }
}

export async function updateProfile(displayName, avatarColor) {
  const user = auth.currentUser
  if (!user) return { error: 'Nicht angemeldet.' }
  if (!displayName || !displayName.trim()) return { error: 'Anzeigename darf nicht leer sein.' }
  try {
    await fbUpdateProfile(user, { displayName: displayName.trim() })
    await updateDoc(doc(db, 'users', user.uid), { displayName: displayName.trim(), avatarColor })
    return { ok: true }
  } catch (e) {
    return { error: 'Profil konnte nicht gespeichert werden: ' + e.message }
  }
}

export async function deleteAccount() {
  const user = auth.currentUser
  if (!user) return { error: 'Nicht angemeldet.' }
  try {
    await deleteDoc(doc(db, 'users', user.uid))
    await deleteUser(user)
    return { ok: true }
  } catch (e) {
    if (e.code === 'auth/requires-recent-login') return { error: 'Bitte melde dich neu an und versuche es nochmal.' }
    return { error: 'Account konnte nicht gelöscht werden: ' + e.message }
  }
}

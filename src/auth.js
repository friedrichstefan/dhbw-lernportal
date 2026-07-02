import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  OAuthProvider,
  signOut,
  updateProfile as fbUpdateProfile,
  updatePassword,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  deleteUser,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase.js'

const AVATAR_COLORS = ['#0064e0', '#31a24c', '#e41e3f', '#f7b928', '#a121ce', '#1876f2', '#f0784a', '#00a884']

async function ensureUserDoc(firebaseUser, extra = {}) {
  const ref = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const colorIndex = Math.floor(Math.random() * AVATAR_COLORS.length)
    const isSap = (firebaseUser.email || '').endsWith('@sap.com')
    await setDoc(ref, {
      displayName: firebaseUser.displayName || extra.displayName || 'Nutzer',
      avatarColor: AVATAR_COLORS[colorIndex],
      createdAt: serverTimestamp(),
      provider: extra.provider || 'email',
      isSapUser: isSap,
      theme: isSap ? 'sap' : 'default',
      sapIntensity: isSap ? 'full' : 'badge',
    })
  } else if (snap.data().isSapUser === undefined) {
    const isSap = (firebaseUser.email || '').endsWith('@sap.com')
    await updateDoc(ref, {
      isSapUser: isSap,
      theme: isSap ? 'sap' : 'default',
      sapIntensity: isSap ? 'full' : 'badge',
    })
  }
  return (await getDoc(ref)).data()
}

export function waitForAuthReady() {
  return new Promise(resolve => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub()
      resolve(user)
    })
  })
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
  return {
    uid: user.uid,
    email: user.email,
    displayName: data.displayName,
    avatarColor: data.avatarColor,
    isSapUser: data.isSapUser ?? false,
    theme: data.theme ?? 'default',
    sapIntensity: data.sapIntensity ?? 'badge',
  }
}

export async function login(email, password) {
  try {
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
  return { error: 'Google Login nicht verfügbar.' }
}

export async function loginWithApple() {
  const provider = new OAuthProvider('apple.com')
  provider.addScope('email')
  provider.addScope('name')
  try {
    const cred = await signInWithPopup(auth, provider)
    await ensureUserDoc(cred.user, { provider: 'apple' })
    return { ok: true }
  } catch (e) {
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return { ok: false }
    return { error: 'Apple-Anmeldung fehlgeschlagen: ' + e.message }
  }
}

export async function loginWithMicrosoft() {
  const provider = new OAuthProvider('microsoft.com')
  provider.addScope('email')
  provider.addScope('profile')
  try {
    const cred = await signInWithPopup(auth, provider)
    await ensureUserDoc(cred.user, { provider: 'microsoft' })
    return { ok: true }
  } catch (e) {
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return { ok: false }
    return { error: 'Microsoft-Anmeldung fehlgeschlagen: ' + e.message }
  }
}

export async function handleRedirectResult() {
  return { ok: false }
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

export async function deleteAccount(password = null) {
  const user = auth.currentUser
  if (!user) return { error: 'Nicht angemeldet.' }

  const providerId = user.providerData?.[0]?.providerId ?? 'password'

  try {
    if (providerId === 'password') {
      if (!password) return { needsPassword: true }
      const cred = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, cred)
    } else {
      const provider =
        providerId === 'apple.com' ? new OAuthProvider('apple.com') :
        providerId === 'microsoft.com' ? new OAuthProvider('microsoft.com') :
        new OAuthProvider('google.com')
      await reauthenticateWithPopup(user, provider)
    }

    await deleteDoc(doc(db, 'users', user.uid))
    await deleteUser(user)
    return { ok: true }
  } catch (e) {
    if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') return { error: 'Passwort falsch.' }
    if (e.code === 'auth/requires-recent-login') return { needsPassword: providerId === 'password' }
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return { ok: false }
    return { error: 'Account konnte nicht gelöscht werden: ' + e.message }
  }
}

export async function finishDeleteAfterRedirect() {
  return { ok: false }
}

const VALID_THEMES = ['default', 'sap', 'minimalist']
const VALID_INTENSITIES = ['badge', 'subtle', 'full']

export async function updateTheme(theme, sapIntensity) {
  if (!VALID_THEMES.includes(theme)) return { error: 'Ungültiges Theme.' }
  if (!VALID_INTENSITIES.includes(sapIntensity)) return { error: 'Ungültige Intensität.' }
  const user = auth.currentUser
  if (!user) return { error: 'Nicht angemeldet.' }
  if (theme === 'sap') {
    const snap = await getDoc(doc(db, 'users', user.uid))
    if (!snap.exists() || !snap.data().isSapUser) return { error: 'Theme nicht verfügbar.' }
  }
  try {
    await updateDoc(doc(db, 'users', user.uid), { theme, sapIntensity })
    return { ok: true }
  } catch (e) {
    return { error: 'Theme konnte nicht gespeichert werden: ' + e.message }
  }
}

const USERS_KEY = 'dhbw_users_v1'
const SESSION_KEY = 'dhbw_session_v1'

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'dhbw_lernportal_salt_2025')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {} } catch { return {} }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null } catch { return null }
}

function setSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, displayName: user.displayName, avatarColor: user.avatarColor }))
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}

export async function register(username, password, displayName) {
  const trimmed = username.trim().toLowerCase()
  if (!trimmed || trimmed.length < 3) return { error: 'Benutzername muss mindestens 3 Zeichen haben.' }
  if (!/^[a-z0-9_]+$/.test(trimmed)) return { error: 'Benutzername darf nur Buchstaben, Zahlen und _ enthalten.' }
  if (!password || password.length < 6) return { error: 'Passwort muss mindestens 6 Zeichen haben.' }
  if (!displayName || !displayName.trim()) return { error: 'Anzeigename darf nicht leer sein.' }

  const users = loadUsers()
  if (users[trimmed]) return { error: 'Benutzername bereits vergeben.' }

  const hash = await hashPassword(password)
  const colors = ['#0064e0', '#31a24c', '#e41e3f', '#f7b928', '#a121ce', '#1876f2', '#f0284a', '#00a884']
  const avatarColor = colors[Object.keys(users).length % colors.length]

  users[trimmed] = { username: trimmed, displayName: displayName.trim(), passwordHash: hash, avatarColor, createdAt: new Date().toISOString() }
  saveUsers(users)
  setSession(users[trimmed])
  return { ok: true }
}

export async function login(username, password) {
  const trimmed = username.trim().toLowerCase()
  if (!trimmed || !password) return { error: 'Benutzername und Passwort erforderlich.' }

  const users = loadUsers()
  const user = users[trimmed]
  if (!user) return { error: 'Benutzername nicht gefunden.' }

  const hash = await hashPassword(password)
  if (hash !== user.passwordHash) return { error: 'Falsches Passwort.' }

  setSession(user)
  return { ok: true }
}

export async function changePassword(username, oldPassword, newPassword) {
  if (!newPassword || newPassword.length < 6) return { error: 'Neues Passwort muss mindestens 6 Zeichen haben.' }

  const users = loadUsers()
  const user = users[username]
  if (!user) return { error: 'Nutzer nicht gefunden.' }

  const oldHash = await hashPassword(oldPassword)
  if (oldHash !== user.passwordHash) return { error: 'Aktuelles Passwort falsch.' }

  user.passwordHash = await hashPassword(newPassword)
  saveUsers(users)
  return { ok: true }
}

export function updateProfile(username, displayName, avatarColor) {
  const users = loadUsers()
  const user = users[username]
  if (!user) return { error: 'Nutzer nicht gefunden.' }
  if (!displayName || !displayName.trim()) return { error: 'Anzeigename darf nicht leer sein.' }

  user.displayName = displayName.trim()
  user.avatarColor = avatarColor
  saveUsers(users)
  setSession(user)
  return { ok: true }
}

export function deleteAccount(username) {
  const users = loadUsers()
  delete users[username]
  saveUsers(users)
  logout()
}

const KEY = 'dhbw_guest'

export function activateGuest() {
  localStorage.setItem(KEY, '1')
}

export function isGuest() {
  return localStorage.getItem(KEY) === '1'
}

export function clearGuest() {
  localStorage.removeItem(KEY)
}

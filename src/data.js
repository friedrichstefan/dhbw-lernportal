const cache = new Map()

export function fetchJson(path) {
  if (!cache.has(path)) {
    cache.set(path, fetch(import.meta.env.BASE_URL + path).then(r => r.json()).catch(() => []))
  }
  return cache.get(path)
}

import { setFlashcard, getProgress } from '../progress.js'

export function mountFlashcards(container, cards) {
  const { flashcards: saved } = getProgress()

  let queue = [...cards.filter(c => saved[c.id] !== 'known')]
  if (!queue.length) queue = [...cards]
  let current = 0
  let flipped = false

  function render() {
    if (!queue.length) {
      container.innerHTML = `
        <div class="page-container" style="text-align:center;padding-top:40px;">
          <p class="page-title">🎉 Alle Karten gemeistert!</p>
          <button class="btn btn-secondary" id="fc-reset">Nochmal von vorne</button>
        </div>`
      container.querySelector('#fc-reset').onclick = () => {
        queue = [...cards]
        current = 0
        flipped = false
        render()
      }
      return
    }

    const card = queue[current]
    const known = Object.values(getProgress().flashcards).filter(v => v === 'known').length
    const total = cards.length
    const pct = Math.round((known / total) * 100)

    container.innerHTML = `
      <div style="max-width:640px;margin:0 auto;">
        <div class="flashcard-progress">
          <span class="flashcard-counter">${known} / ${total} Karten gemeistert</span>
          <div class="progress-bar" style="flex:1">
            <div class="progress-bar-fill" style="width:${pct}%"></div>
          </div>
          <span class="text-secondary">${pct}%</span>
        </div>

        <div class="flashcard-scene" id="fc-scene">
          <div class="flashcard-inner" id="fc-inner">
            <div class="flashcard-face front" id="fc-front"></div>
            <div class="flashcard-face back" id="fc-back"></div>
          </div>
        </div>
        <p class="flashcard-hint">Klicken zum Umdrehen</p>

        <div class="flashcard-actions" id="fc-actions" style="display:none">
          <button class="btn btn-danger btn-sm" id="fc-unknown">✗ Nicht gewusst</button>
          <button class="btn btn-success btn-sm" id="fc-known">✓ Gewusst</button>
        </div>

        <div style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
          <button class="btn btn-secondary btn-sm" id="fc-export-txt">📄 Als Text exportieren</button>
          <button class="btn btn-secondary btn-sm" id="fc-export-pdf">🖨 Drucken</button>
        </div>
      </div>`

    renderCardContent(card)

    document.getElementById('fc-scene').onclick = () => {
      flipped = !flipped
      document.getElementById('fc-inner').classList.toggle('flipped', flipped)
      document.getElementById('fc-actions').style.display = flipped ? 'flex' : 'none'
    }

    document.getElementById('fc-unknown').onclick = (e) => {
      e.stopPropagation()
      setFlashcard(card.id, 'unknown')
      queue.splice(current, 1)
      queue.push(card)
      current = current % queue.length
      flipped = false
      render()
    }

    document.getElementById('fc-known').onclick = (e) => {
      e.stopPropagation()
      setFlashcard(card.id, 'known')
      queue.splice(current, 1)
      if (!queue.length) { render(); return }
      current = current % queue.length
      flipped = false
      render()
    }

    document.getElementById('fc-export-txt').onclick = exportTxt
    document.getElementById('fc-export-pdf').onclick = () => window.print()
  }

  function renderCardContent(card) {
    const front = document.getElementById('fc-front')
    const back = document.getElementById('fc-back')
    if (card.latex) {
      import('katex').then(({ default: katex }) => {
        front.innerHTML = renderLatex(card.front, katex)
        back.innerHTML = renderLatex(card.back, katex)
      })
    } else {
      front.textContent = card.front
      back.textContent = card.back
    }
  }

  function renderLatex(text, katex) {
    return text
      .replace(/\$\$(.+?)\$\$/gs, (_, expr) => katex.renderToString(expr, { displayMode: true, throwOnError: false }))
      .replace(/\$(.+?)\$/g, (_, expr) => katex.renderToString(expr, { throwOnError: false }))
  }

  function exportTxt() {
    const lines = cards.map(c => `Q: ${c.front}\nA: ${c.back}\n`).join('\n')
    const blob = new Blob([lines], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'karteikarten.txt'
    a.click()
  }

  render()
}

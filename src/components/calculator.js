import { setExercise, getProgress } from '../progress.js'

export function mountCalculator(container, exercises) {
  let idx = 0
  const { exercises: saved } = getProgress()

  function render() {
    if (idx >= exercises.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px;">
          <p class="page-title">✅ Alle Aufgaben erledigt!</p>
          <button class="btn btn-secondary" id="calc-reset">Nochmal</button>
        </div>`
      document.getElementById('calc-reset').onclick = () => { idx = 0; render() }
      return
    }

    const ex = exercises[idx]
    container.innerHTML = `
      <div style="max-width:640px;margin:0 auto;">
        <p class="text-secondary" style="margin-bottom:12px;">Aufgabe ${idx + 1} / ${exercises.length}</p>
        <div class="calc-question" id="calc-q"></div>
        <div class="calc-input-row">
          <input class="calc-input" id="calc-ans" type="number" step="any" placeholder="Deine Antwort" />
          <button class="btn btn-buy btn-sm" id="calc-submit">Prüfen</button>
        </div>
        <div id="calc-result"></div>
        <div id="calc-steps-container"></div>
        <div style="margin-top:24px;display:flex;gap:12px;">
          <button class="btn btn-secondary btn-sm" id="calc-show-steps">Lösungsweg anzeigen</button>
          ${idx < exercises.length - 1 ? `<button class="btn btn-primary btn-sm" id="calc-next" style="display:none">Weiter →</button>` : ''}
        </div>
      </div>`

    renderKatex(ex.question, document.getElementById('calc-q'))

    document.getElementById('calc-submit').onclick = () => checkAnswer(ex)
    document.getElementById('calc-show-steps').onclick = () => showSteps(ex)
    document.getElementById('calc-ans').addEventListener('keydown', e => {
      if (e.key === 'Enter') checkAnswer(ex)
    })

    const nextBtn = document.getElementById('calc-next')
    if (nextBtn) nextBtn.onclick = () => { idx++; render() }
  }

  function checkAnswer(ex) {
    const input = document.getElementById('calc-ans')
    const val = parseFloat(input.value)
    const resultDiv = document.getElementById('calc-result')
    const nextBtn = document.getElementById('calc-next')
    if (isNaN(val)) { resultDiv.innerHTML = `<p style="color:var(--color-critical)">Bitte eine Zahl eingeben.</p>`; return }
    if (Math.abs(val - ex.answer) <= (ex.tolerance ?? 0.01)) {
      input.classList.add('correct')
      resultDiv.innerHTML = `<p style="color:var(--color-success);font-weight:700;margin-top:8px;">✓ Richtig!</p>`
      setExercise(ex.id, 'correct')
      if (nextBtn) nextBtn.style.display = 'inline-flex'
    } else {
      input.classList.add('wrong')
      resultDiv.innerHTML = `<p style="color:var(--color-critical);font-weight:700;margin-top:8px;">✗ Nicht ganz. Richtige Antwort: <strong>${ex.answer}</strong></p>`
      setExercise(ex.id, 'incorrect')
      if (nextBtn) nextBtn.style.display = 'inline-flex'
      showSteps(ex)
    }
  }

  function showSteps(ex) {
    const stepsDiv = document.getElementById('calc-steps-container')
    if (!ex.steps?.length) { stepsDiv.innerHTML = `<p class="text-secondary">Kein Lösungsweg verfügbar.</p>`; return }
    stepsDiv.innerHTML = `<div class="calc-steps">${ex.steps.map((s, i) => `<div class="calc-step" id="cstep-${i}"></div>`).join('')}</div>`
    const stepEls = stepsDiv.querySelectorAll('.calc-step')
    ex.steps.forEach((step, i) => renderKatex(step, stepEls[i]))
  }

  async function renderKatex(text, el) {
    const katex = window.katex || (await import('katex').then(m => { window.katex = m.default; return m.default }))
    el.innerHTML = text
      .replace(/\$\$(.+?)\$\$/gs, (_, expr) => katex.renderToString(expr, { displayMode: true, throwOnError: false }))
      .replace(/\$(.+?)\$/g, (_, expr) => katex.renderToString(expr, { throwOnError: false }))
  }

  render()
}

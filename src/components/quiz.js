import { setQuizScore } from '../progress.js'
import { escapeHtml } from '../escape.js'

export function mountQuiz(container, questions, subject) {
  if (!questions?.length) {
    container.innerHTML = '<p class="text-secondary" style="padding:var(--space-xl)">Keine Quiz-Fragen verfügbar.</p>'
    return
  }
  let idx = 0
  let score = 0
  let answered = false
  const wrong = []

  function render() {
    if (idx >= questions.length) {
      renderScoreboard()
      return
    }
    const q = questions[idx]
    const correctText = q.options[q.correct]
    const shuffledOptions = [...(q.options ?? [])]
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]]
    }
    const shuffledCorrect = shuffledOptions.indexOf(correctText)

    container.innerHTML = `
      <div style="max-width:680px;margin:0 auto;">
        <p class="text-secondary" style="margin-bottom:12px;">Frage ${idx + 1} / ${questions.length}</p>
        <p class="quiz-question">${renderInlineLatex(q.question)}</p>
        <div class="quiz-options">
          ${shuffledOptions.map((opt, i) => `
            <button class="quiz-option" data-idx="${i}">${renderInlineLatex(opt)}</button>
          `).join('')}
        </div>
        <div id="quiz-feedback"></div>
        <div id="quiz-next" style="margin-top:24px;display:none;">
          <button class="btn btn-primary btn-sm" id="btn-next">Weiter →</button>
        </div>
      </div>`

    container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.onclick = () => {
        if (answered) return
        answered = true
        const chosen = parseInt(btn.dataset.idx)
        container.querySelectorAll('.quiz-option').forEach(b => b.disabled = true)
        btn.classList.add(chosen === shuffledCorrect ? 'correct' : 'wrong')
        if (chosen === shuffledCorrect) {
          score++
        } else {
          container.querySelectorAll('.quiz-option')[shuffledCorrect].classList.add('correct')
          wrong.push(q)
        }
        if (q.explanation) {
          document.getElementById('quiz-feedback').innerHTML =
            `<div class="quiz-explanation">💡 ${renderInlineLatex(q.explanation)}</div>`
        }
        const nextEl = document.getElementById('quiz-next')
        nextEl.style.display = 'block'
        nextEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })

    document.getElementById('btn-next').onclick = () => {
      idx++
      answered = false
      render()
    }
  }

  function renderScoreboard() {
    setQuizScore(subject, score, questions.length)
    const pct = Math.round((score / questions.length) * 100)
    container.innerHTML = `
      <div class="quiz-scoreboard">
        <div class="quiz-score-number">${score} / ${questions.length}</div>
        <p style="font-size:18px;color:var(--color-steel);margin:16px 0;">${pct}% richtig</p>
        ${wrong.length ? `<button class="btn btn-secondary" id="btn-retry">Falsche Fragen wiederholen (${wrong.length})</button>` : ''}
        <br><br>
        <button class="btn btn-primary" id="btn-restart">Nochmal von vorne</button>
      </div>`
    document.getElementById('btn-restart').onclick = () => {
      idx = 0; score = 0; answered = false; wrong.length = 0; render()
    }
    const retryBtn = document.getElementById('btn-retry')
    if (retryBtn) retryBtn.onclick = () => {
      const retryQs = [...wrong]
      wrong.length = 0; idx = 0; score = 0; answered = false
      mountQuiz(container, retryQs, subject)
    }
  }

  function renderInlineLatex(text) {
    if (!text) return ''
    // Text-Segmente escapen, LaTeX-Formeln durch KaTeX rendern.
    // Split am $...$-Delimiter erhält abwechselnd Text und Formel.
    const parts = String(text).split(/\$(.+?)\$/g)
    return parts.map((part, i) => {
      // i gerade → normaler Text (escapen)
      // i ungerade → LaTeX-Ausdruck (durch KaTeX rendern)
      if (i % 2 === 0) return escapeHtml(part)
      try {
        return window.katex?.renderToString(part, { throwOnError: false }) ?? escapeHtml(`$${part}$`)
      } catch { return escapeHtml(`$${part}$`) }
    }).join('')
  }

  if (!window.katex) {
    import('katex').then(({ default: k }) => { window.katex = k; render() })
  } else {
    render()
  }
}

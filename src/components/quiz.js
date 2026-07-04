import { setQuizScore } from '../progress.js'

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
    container.innerHTML = `
      <div style="max-width:680px;margin:0 auto;">
        <p class="text-secondary" style="margin-bottom:12px;">Frage ${idx + 1} / ${questions.length}</p>
        <p class="quiz-question">${renderInlineLatex(q.question)}</p>
        <div class="quiz-options">
          ${(q.options ?? []).map((opt, i) => `
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
        btn.classList.add(chosen === q.correct ? 'correct' : 'wrong')
        if (chosen === q.correct) {
          score++
        } else {
          container.querySelectorAll('.quiz-option')[q.correct].classList.add('correct')
          wrong.push(q)
        }
        if (q.explanation) {
          document.getElementById('quiz-feedback').innerHTML =
            `<div class="quiz-explanation">💡 ${q.explanation}</div>`
        }
        document.getElementById('quiz-next').style.display = 'block'
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
    return String(text).replace(/\$(.+?)\$/g, (_, expr) => {
      try {
        return window.katex?.renderToString(expr, { throwOnError: false }) ?? `$${expr}$`
      } catch { return `$${expr}$` }
    })
  }

  if (!window.katex) {
    import('katex').then(({ default: k }) => { window.katex = k; render() })
  } else {
    render()
  }
}

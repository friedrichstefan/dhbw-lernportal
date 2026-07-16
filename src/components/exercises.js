import { sanitizeHtml, escapeHtml } from '../escape.js'

export function mountTextExercises(container, exercises) {
  container.innerHTML = exercises.map((ex, i) => `
    <div class="card" style="margin-bottom:var(--space-md)">
      <h3 style="color:var(--color-primary);margin-bottom:var(--space-sm);font-size:1rem">
        Aufgabe ${i + 1}${ex.title ? ' – ' + escapeHtml(ex.title) : ''}
      </h3>
      <p style="color:var(--color-text-secondary);line-height:1.6;margin-bottom:var(--space-sm);font-size:0.9rem">${sanitizeHtml(ex.question)}</p>
      ${ex.task ? `<div style="background:var(--surface-2,var(--surface));border-radius:var(--radius-sm);padding:var(--space-sm) var(--space-md);margin-bottom:var(--space-sm)">${sanitizeHtml(ex.task)}</div>` : ''}
      <button class="btn btn-secondary btn-sm tex-toggle" data-idx="${i}" style="margin-top:4px">
        Lösung anzeigen
      </button>
      <div class="tex-solution" data-idx="${i}" style="display:none;margin-top:var(--space-sm);padding:var(--space-sm) var(--space-md);background:var(--surface-2,var(--surface));border-left:3px solid var(--color-success);border-radius:var(--radius-sm)">
        ${sanitizeHtml(ex.solution)}
      </div>
    </div>
  `).join('')

  container.querySelectorAll('.tex-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.idx
      const sol = container.querySelector(`.tex-solution[data-idx="${idx}"]`)
      const open = sol.style.display === 'none'
      sol.style.display = open ? 'block' : 'none'
      btn.textContent = open ? 'Lösung verbergen' : 'Lösung anzeigen'
    })
  })
}

import { registerPage, setPageCleanup } from '../main.js'
import { mountFlashcards } from '../components/flashcard.js'
import { mountQuiz } from '../components/quiz.js'
import { mountTextExercises } from '../components/exercises.js'
import { getProgress } from '../progress.js'
import { fetchJson } from '../data.js'

registerPage('programmieren', async (app) => {
  const [cards, questions, textExercises] = await Promise.all([
    fetchJson('data/programmieren/flashcards.json'),
    fetchJson('data/programmieren/quiz.json'),
    fetchJson('data/programmieren/text_exercises.json'),
  ])

  async function calcPcts() {
    const { flashcards: fc, quiz_scores: qs } = await getProgress()
    const totalCards = cards.length
    const cardPct = totalCards ? Math.round(cards.filter(c => fc[c.id] === 'known').length / totalCards * 100) : 0
    const totalQuiz = questions.length
    const quizPct = totalQuiz ? Math.round((qs['programmieren']?.last ?? 0) / totalQuiz * 100) : 0
    const parts = [cardPct]
    if (totalQuiz) parts.push(quizPct)
    const overallPct = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
    return { overallPct, cardPct, quizPct, totalQuiz }
  }

  async function renderProgressBars() {
    const el = app.querySelector('#prog-progress-section')
    if (!el) return
    el.innerHTML = progressBarsHtml(await calcPcts())
  }

  const p = await calcPcts()

  const codeExamples = [
    { title: 'Fibonacci (rekursiv)', lang: 'java', code: `public static int fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\n// Aufruf:\nSystem.out.println(fibonacci(10)); // 55` },
    { title: 'Bubblesort', lang: 'java', code: `public static void bubbleSort(int[] arr) {\n    int n = arr.length;\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                int temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n            }\n        }\n    }\n}` },
    { title: 'Binäre Suche', lang: 'java', code: `public static int binarySearch(int[] arr, int target) {\n    int left = 0, right = arr.length - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1; // nicht gefunden\n}` },
    { title: 'OOP: Vererbung & Polymorphismus', lang: 'java', code: `abstract class Tier {\n    String name;\n    Tier(String name) { this.name = name; }\n    abstract String laut(); // abstrakte Methode\n}\n\nclass Hund extends Tier {\n    Hund(String name) { super(name); }\n    @Override\n    String laut() { return "Wuff!"; }\n}\n\n// Polymorphismus:\nTier t = new Hund("Rex");\nSystem.out.println(t.laut()); // Wuff!` },
    { title: 'ArrayList & HashMap', lang: 'java', code: `import java.util.ArrayList;\nimport java.util.HashMap;\n\nArrayList<String> liste = new ArrayList<>();\nliste.add("Alice");\nliste.add("Bob");\nSystem.out.println(liste.get(0)); // Alice\n\nHashMap<String, Integer> map = new HashMap<>();\nmap.put("Alice", 25);\nmap.put("Bob", 30);\nSystem.out.println(map.get("Alice")); // 25` },
    { title: 'Exception Handling', lang: 'java', code: `public static int divide(int a, int b) {\n    if (b == 0) throw new IllegalArgumentException("Teiler darf nicht 0 sein");\n    return a / b;\n}\n\ntry {\n    int result = divide(10, 0);\n} catch (IllegalArgumentException e) {\n    System.out.println("Fehler: " + e.getMessage());\n} finally {\n    System.out.println("Wird immer ausgeführt");\n}` }
  ]

  app.innerHTML = `
    <div class="page-container">
      <h1 class="page-title">Programmieren</h1>
      <div class="card" style="margin-bottom:var(--space-xl)">
        <p class="text-secondary" style="margin-bottom:var(--space-sm)">Dein Lernfortschritt — Programmieren</p>
        <div id="prog-progress-section">
          ${progressBarsHtml(p)}
        </div>
      </div>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Einzelklausur · Java &amp; Algorithmen</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten</button>
        <button class="sub-tab" data-tab="quiz">Quiz</button>
        <button class="sub-tab" data-tab="code">Code-Beispiele</button>
        <button class="sub-tab" data-tab="aufgaben">Aufgaben</button>
      </div>
      <div id="tab-content"></div>
    </div>`

  const tabs = app.querySelectorAll('.sub-tab')
  const content = app.querySelector('#tab-content')

  function renderCode() {
    content.innerHTML = codeExamples.map(ex => `
      <div class="card" style="margin-bottom:var(--space-lg)">
        <h3 style="font-size:18px;font-weight:700;margin-bottom:var(--space-lg)">${ex.title}</h3>
        <div class="code-block">
          <button class="copy-btn" data-code="${encodeURIComponent(ex.code)}">Kopieren</button>
          <pre><code>${ex.code.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>
        </div>
      </div>`).join('')
    content.querySelectorAll('.copy-btn').forEach(btn => {
      btn.onclick = () => {
        navigator.clipboard.writeText(decodeURIComponent(btn.dataset.code))
        btn.textContent = '✓ Kopiert!'
        setTimeout(() => btn.textContent = 'Kopieren', 2000)
      }
    })
  }

  function activate(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name))
    if (name === 'flashcards') {
      content.innerHTML = `<div class="skeleton skeleton-fc"></div>`
      mountFlashcards(content, cards)
    } else if (name === 'quiz') {
      content.innerHTML = Array(3).fill(`
        <div class="skeleton-card" style="margin-bottom:var(--space-md)">
          <div class="skeleton skeleton-text" style="width:80%;margin-bottom:var(--space-lg)"></div>
          <div class="skeleton skeleton-text" style="width:100%;margin-bottom:var(--space-sm)"></div>
          <div class="skeleton skeleton-text" style="width:100%;margin-bottom:var(--space-sm)"></div>
          <div class="skeleton skeleton-text" style="width:100%"></div>
        </div>`).join('')
      mountQuiz(content, questions, 'programmieren')
    } else if (name === 'aufgaben') {
      content.innerHTML = Array(3).fill(`
        <div class="skeleton-card" style="margin-bottom:var(--space-md)">
          <div class="skeleton skeleton-text" style="width:55%;margin-bottom:var(--space-md)"></div>
          <div class="skeleton skeleton-text" style="width:90%;margin-bottom:var(--space-sm)"></div>
          <div class="skeleton skeleton-text" style="width:70%"></div>
        </div>`).join('')
      mountTextExercises(content, textExercises)
    } else {
      content.innerHTML = ''
      if (name === 'code') renderCode()
    }
  }
  tabs.forEach(t => { t.onclick = () => activate(t.dataset.tab) })
  activate('flashcards')

  window.addEventListener('progress-updated', renderProgressBars)
  setPageCleanup(() => window.removeEventListener('progress-updated', renderProgressBars))
})

function progressBarsHtml({ overallPct, cardPct, quizPct, totalQuiz }) {
  return `
    <div style="display:flex;align-items:center;gap:var(--space-xl);flex-wrap:wrap;margin-bottom:var(--space-md)">
      <div><span style="font-size:32px;font-weight:500;color:var(--color-primary)">${overallPct}%</span> <span class="text-secondary">gesamt</span></div>
      <div style="flex:1;min-width:160px"><div class="progress-bar" style="height:10px"><div class="progress-bar-fill" style="width:${overallPct}%"></div></div></div>
    </div>
    <div class="stat-row">
      <div style="display:flex;align-items:center;gap:var(--space-sm)">
        <span style="font-size:13px;color:var(--color-steel)">Karteikarten</span>
        <div class="progress-bar" style="width:80px"><div class="progress-bar-fill" style="width:${cardPct}%"></div></div>
        <span style="font-size:13px;font-weight:600;color:var(--color-primary)">${cardPct}%</span>
      </div>
      ${totalQuiz ? `<div style="display:flex;align-items:center;gap:var(--space-sm)">
        <span style="font-size:13px;color:var(--color-steel)">Quiz</span>
        <div class="progress-bar" style="width:80px"><div class="progress-bar-fill" style="width:${quizPct}%"></div></div>
        <span style="font-size:13px;font-weight:600;color:var(--color-primary)">${quizPct}%</span>
      </div>` : ''}
    </div>`
}

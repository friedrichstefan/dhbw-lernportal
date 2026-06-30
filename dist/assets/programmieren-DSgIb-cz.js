import{r as d}from"./index-Cwg--IsH.js";import{m as b}from"./flashcard-DAmm8YGa.js";import{m as u}from"./quiz-pnQB4lwp.js";import"./progress-Cx9Fygjb.js";d("programmieren",async a=>{const[i,c]=await Promise.all([fetch("./data/programmieren/flashcards.json").then(t=>t.json()),fetch("./data/programmieren/quiz.json").then(t=>t.json())]),s=[{title:"Fibonacci (rekursiv)",lang:"python",code:`def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))  # 55`},{title:"Bubblesort",lang:"python",code:`def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`},{title:"Lineare Suche",lang:"python",code:`def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1`}];a.innerHTML=`
    <div class="page-container">
      <h1 class="page-title">Programmieren</h1>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Einzelklausur · Python & Algorithmen</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten</button>
        <button class="sub-tab" data-tab="quiz">Quiz</button>
        <button class="sub-tab" data-tab="code">Code-Beispiele</button>
      </div>
      <div id="tab-content"></div>
    </div>`;const r=a.querySelectorAll(".sub-tab"),e=a.querySelector("#tab-content");function l(){e.innerHTML=s.map(t=>`
      <div class="card" style="margin-bottom:var(--space-lg)">
        <h3 style="font-size:18px;font-weight:700;margin-bottom:var(--space-lg)">${t.title}</h3>
        <div class="code-block">
          <button class="copy-btn" data-code="${encodeURIComponent(t.code)}">Kopieren</button>
          <pre><code>${t.code.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>
        </div>
      </div>`).join(""),e.querySelectorAll(".copy-btn").forEach(t=>{t.onclick=()=>{navigator.clipboard.writeText(decodeURIComponent(t.dataset.code)),t.textContent="✓ Kopiert!",setTimeout(()=>t.textContent="Kopieren",2e3)}})}function n(t){r.forEach(o=>o.classList.toggle("active",o.dataset.tab===t)),e.innerHTML="",t==="flashcards"&&b(e,i),t==="quiz"&&u(e,c,"programmieren"),t==="code"&&l()}r.forEach(t=>{t.onclick=()=>n(t.dataset.tab)}),n("flashcards")});

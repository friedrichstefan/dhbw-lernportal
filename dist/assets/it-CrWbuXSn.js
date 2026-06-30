import{r}from"./index-Cwg--IsH.js";import{m as l}from"./flashcard-DAmm8YGa.js";import{m as b}from"./quiz-pnQB4lwp.js";import"./progress-Cx9Fygjb.js";r("it",async a=>{const[c,n]=await Promise.all([fetch("./data/it/flashcards.json").then(t=>t.json()),fetch("./data/it/quiz.json").then(t=>t.json())]);a.innerHTML=`
    <div class="page-container">
      <h1 class="page-title">IT 1 & IT 2</h1>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Kombi-Klausur 2 · Betriebssysteme & Kommunikationssysteme</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten</button>
        <button class="sub-tab" data-tab="quiz">Quiz</button>
      </div>
      <div id="tab-content"></div>
    </div>`;const i=a.querySelectorAll(".sub-tab"),s=a.querySelector("#tab-content");function e(t){i.forEach(o=>o.classList.toggle("active",o.dataset.tab===t)),s.innerHTML="",t==="flashcards"&&l(s,c),t==="quiz"&&b(s,n,"it")}i.forEach(t=>{t.onclick=()=>e(t.dataset.tab)}),e("flashcards")});

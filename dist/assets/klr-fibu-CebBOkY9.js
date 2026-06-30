import{r}from"./index-Cwg--IsH.js";import{m as o}from"./flashcard-DAmm8YGa.js";import{m as u}from"./quiz-pnQB4lwp.js";import{m as l}from"./calculator-C33lOByJ.js";import"./progress-Cx9Fygjb.js";r("klr-fibu",async e=>{const[n,c,s]=await Promise.all([fetch("./data/klr-fibu/flashcards.json").then(t=>t.json()),fetch("./data/klr-fibu/quiz.json").then(t=>t.json()),fetch("./data/klr-fibu/exercises.json").then(t=>t.json())]);e.innerHTML=`
    <div class="page-container">
      <h1 class="page-title">KLR / Finanzbuchhaltung</h1>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Kombi-Klausur 1</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten</button>
        <button class="sub-tab" data-tab="quiz">Quiz</button>
        <button class="sub-tab" data-tab="rechnen">Rechenaufgaben</button>
      </div>
      <div id="tab-content"></div>
    </div>`,b(e,{flashcards:n,quiz:c,rechnen:s})});function b(e,n){const c=e.querySelectorAll(".sub-tab"),s=e.querySelector("#tab-content");function t(a){c.forEach(i=>i.classList.toggle("active",i.dataset.tab===a)),s.innerHTML="",a==="flashcards"&&o(s,n.flashcards),a==="quiz"&&u(s,n.quiz,"klr-fibu"),a==="rechnen"&&l(s,n.rechnen)}c.forEach(a=>{a.onclick=()=>t(a.dataset.tab)}),t("flashcards")}

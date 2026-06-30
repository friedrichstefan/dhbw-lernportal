import{r as i}from"./index-Cwg--IsH.js";import{m as l}from"./flashcard-DAmm8YGa.js";import{m as b}from"./calculator-C33lOByJ.js";import"./progress-Cx9Fygjb.js";i("mathe",async t=>{const[r,o]=await Promise.all([fetch("./data/mathe/flashcards.json").then(a=>a.json()),fetch("./data/mathe/exercises.json").then(a=>a.json())]);t.innerHTML=`
    <div class="page-container">
      <h1 class="page-title">Mathematik</h1>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Einzelklausur · Logik, Algebra, Analysis</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten</button>
        <button class="sub-tab" data-tab="rechnen">Rechenaufgaben</button>
      </div>
      <div id="tab-content"></div>
    </div>`;const e=t.querySelectorAll(".sub-tab"),s=t.querySelector("#tab-content");function c(a){e.forEach(n=>n.classList.toggle("active",n.dataset.tab===a)),s.innerHTML="",a==="flashcards"&&l(s,r),a==="rechnen"&&b(s,o)}e.forEach(a=>{a.onclick=()=>c(a.dataset.tab)}),c("flashcards")});

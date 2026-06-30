import{r as z}from"./index-Cwg--IsH.js";import{g as E,s as m}from"./progress-Cx9Fygjb.js";z("dashboard",async r=>{const[p,a,o,d,u,c,e,i,x]=await Promise.all([fetch("./data/klr-fibu/flashcards.json").then(t=>t.json()),fetch("./data/klr-fibu/quiz.json").then(t=>t.json()),fetch("./data/klr-fibu/exercises.json").then(t=>t.json()),fetch("./data/it/flashcards.json").then(t=>t.json()),fetch("./data/it/quiz.json").then(t=>t.json()),fetch("./data/mathe/flashcards.json").then(t=>t.json()),fetch("./data/mathe/exercises.json").then(t=>t.json()),fetch("./data/programmieren/flashcards.json").then(t=>t.json()),fetch("./data/programmieren/quiz.json").then(t=>t.json())]),{flashcards:b,quiz_scores:k,exercises:j,todos:$}=E();function h(t){return t.length?Math.round(t.filter(n=>b[n.id]==="known").length/t.length*100):0}function g(t){return t.length?Math.round(t.filter(n=>j[n.id]==="correct").length/t.length*100):0}function f(t,n){const s=k[t];return s?Math.round(s.last/n*100):0}function l(...t){const n=t.filter(s=>s!=null);return n.length?Math.round(n.reduce((s,w)=>s+w,0)/n.length):0}const v=[{name:"KLR / FIBU",href:"#klr-fibu",klasse:"Kombi-Klausur 1",pct:l(h([...p]),f("klr-fibu",a.length),g(o))},{name:"IT 1 & IT 2",href:"#it",klasse:"Kombi-Klausur 2",pct:l(h([...d]),f("it",u.length))},{name:"Mathematik",href:"#mathe",klasse:"Einzelklausur",pct:l(h([...c]),g(e))},{name:"Programmieren",href:"#programmieren",klasse:"Einzelklausur",pct:l(h([...i]),f("programmieren",x.length))}],y=l(...v.map(t=>t.pct));r.innerHTML=`
    <div class="page-container">
      <h1 class="page-title">Dashboard</h1>

      <div class="card" style="margin-bottom:var(--space-xl)">
        <div style="display:flex;align-items:center;gap:var(--space-xl);flex-wrap:wrap;">
          <div>
            <p class="text-secondary" style="margin-bottom:4px;">Gesamtfortschritt 2. Semester</p>
            <p style="font-size:48px;font-weight:500;color:var(--color-primary);line-height:1.17;">${y}%</p>
          </div>
          <div style="flex:1;min-width:200px;">
            <div class="progress-bar" style="height:12px;">
              <div class="progress-bar-fill" style="width:${y}%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-grid" style="margin-bottom:var(--space-xxl)">
        ${v.map(t=>`
          <a href="${t.href}" style="text-decoration:none;">
            <div class="card" style="cursor:pointer;transition:box-shadow 0.15s;">
              <p class="text-secondary" style="margin-bottom:4px;">${t.klasse}</p>
              <h2 style="font-size:18px;font-weight:700;color:var(--color-ink-deep);margin-bottom:var(--space-lg);">${t.name}</h2>
              <div style="display:flex;align-items:center;gap:var(--space-md);">
                <div class="progress-bar" style="flex:1"><div class="progress-bar-fill" style="width:${t.pct}%"></div></div>
                <span style="font-size:14px;font-weight:700;color:var(--color-primary)">${t.pct}%</span>
              </div>
            </div>
          </a>`).join("")}
      </div>

      <h2 class="section-title">To-Do Liste</h2>
      <div id="todo-container"></div>
    </div>`,I(document.getElementById("todo-container"),$)});function I(r,p){let a=[...p];function o(){r.innerHTML=`
      <div class="todo-list">
        ${a.map((e,i)=>`
          <div class="todo-item ${e.done?"done":""}" data-i="${i}">
            <input type="checkbox" ${e.done?"checked":""} data-idx="${i}" />
            <span style="flex:1">${e.text}</span>
            <button class="btn btn-sm" style="background:transparent;color:var(--color-critical);border:none;cursor:pointer;" data-del="${i}">✕</button>
          </div>`).join("")}
      </div>
      <div class="todo-add-row">
        <input class="todo-input" id="todo-input" type="text" placeholder="Neue Aufgabe hinzufügen..." maxlength="200" />
        <button class="btn btn-primary btn-sm" id="todo-add">Hinzufügen</button>
      </div>`,r.querySelectorAll('input[type="checkbox"]').forEach(e=>{e.onchange=()=>{a[parseInt(e.dataset.idx)].done=e.checked,m(a),o()}}),r.querySelectorAll("[data-del]").forEach(e=>{e.onclick=()=>{a.splice(parseInt(e.dataset.del),1),m(a),o()}});const d=document.getElementById("todo-input"),u=document.getElementById("todo-add"),c=()=>{const e=d.value.trim();e&&(a.push({id:`t${Date.now()}`,text:e,done:!1}),m(a),o())};u.onclick=c,d.onkeydown=e=>{e.key==="Enter"&&c()}}o()}

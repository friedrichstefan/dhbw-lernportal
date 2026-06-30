import{_ as m}from"./index-Cwg--IsH.js";import{g as y,a as g}from"./progress-Cx9Fygjb.js";function v(o,l){let i=0;y();function a(){if(i>=l.length){o.innerHTML=`
        <div style="text-align:center;padding:40px;">
          <p class="page-title">✅ Alle Aufgaben erledigt!</p>
          <button class="btn btn-secondary" id="calc-reset">Nochmal</button>
        </div>`,document.getElementById("calc-reset").onclick=()=>{i=0,a()};return}const t=l[i];o.innerHTML=`
      <div style="max-width:640px;margin:0 auto;">
        <p class="text-secondary" style="margin-bottom:12px;">Aufgabe ${i+1} / ${l.length}</p>
        <div class="calc-question" id="calc-q"></div>
        <div class="calc-input-row">
          <input class="calc-input" id="calc-ans" type="number" step="any" placeholder="Deine Antwort" />
          <button class="btn btn-buy btn-sm" id="calc-submit">Prüfen</button>
        </div>
        <div id="calc-result"></div>
        <div id="calc-steps-container"></div>
        <div style="margin-top:24px;display:flex;gap:12px;">
          <button class="btn btn-secondary btn-sm" id="calc-show-steps">Lösungsweg anzeigen</button>
          ${i<l.length-1?'<button class="btn btn-primary btn-sm" id="calc-next" style="display:none">Weiter →</button>':""}
        </div>
      </div>`,u(t.question,document.getElementById("calc-q")),document.getElementById("calc-submit").onclick=()=>d(t),document.getElementById("calc-show-steps").onclick=()=>p(t),document.getElementById("calc-ans").addEventListener("keydown",s=>{s.key==="Enter"&&d(t)});const e=document.getElementById("calc-next");e&&(e.onclick=()=>{i++,a()})}function d(t){const e=document.getElementById("calc-ans"),s=parseFloat(e.value),n=document.getElementById("calc-result"),c=document.getElementById("calc-next");if(isNaN(s)){n.innerHTML='<p style="color:var(--color-critical)">Bitte eine Zahl eingeben.</p>';return}Math.abs(s-t.answer)<=(t.tolerance??.01)?(e.classList.add("correct"),n.innerHTML='<p style="color:var(--color-success);font-weight:700;margin-top:8px;">✓ Richtig!</p>',g(t.id,"correct"),c&&(c.style.display="inline-flex")):(e.classList.add("wrong"),n.innerHTML=`<p style="color:var(--color-critical);font-weight:700;margin-top:8px;">✗ Nicht ganz. Richtige Antwort: <strong>${t.answer}</strong></p>`,g(t.id,"incorrect"),c&&(c.style.display="inline-flex"),p(t))}function p(t){var n;const e=document.getElementById("calc-steps-container");if(!((n=t.steps)!=null&&n.length)){e.innerHTML='<p class="text-secondary">Kein Lösungsweg verfügbar.</p>';return}e.innerHTML=`<div class="calc-steps">${t.steps.map((c,r)=>`<div class="calc-step" id="cstep-${r}"></div>`).join("")}</div>`;const s=e.querySelectorAll(".calc-step");t.steps.forEach((c,r)=>u(c,s[r]))}async function u(t,e){const s=window.katex||await m(()=>import("./katex-C5jXJg4s.js"),[],import.meta.url).then(n=>(window.katex=n.default,n.default));e.innerHTML=t.replace(/\$\$(.+?)\$\$/gs,(n,c)=>s.renderToString(c,{displayMode:!0,throwOnError:!1})).replace(/\$(.+?)\$/g,(n,c)=>s.renderToString(c,{throwOnError:!1}))}a()}export{v as m};

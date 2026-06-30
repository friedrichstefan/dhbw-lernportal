import{_ as b}from"./index-Cwg--IsH.js";import{b as f}from"./progress-Cx9Fygjb.js";function g(r,o,u){let i=0,l=0,c=!1;const a=[];function d(){if(i>=o.length){m();return}const t=o[i];r.innerHTML=`
      <div style="max-width:680px;margin:0 auto;">
        <p class="text-secondary" style="margin-bottom:12px;">Frage ${i+1} / ${o.length}</p>
        <p class="quiz-question">${p(t.question)}</p>
        <div class="quiz-options">
          ${t.options.map((n,e)=>`
            <button class="quiz-option" data-idx="${e}">${p(n)}</button>
          `).join("")}
        </div>
        <div id="quiz-feedback"></div>
        <div id="quiz-next" style="margin-top:24px;display:none;">
          <button class="btn btn-primary btn-sm" id="btn-next">Weiter →</button>
        </div>
      </div>`,r.querySelectorAll(".quiz-option").forEach(n=>{n.onclick=()=>{if(c)return;c=!0;const e=parseInt(n.dataset.idx);r.querySelectorAll(".quiz-option").forEach(s=>s.disabled=!0),n.classList.add(e===t.correct?"correct":"wrong"),e===t.correct?l++:(r.querySelectorAll(".quiz-option")[t.correct].classList.add("correct"),a.push(t)),t.explanation&&(document.getElementById("quiz-feedback").innerHTML=`<div class="quiz-explanation">💡 ${t.explanation}</div>`),document.getElementById("quiz-next").style.display="block"}}),document.getElementById("btn-next").onclick=()=>{i++,c=!1,d()}}function m(){f(u,l,o.length);const t=Math.round(l/o.length*100);r.innerHTML=`
      <div class="quiz-scoreboard">
        <div class="quiz-score-number">${l} / ${o.length}</div>
        <p style="font-size:18px;color:var(--color-steel);margin:16px 0;">${t}% richtig</p>
        ${a.length?`<button class="btn btn-secondary" id="btn-retry">Falsche Fragen wiederholen (${a.length})</button>`:""}
        <br><br>
        <button class="btn btn-primary" id="btn-restart">Nochmal von vorne</button>
      </div>`,document.getElementById("btn-restart").onclick=()=>{i=0,l=0,c=!1,a.length=0,d()};const n=document.getElementById("btn-retry");n&&(n.onclick=()=>{const e=[...a];a.length=0,i=0,l=0,c=!1,g(r,e,u)})}function p(t){return t.replace(/\$(.+?)\$/g,(n,e)=>{var s;try{return((s=window.katex)==null?void 0:s.renderToString(e,{throwOnError:!1}))??`$${e}$`}catch{return`$${e}$`}})}window.katex?d():b(async()=>{const{default:t}=await import("./katex-C5jXJg4s.js");return{default:t}},[],import.meta.url).then(({default:t})=>{window.katex=t,d()})}export{g as m};

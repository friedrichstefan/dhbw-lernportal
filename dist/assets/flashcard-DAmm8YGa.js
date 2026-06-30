import{_ as h}from"./index-Cwg--IsH.js";import{g as p,c as u}from"./progress-Cx9Fygjb.js";function k(d,l){const{flashcards:m}=p();let n=[...l.filter(t=>m[t.id]!=="known")];n.length||(n=[...l]);let o=0,a=!1;function r(){if(!n.length){d.innerHTML=`
        <div class="page-container" style="text-align:center;padding-top:40px;">
          <p class="page-title">🎉 Alle Karten gemeistert!</p>
          <button class="btn btn-secondary" id="fc-reset">Nochmal von vorne</button>
        </div>`,d.querySelector("#fc-reset").onclick=()=>{n=[...l],o=0,a=!1,r()};return}const t=n[o],c=Object.values(p().flashcards).filter(i=>i==="known").length,s=l.length,e=Math.round(c/s*100);d.innerHTML=`
      <div style="max-width:640px;margin:0 auto;">
        <div class="flashcard-progress">
          <span class="flashcard-counter">${c} / ${s} Karten gemeistert</span>
          <div class="progress-bar" style="flex:1">
            <div class="progress-bar-fill" style="width:${e}%"></div>
          </div>
          <span class="text-secondary">${e}%</span>
        </div>

        <div class="flashcard-scene" id="fc-scene">
          <div class="flashcard-inner" id="fc-inner">
            <div class="flashcard-face front" id="fc-front"></div>
            <div class="flashcard-face back" id="fc-back"></div>
          </div>
        </div>
        <p class="flashcard-hint">Klicken zum Umdrehen</p>

        <div class="flashcard-actions" id="fc-actions" style="display:none">
          <button class="btn btn-danger btn-sm" id="fc-unknown">✗ Nicht gewusst</button>
          <button class="btn btn-success btn-sm" id="fc-known">✓ Gewusst</button>
        </div>

        <div style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
          <button class="btn btn-secondary btn-sm" id="fc-export-txt">📄 Als Text exportieren</button>
          <button class="btn btn-secondary btn-sm" id="fc-export-pdf">🖨 Drucken</button>
        </div>
      </div>`,g(t),document.getElementById("fc-scene").onclick=()=>{a=!a,document.getElementById("fc-inner").classList.toggle("flipped",a),document.getElementById("fc-actions").style.display=a?"flex":"none"},document.getElementById("fc-unknown").onclick=i=>{i.stopPropagation(),u(t.id,"unknown"),n.splice(o,1),n.push(t),o=o%n.length,a=!1,r()},document.getElementById("fc-known").onclick=i=>{if(i.stopPropagation(),u(t.id,"known"),n.splice(o,1),!n.length){r();return}o=o%n.length,a=!1,r()},document.getElementById("fc-export-txt").onclick=b,document.getElementById("fc-export-pdf").onclick=()=>window.print()}function g(t){const c=document.getElementById("fc-front"),s=document.getElementById("fc-back");t.latex?h(async()=>{const{default:e}=await import("./katex-C5jXJg4s.js");return{default:e}},[],import.meta.url).then(({default:e})=>{c.innerHTML=f(t.front,e),s.innerHTML=f(t.back,e)}):(c.textContent=t.front,s.textContent=t.back)}function f(t,c){return t.replace(/\$\$(.+?)\$\$/gs,(s,e)=>c.renderToString(e,{displayMode:!0,throwOnError:!1})).replace(/\$(.+?)\$/g,(s,e)=>c.renderToString(e,{throwOnError:!1}))}function b(){const t=l.map(e=>`Q: ${e.front}
A: ${e.back}
`).join(`
`),c=new Blob([t],{type:"text/plain"}),s=document.createElement("a");s.href=URL.createObjectURL(c),s.download="karteikarten.txt",s.click()}r()}export{k as m};

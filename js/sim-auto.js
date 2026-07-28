(()=>{"use strict";
const selected=new Map();
const zones=[...document.querySelectorAll(".zone")];
const stages=[...document.querySelectorAll(".vehicle-stage")];
const list=document.querySelector("[data-selected-list]");
const counts=[...document.querySelectorAll("[data-selected-count]")];
const title=document.querySelector("[data-view-title]");
const page=document.querySelector(".sim-auto-page");
const render=()=>{
 counts.forEach(node=>node.textContent=selected.size);
 zones.forEach(zone=>zone.classList.toggle("selected",selected.has(zone.dataset.zone)));
 if(!selected.size){list.innerHTML='<p class="empty-selection">Nothing selected yet. Tap a zone on the car.</p>';return;}
 list.innerHTML=[...selected.values()].map((item,index)=>`<div class="selected-item"><span class="selected-number">${index+1}</span><span>${item.label}</span><button class="selected-remove" type="button" data-remove="${item.id}" aria-label="Remove ${item.label}">×</button></div>`).join("");
};
const toggle=zone=>{const id=zone.dataset.zone;selected.has(id)?selected.delete(id):selected.set(id,{id,label:zone.dataset.label});render();};
zones.forEach(zone=>{zone.addEventListener("click",()=>toggle(zone));zone.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();toggle(zone);}});});
list.addEventListener("click",event=>{const button=event.target.closest("[data-remove]");if(button){selected.delete(button.dataset.remove);render();}});
document.querySelectorAll("[data-view-button]").forEach(button=>button.addEventListener("click",()=>{
 const view=button.dataset.viewButton;stages.forEach(stage=>stage.classList.toggle("d-none",stage.dataset.view!==view));document.querySelectorAll("[data-view-button]").forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-selected",active);});title.textContent=view[0].toUpperCase()+view.slice(1);page.classList.remove("preview-mode");
}));
document.querySelector("[data-clear]").addEventListener("click",()=>{selected.clear();page.classList.remove("preview-mode");render();});
document.querySelector("[data-preview]").addEventListener("click",()=>page.classList.toggle("preview-mode"));
document.querySelector("[data-next]").addEventListener("click",()=>{const payload=[...selected.values()];sessionStorage.setItem("shynetymeSimAutoSelections",JSON.stringify(payload));const params=new URLSearchParams();if(payload.length)params.set("autoZones",payload.map(item=>item.label).join(", "));window.location.href=`../contact.html${params.toString()?`?${params}`:""}`;});
render();
})();

const $=id=>document.getElementById(id);
// tabs
const tabs=[...document.querySelectorAll('[role=tab]')];
function show(id){tabs.forEach(t=>{const on=t.getAttribute('aria-controls')===id;t.setAttribute('aria-selected',on);$(t.getAttribute('aria-controls')).hidden=!on});scrollTo(0,0)}
tabs.forEach(t=>t.onclick=()=>show(t.getAttribute('aria-controls')));

// equipment data state (supports API or data.js fallback)
let equipmentData = (typeof DATA !== 'undefined') ? DATA : [];

// Try to fetch newest data from backend API
async function loadDataFromApi() {
  try {
    const res = await fetch('/api/equipments');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        equipmentData = data;
        if (place) {
          cats = ["ทั้งหมด", ...new Set(equipmentData.filter(d => d.p === place).map(d => d.c))];
          chips();
          render();
        }
      }
    }
  } catch (_) {
    // Graceful fallback to static data
  }
}
loadDataFromApi();

let cat="ทั้งหมด",place="";
let cats=[];
function chips(){$('chips').innerHTML="";cats.forEach(c=>{const b=document.createElement('button');b.className='chip';b.textContent=c;b.setAttribute('aria-pressed',c===cat);b.onclick=()=>{cat=c;chips();render()};$('chips').append(b)})}
function card(d){
 const rows=d.rows||[["แบรนด์ / รุ่น",d.b],["จำนวน",d.q],["Specification",d.sp],["Test space",d.ts],["จำนวนตัวอย่าง",d.sm],["Location",d.l]];
 const img=d.img?`<img src="${d.img}" alt="${d.n}">`:"พื้นที่ใส่รูปตัวอย่างเครื่องมือ";
 return `<article class="item wide${d.cons?" cons":""}"><div>${d.cons?'<span class="tag">Consigned Equipment</span>':""}<h4>${d.n}</h4><p class="en">${d.e}</p><dl>${rows.map(r=>`<dt>${r[0]}</dt><dd class="pl">${r[1]}</dd>`).join("")}</dl></div><div class="ph" role="img" aria-label="พื้นที่ใส่รูปตัวอย่างเครื่องมือ">${img}</div>${d.rm?`<div class="rm">Remark: ${d.rm}</div>`:""}</article>`}
function render(){
 const k=$('q').value.trim().toLowerCase();
 const r=equipmentData.filter(d=>d.p===place&&(cat==="ทั้งหมด"||d.c===cat)&&((d.n||'')+(d.e||'')).toLowerCase().includes(k));
 const cons=r.filter(d=>d.cons),reg=r.filter(d=>!d.cons);
 $('grid').innerHTML=reg.map(card).join("")+cons.map(card).join("");
 $('none').hidden=r.length>0;
}
$('q').oninput=render;
function choose(p){place=p;cat="ทั้งหมด";$('q').value="";cats=["ทั้งหมด",...new Set(equipmentData.filter(d=>d.p===p).map(d=>d.c))];
 $('searchbar').hidden=true;$('chips').hidden=(cats.length<3);$('pick').hidden=true;$('eqview').hidden=false;$('eqtitle').textContent="เครื่องมือที่ "+p;$('eqlead').textContent="รายการเครื่องมือและรายละเอียด";chips();render()}
document.querySelectorAll('.loc').forEach(b=>b.onclick=()=>choose(b.dataset.p));
$('back').onclick=()=>{$('eqview').hidden=true;$('pick').hidden=false;$('eqlead').textContent="เลือกสถานที่เพื่อดูรายการเครื่องมือ"};

document.querySelectorAll('.pg img').forEach(i=>i.onclick=()=>i.parentElement.classList.toggle('zoom'));
$('jump').onchange=e=>{const f=$('pg'+e.target.value);if(f)f.scrollIntoView({behavior:'smooth'})};

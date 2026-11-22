const KEY='chaiCigarettesData_v1', $=id=>document.getElementById(id);
const today=()=>{let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const now=()=>{let d=new Date();return `${today()}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`};
const rupee=n=>'₹'+(Number(n)||0).toFixed(2).replace(/\.00$/,'');
const fresh=()=>({version:2,settings:{halfTea:5,fullTea:10,brands:[{id:'default',name:'Default cigarette',price:18}],activeBrand:'default'},records:[]});
function load(){try{let x=JSON.parse(localStorage.getItem(KEY));if(x&&Array.isArray(x.records)){let d=fresh();return {...d,...x,version:2,settings:{...d.settings,...x.settings}}}}catch(e){}return fresh()}
let data=load(),lastAdded=null;
function save(){localStorage.setItem(KEY,JSON.stringify(data));render()}
function dayRecords(day=today()){return data.records.filter(r=>r.datetime.slice(0,10)===day)}
function total(rows){return rows.reduce((s,r)=>s+Number(r.cost||0),0)}
function count(rows,kind){return rows.filter(r=>r.kind===kind).reduce((s,r)=>s+Number(r.qty||1),0)}
function teaCount(rows){return rows.filter(r=>r.kind==='tea').reduce((s,r)=>s+(r.teaSize==='half'?.5:1)*Number(r.qty||1),0)}
function activeBrand(){return data.settings.brands.find(b=>b.id===data.settings.activeBrand)||data.settings.brands[0]}
function render(){
 let rows=dayRecords(),my=rows.filter(r=>r.owner==='my'),group=rows.filter(r=>r.owner==='group'),month= data.records.filter(r=>r.datetime.startsWith(today().slice(0,7)));
 $('todaySpend').textContent=rupee(total(rows));$('mySpend').textContent=rupee(total(my));$('groupSpend').textContent=rupee(total(group));$('monthSpend').textContent=rupee(total(month));
 $('myCigs').textContent=count(my,'cigarette');$('groupCigs').textContent=count(group,'cigarette');$('myTea').textContent=teaCount(my).toFixed(1).replace(/\.0$/,'');$('groupTea').textContent=teaCount(group).toFixed(1).replace(/\.0$/,'');
 $('myTodayCount').textContent=(my.length)+' entries today';$('groupTodayCount').textContent=(group.length)+' entries today';
 let b=activeBrand();$('myCigPrice').textContent=rupee(b?.price)+' each';$('groupCigPrice').textContent=rupee(b?.price)+' each';
 $('halfPriceLabel').textContent=rupee(data.settings.halfTea);$('groupHalfPrice').textContent=rupee(data.settings.halfTea);$('fullPriceLabel').textContent=rupee(data.settings.fullTea);$('groupFullPrice').textContent=rupee(data.settings.fullTea);
 $('undoBtn').disabled=!data.records.length;
}
function add(kind,owner){
 let cost,teaSize=null,brand=null,label;
 if(kind==='cigarette'){brand=activeBrand();cost=Number(brand?.price)||0;label=(owner==='my'?'My':'Group')+' cigarette added';}
 else{teaSize=kind;cost=Number(kind==='half'?data.settings.halfTea:data.settings.fullTea)||0;label=(owner==='my'?'My':'Group')+' '+(kind==='half'?'half chai':'full chai')+' added';}
 let r={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),kind:kind==='cigarette'?'cigarette':'tea',owner,qty:1,teaSize,brandId:brand?.id||null,brandName:brand?.name||null,unitPrice:cost,cost,datetime:now()};
 data.records.push(r);lastAdded=r.id;save();$('feedback').textContent=label+' · '+rupee(cost);
}
document.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>add(btn.dataset.add,btn.dataset.owner)));
$('undoBtn').addEventListener('click',()=>{
 if(!data.records.length)return;
 const r=data.records[data.records.length-1];
 const item=r.kind==='cigarette'?(r.brandName||'Cigarette'):(r.teaSize==='half'?'Half chai':'Full chai');
 const owner=r.owner==='my'?'My count':'Group count';
 const when=new Date(r.datetime).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
 const message=`Undo this entry?\\n\\n${owner}: ${item}\\nAmount: ${rupee(r.cost)}\\nTime: ${when}\\n\\nThis will remove the latest record.`;
 if(!window.confirm(message))return;
 data.records.pop();lastAdded=null;save();$('feedback').textContent='Last entry removed.';
});
$('settingsOpen').addEventListener('click',openSettings);
function openSettings(){ $('halfPrice').value=data.settings.halfTea;$('fullPrice').value=data.settings.fullTea;renderBrands();$('settingsDialog').showModal()}
function renderBrands(){
 $('brands').innerHTML=data.settings.brands.map(b=>`<div class="brand-row" data-id="${esc(b.id)}"><input class="bn" value="${esc(b.name)}"><input class="bp" type="number" min="0" step=".5" value="${b.price}"><button class="del" type="button">×</button></div>`).join('');
 $('activeBrand').innerHTML=data.settings.brands.map(b=>`<option value="${esc(b.id)}">${esc(b.name)} (${rupee(b.price)})</option>`).join('');$('activeBrand').value=data.settings.activeBrand;
 document.querySelectorAll('.del').forEach(btn=>btn.onclick=()=>{if(data.settings.brands.length<2)return alert('Keep at least one cigarette brand.');let id=btn.closest('.brand-row').dataset.id;data.settings.brands=data.settings.brands.filter(b=>b.id!==id);if(data.settings.activeBrand===id)data.settings.activeBrand=data.settings.brands[0].id;renderBrands()});
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('addBrand').onclick=()=>{let name=$('brandName').value.trim(),price=Number($('brandPrice').value);if(!name||!Number.isFinite(price)||price<0)return alert('Enter a brand and price.');let id=crypto.randomUUID?crypto.randomUUID():String(Date.now());data.settings.brands.push({id,name,price});data.settings.activeBrand=id;$('brandName').value='';$('brandPrice').value='';renderBrands()};
$('saveSettings').onclick=()=>{data.settings.halfTea=Math.max(0,Number($('halfPrice').value)||0);data.settings.fullTea=Math.max(0,Number($('fullPrice').value)||0);document.querySelectorAll('.brand-row').forEach(row=>{let b=data.settings.brands.find(x=>x.id===row.dataset.id);if(b){b.name=row.querySelector('.bn').value.trim()||b.name;b.price=Math.max(0,Number(row.querySelector('.bp').value)||0)}});data.settings.activeBrand=$('activeBrand').value; $('settingsDialog').close();save();};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
$('historyBtn').onclick=()=>{let month=data.records.filter(r=>r.datetime.startsWith(today().slice(0,7))),year=data.records.filter(r=>r.datetime.startsWith(today().slice(0,4)));$('reportCards').innerHTML=`<div class="report"><small>THIS MONTH</small><b>${rupee(total(month))}</b></div><div class="report"><small>THIS YEAR</small><b>${rupee(total(year))}</b></div>`;let sorted=[...data.records].sort((a,b)=>b.datetime.localeCompare(a.datetime));$('historyList').innerHTML=sorted.length?sorted.map(r=>{let name=r.kind==='cigarette'?(r.brandName||'Cigarette'):(r.teaSize==='half'?'Half chai':'Full chai');let date=new Date(r.datetime).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});return `<div class="record"><div><strong>${r.owner==='my'?'My':'Group'} · ${esc(name)}</strong><small>${date}</small></div><em>${rupee(r.cost)}</em></div>`}).join(''):'<div class="empty">No entries yet.</div>';$('historyDialog').showModal()};
$('exportBtn').onclick=()=>{let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`chai-cigarettes-backup-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$('importFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let x=JSON.parse(await f.text());if(!Array.isArray(x.records)||!x.settings)throw 0;if(!confirm('Replace current records with this backup? Export your current data first if needed.'))return;data={...fresh(),...x,version:2,settings:{...fresh().settings,...x.settings}};save();alert('Backup restored.')}catch(err){alert('Invalid backup file.')}e.target.value=''};
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
const KEY = 'chaiCigarettesData_v1';
const $ = id => document.getElementById(id);
const money = n => '₹' + (Number(n)||0).toFixed(2);
const todayISO = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const localDateTime = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
const defaultData = () => ({version:1,settings:{halfTea:5,fullTea:10,brands:[{id:'default',name:'Default cigarette',price:18}],packetSize:10,packetPrice:180},records:[],packetNotes:[]});
let data = loadData(), currentTea = 'half', entryContext = null;
function loadData(){try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&v.version===1&&Array.isArray(v.records))return {...defaultData(),...v,settings:{...defaultData().settings,...v.settings}};}catch(e){}return defaultData();}
function persist(){localStorage.setItem(KEY,JSON.stringify(data));render();}
function dateOf(r){return r.datetime.slice(0,10)}
function sum(list,fn){return list.reduce((a,x)=>a+fn(x),0)}
function recordCost(r){return Number(r.cost)||0}
function chaiUnits(r){return r.kind==='tea'?(r.teaSize==='half'?0.5:1)*r.qty:0}
function render(){
 const t=todayISO(), month=t.slice(0,7), todays=data.records.filter(r=>dateOf(r)===t), monthly=data.records.filter(r=>dateOf(r).startsWith(month));
 const my=todays.filter(r=>r.owner==='my'), group=todays.filter(r=>r.owner==='group');
 $('todayLabel').textContent=new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
 $('todayTotal').textContent=money(sum(todays,recordCost));$('monthTotal').textContent=money(sum(monthly,recordCost));
 $('mySpend').textContent=money(sum(my,recordCost));$('groupSpend').textContent=money(sum(group,recordCost));
 $('myCigs').textContent=sum(my.filter(r=>r.kind==='cigarette'),r=>r.qty);
 $('groupCigs').textContent=sum(group.filter(r=>r.kind==='cigarette'),r=>r.qty);
 $('myTea').textContent=sum(my.filter(r=>r.kind==='tea'),chaiUnits).toFixed(1).replace(/\.0$/,'');
 $('groupTea').textContent=sum(group.filter(r=>r.kind==='tea'),chaiUnits).toFixed(1).replace(/\.0$/,'');
 const recent=[...data.records].sort((a,b)=>b.datetime.localeCompare(a.datetime)).slice(0,5);
 $('recentList').innerHTML=recent.length?recent.map(recordHTML).join(''):'<div class="empty">No records yet. Add your first entry above.</div>';
}
function recordHTML(r){const when=new Date(r.datetime).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});let title=r.kind==='tea'?`${r.teaSize==='half'?'Half chai':'Full chai'} × ${r.qty}`:`${r.brandName||'Cigarette'} × ${r.qty}`;return `<div class="record"><div class="record-main"><span class="record-title">${r.owner==='my'?'My':'Group'} · ${title}</span><span class="record-meta">${when}${r.note?' · '+escapeHTML(r.note):''}</span></div><span class="record-cost">${money(r.cost)}</span></div>`}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function openEntry(kind,owner){
 entryContext={kind,owner};$('entryKind').value=kind;$('entryOwner').value=owner;$('entryQty').value=1;$('entryDate').value=localDateTime();$('entryNote').value='';
 $('entryEyebrow').textContent=owner==='my'?'MY COUNT':'GROUP COUNT';$('entryTitle').textContent=kind==='tea'?'Record chai':'Record cigarette';
 $('teaOptions').classList.toggle('hidden',kind!=='tea');$('cigOptions').classList.toggle('hidden',kind!=='cigarette');
 if(kind==='tea'){currentTea='half';document.querySelectorAll('[data-tea]').forEach(b=>b.classList.toggle('selected',b.dataset.tea==='half'));}
 populateBrands();updateEstimate();$('entryDialog').showModal();
}
function populateBrands(){const sel=$('brandSelect');sel.innerHTML=data.settings.brands.map(b=>`<option value="${escapeHTML(b.id)}">${escapeHTML(b.name)} — ${money(b.price)}</option>`).join('');}
function unitCost(){if(entryContext?.kind==='tea')return currentTea==='half'?Number(data.settings.halfTea):Number(data.settings.fullTea);const b=data.settings.brands.find(x=>x.id===$('brandSelect').value)||data.settings.brands[0];return Number(b?.price)||0;}
function updateEstimate(){if(!entryContext)return;const qty=Math.max(1,Number($('entryQty').value)||1);$('entryEstimate').textContent='Estimated expense: '+money(unitCost()*qty);$('cigPriceHint').textContent='Current price per cigarette: '+money(unitCost());}
document.querySelectorAll('.quick-btn').forEach(b=>b.addEventListener('click',()=>openEntry(b.dataset.kind,b.dataset.owner)));
document.querySelectorAll('[data-tea]').forEach(b=>b.addEventListener('click',()=>{currentTea=b.dataset.tea;document.querySelectorAll('[data-tea]').forEach(x=>x.classList.toggle('selected',x===b));updateEstimate()}));
$('entryQty').addEventListener('input',updateEstimate);$('brandSelect').addEventListener('change',updateEstimate);
$('comboBtn').addEventListener('click',()=>{ // Sequential pair entry, saved as two linked records
 openEntry('cigarette','my'); $('entryNote').value='Chai + cigarette'; entryContext.combo=true;
});
$('entryForm').addEventListener('submit',e=>{
 if(e.submitter?.value==='cancel')return;
 e.preventDefault();if(!entryContext)return;
 const kind=entryContext.kind,owner=entryContext.owner,qty=Math.max(1,Math.floor(Number($('entryQty').value)||1)),datetime=$('entryDate').value||localDateTime(),note=$('entryNote').value.trim();
 const brand=data.settings.brands.find(x=>x.id===$('brandSelect').value);
 const r={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),kind,owner,qty,datetime,note,cost:unitCost()*qty,unitPrice:unitCost(),teaSize:kind==='tea'?currentTea:null,brandId:kind==='cigarette'?brand?.id:null,brandName:kind==='cigarette'?brand?.name:null};
 data.records.push(r);
 const combo=entryContext.combo;entryContext=null;$('entryDialog').close();persist();
 if(combo){openEntry('tea','my');$('entryNote').value='Chai + cigarette';}
});
$('settingsBtn').addEventListener('click',openSettings);$('settingsNav').addEventListener('click',openSettings);
function openSettings(){ $('halfPrice').value=data.settings.halfTea;$('fullPrice').value=data.settings.fullTea;$('packetSize').value=data.settings.packetSize;$('packetPrice').value=data.settings.packetPrice;renderBrands();$('settingsDialog').showModal();}
function renderBrands(){$('brandList').innerHTML=data.settings.brands.map(b=>`<div class="brand-row" data-id="${escapeHTML(b.id)}"><input class="brand-name" value="${escapeHTML(b.name)}" aria-label="Brand name"><input class="brand-price" type="number" min="0" step=".01" value="${b.price}" aria-label="Price"><button type="button" class="delete-brand" title="Delete">×</button></div>`).join('');document.querySelectorAll('.delete-brand').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.closest('.brand-row').dataset.id;if(data.settings.brands.length>1){data.settings.brands=data.settings.brands.filter(b=>b.id!==id);renderBrands();}}));}
$('addBrand').addEventListener('click',()=>{const name=$('newBrandName').value.trim(),price=Number($('newBrandPrice').value);if(!name||!Number.isFinite(price)||price<0)return alert('Enter a brand name and valid price.');data.settings.brands.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name,price});$('newBrandName').value='';$('newBrandPrice').value='';renderBrands();});
$('savePacket').addEventListener('click',()=>{data.settings.packetSize=Math.max(1,Number($('packetSize').value)||10);data.settings.packetPrice=Math.max(0,Number($('packetPrice').value)||0);alert('Packet details saved. Packet purchase does not add to expenses.');});
$('settingsForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();data.settings.halfTea=Math.max(0,Number($('halfPrice').value)||0);data.settings.fullTea=Math.max(0,Number($('fullPrice').value)||0);document.querySelectorAll('.brand-row').forEach(row=>{const b=data.settings.brands.find(x=>x.id===row.dataset.id);if(b){b.name=row.querySelector('.brand-name').value.trim()||b.name;b.price=Math.max(0,Number(row.querySelector('.brand-price').value)||0)}});$('settingsDialog').close();persist();});
$('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});download(blob,`chai-cigarettes-backup-${todayISO()}.json`)});
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$('importFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const v=JSON.parse(await f.text());if(v.version!==1||!Array.isArray(v.records)||!v.settings)throw Error();if(!confirm('Restore this backup? Current app data will be replaced. Export a backup first if you need it.'))return;data=v;persist();alert('Backup restored successfully.');}catch(err){alert('This backup file is not valid for Chai & Cigarettes.')}e.target.value='';});
function openList(title,records,eyebrow='RECORDS'){$('listTitle').textContent=title;$('listEyebrow').textContent=eyebrow;const sorted=[...records].sort((a,b)=>b.datetime.localeCompare(a.datetime));$('listContent').innerHTML=sorted.length?sorted.map(recordHTML).join(''):'<div class="empty">No records found.</div>';$('listDialog').showModal();}
$('viewAll').addEventListener('click',()=>openList('All history',data.records,'HISTORY'));
$('historyNav').addEventListener('click',()=>openList('All history',data.records,'HISTORY'));
$('reportsNav').addEventListener('click',()=>{const now=todayISO(),m=now.slice(0,7),y=now.slice(0,4),month=data.records.filter(r=>dateOf(r).startsWith(m)),year=data.records.filter(r=>dateOf(r).startsWith(y));const report=[{label:'THIS MONTH',records:month},{label:'THIS YEAR',records:year}];$('listTitle').textContent='Spending reports';$('listEyebrow').textContent='SUMMARY';$('listContent').innerHTML=report.map(x=>`<div class="record"><div class="record-main"><span class="record-title">${x.label}</span><span class="record-meta">${x.records.length} entries · My ${money(sum(x.records.filter(r=>r.owner==='my'),recordCost))} · Group ${money(sum(x.records.filter(r=>r.owner==='group'),recordCost))}</span></div><span class="record-cost">${money(sum(x.records,recordCost))}</span></div>`).join('');$('listDialog').showModal();});
$('closeList').addEventListener('click',()=>$('listDialog').close());
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();

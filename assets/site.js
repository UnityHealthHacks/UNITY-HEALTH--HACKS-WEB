(() => {
'use strict';
const isOfficial94Test=location.hostname==='unityhealthhacks.github.io'&&location.pathname.toLowerCase().includes('/unity-health-hacks-9-4-test/');
if(isOfficial94Test){
 const message='9.4 OFFICIAL TEST SITE — NOT LIVE. PHYSICAL MOBILE TESTING IS STILL REQUIRED.';
 const existing=document.querySelector('.prototype-banner');
 if(existing)existing.textContent=message;
 else{
  const banner=document.createElement('div');banner.className='prototype-banner';banner.textContent=message;
  const header=document.querySelector('.site-header');header?.insertAdjacentElement('afterend',banner);
 }
}
const $=id=>document.getElementById(id);
const safeGet=(k,d='')=>{try{return localStorage.getItem(k)??d}catch{return d}};
const safeSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};
const safeRemove=k=>{try{localStorage.removeItem(k)}catch{}};
const menuBtn=$('menuBtn'), navLinks=$('navLinks');
if(menuBtn&&navLinks){
 const close=()=>{navLinks.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.setAttribute('aria-label','Open navigation')};
 menuBtn.addEventListener('click',()=>{const open=navLinks.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
 navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 document.addEventListener('click',e=>{if(navLinks.classList.contains('open')&&!navLinks.contains(e.target)&&e.target!==menuBtn)close()});
}
document.querySelectorAll('nav a').forEach(a=>{const current=location.pathname.split('/').pop()||'index.html';if(a.getAttribute('href')===current)a.setAttribute('aria-current','page')});
const greeting=$('greeting'), nameInput=$('memberName');
function setGreeting(name=''){if(!greeting)return;const h=new Date().getHours(),p=h<12?'Good morning':h<18?'Good afternoon':'Good evening';greeting.textContent=name?`${p}, ${name}. Welcome to Unity Health Hacks.`:`${p}. Welcome to Unity Health Hacks.`}
const savedName=safeGet('uhhName'); if(nameInput)nameInput.value=savedName; setGreeting(savedName);
const saveName=$('saveName'); if(saveName&&nameInput)saveName.addEventListener('click',()=>{const n=nameInput.value.trim().slice(0,40);if(n){safeSet('uhhName',n);setGreeting(n)}});
const foodForm=$('foodForm');
if(foodForm){foodForm.addEventListener('submit',e=>{
 e.preventDefault(); const v=id=>$(id); const name=v('foodName').value.trim().slice(0,120); const num=id=>Math.max(0,Number(v(id)?.value||0));
 const sodium=num('sodium'),sugar=num('sugar'),protein=num('protein'),fat=num('fat'),fiber=num('fiber'),calories=num('calories'); const ing=(v('ingredients')?.value||'').toLowerCase();
 const barcode=(v('barcodeValue')?.value||'').trim().slice(0,32); const lowerSodium=!!v('lowerSodium')?.checked; const digestive=!!v('digestive')?.checked;
 const notes=[]; notes.push(`${name||'This food'} was reviewed from the information entered.`); if(calories)notes.push(`Entered calories: ${calories} per stated serving.`);
 notes.push(sugar===0?'No added sugar was entered; confirm the label shows 0 g.':sugar<=5?'Added sugar is 5 g or less per entered serving; serving size still matters.':'Added sugar is above 5 g per entered serving; compare similar options.');
 notes.push(sodium>=600?'Entered sodium is high for one serving.':sodium>=300?'Entered sodium is moderate to high for one serving.':'Entered sodium is below 300 mg per serving.');
 notes.push(fiber>=5?'The entered serving provides a meaningful amount of fiber.':fiber>0?'The entered serving provides some fiber.':'No fiber was entered.'); if(protein>=10)notes.push('The entered serving provides at least 10 g of protein.'); if(fat>0)notes.push('Total fat does not show fat quality; review saturated fat and ingredients.');
 const terms=[['high fructose corn syrup','an added sweetener'],['maltodextrin','a starch-derived ingredient used for texture or bulk'],['partially hydrogenated','a phrase requiring careful review for trans fat'],['carrageenan','a thickener or stabilizer'],['guar gum','a thickener and soluble fiber'],['xanthan gum','a thickener or stabilizer'],['natural flavor','a broad flavoring category'],['sodium nitrite','a curing and preservation ingredient'],['monosodium glutamate','a flavor enhancer also called MSG'],['sucralose','a high-intensity sweetener'],['aspartame','a high-intensity sweetener']];
 terms.forEach(([t,d])=>{if(ing.includes(t))notes.push(`Ingredient note: ${t} is ${d}.`)}); if(lowerSodium&&sodium>=300)notes.push('Because you selected lower-sodium comparisons, compare similar products and verify the serving size.'); if(digestive)notes.push('Because you are tracking digestive comfort, record serving size, timing, and repeatable patterns rather than assuming one ingredient is the cause.'); if(barcode)notes.push(`Captured product code: ${barcode}. A live product database is not connected, so this code is not being used as verified product identity.`); if(!ing.trim())notes.push('Paste the full ingredient list for a more useful explanation.'); notes.push('This is educational information, not a diagnosis or treatment recommendation.');
 const result=$('foodResult'); result.replaceChildren(); const h=document.createElement('h3');h.textContent='Plain-language review'; const ul=document.createElement('ul'); notes.forEach(n=>{const li=document.createElement('li');li.textContent=n;ul.appendChild(li)}); result.append(h,ul); result.hidden=false; result.scrollIntoView({behavior:'smooth',block:'nearest'});
})}
function completed(){try{const v=JSON.parse(safeGet('uhhCompletedDays','[]'));return Array.isArray(v)?v.filter(n=>Number.isInteger(n)&&n>=1&&n<=30):[]}catch{return []}}
function saveCompleted(a){safeSet('uhhCompletedDays',JSON.stringify([...new Set(a)].sort((x,y)=>x-y)))}
document.querySelectorAll('[data-day-complete]').forEach(btn=>{const d=Number(btn.dataset.dayComplete);if(completed().includes(d))btn.textContent=`Day ${d} completed ✓`;btn.addEventListener('click',()=>{const a=completed();if(!a.includes(d))a.push(d);saveCompleted(a);btn.textContent=`Day ${d} completed ✓`})});
const grid=$('progressGrid'); if(grid){const render=()=>{const a=completed();grid.replaceChildren();for(let d=1;d<=30;d++){const b=document.createElement('button');b.type='button';b.className='day-toggle'+(a.includes(d)?' complete':'');b.textContent=`Day ${d}${a.includes(d)?' ✓':''}`;b.addEventListener('click',()=>{const x=completed();const i=x.indexOf(d);i>=0?x.splice(i,1):x.push(d);saveCompleted(x);render()});grid.appendChild(b)}$('progressCount').textContent=`${a.length} of 30 days complete`;$('progressFill').style.width=`${a.length/30*100}%`};render();$('resetProgress')?.addEventListener('click',()=>{if(confirm('Reset the local 30-day completion tracker?')){safeRemove('uhhCompletedDays');render()}})}
if('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));

// Master 8.03 local development features
const profileTone=$('accountabilityTone');
if(profileTone) profileTone.value=safeGet('uhhTone','balanced');
const pacePreference=$('pacePreference');
if(pacePreference) pacePreference.value=safeGet('uhhPace','steady');
const saveProfile=$('saveProfile');
if(saveProfile&&nameInput){
 saveProfile.addEventListener('click',()=>{
  const n=nameInput.value.trim().slice(0,40);
  const tone=profileTone?.value||'balanced';
  if(n) safeSet('uhhName',n);
  safeSet('uhhTone',tone);
  if(pacePreference) safeSet('uhhPace',pacePreference.value||'steady');
  setGreeting(n);
  const m=$('profileMessage'); if(m)m.textContent='Saved locally on this device.';
  renderPatternPrompt();
 });
}
const todayKey=()=>{const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
document.querySelectorAll('[data-daily-check]').forEach(c=>{
 const saved=safeGet('uhhDaily:'+todayKey(),'').split(',');
 c.checked=saved.includes(c.dataset.dailyCheck);
});
const saveDaily=$('saveDailyCheck');
if(saveDaily)saveDaily.addEventListener('click',()=>{
 const chosen=[...document.querySelectorAll('[data-daily-check]:checked')].map(c=>c.dataset.dailyCheck);
 safeSet('uhhDaily:'+todayKey(),chosen.join(','));
 const m=$('dailyMessage');if(m)m.textContent=chosen.length?`${chosen.length} reflection item${chosen.length===1?'':'s'} saved for today.`:'Today’s reflection was saved with no boxes selected.';
});
function getJournal(){try{const v=JSON.parse(safeGet('uhhJournal','[]'));return Array.isArray(v)?v:[]}catch{return[]}}
function saveJournalData(a){safeSet('uhhJournal',JSON.stringify(a.slice(0,100)))}
function renderJournal(){
 const box=$('journalList');if(!box)return;box.replaceChildren();
 const items=getJournal();
 if(!items.length){const p=document.createElement('p');p.className='small';p.textContent='No local notes yet.';box.appendChild(p);return}
 items.forEach(item=>{
  const art=document.createElement('article');art.className='journal-entry';
  const t=document.createElement('time');t.textContent=new Date(item.created).toLocaleString();
  const p=document.createElement('p');p.textContent=item.text;
  const b=document.createElement('button');b.type='button';b.textContent='Delete';b.addEventListener('click',()=>{saveJournalData(getJournal().filter(x=>x.id!==item.id));renderJournal();renderPatternPrompt()});
  art.append(t,p,b);box.appendChild(art);
 });
}
const saveJournal=$('saveJournal');
if(saveJournal)saveJournal.addEventListener('click',()=>{
 const input=$('journalText');const text=input?.value.trim().slice(0,1200);if(!text)return;
 const items=getJournal();items.unshift({id:Date.now(),created:new Date().toISOString(),text});saveJournalData(items);input.value='';renderJournal();renderPatternPrompt();
});
function renderPatternPrompt(){
 const box=$('patternPrompt');if(!box)return;
 const n=safeGet('uhhName','there');const tone=safeGet('uhhTone','balanced');const last=getJournal()[0]?.text||'';
 let lead=tone==='gentle'?'No judgment—':tone==='direct'?'Let’s be honest about the pattern—':'Let’s look at the pattern together—';
 if(last.toLowerCase().includes('ice cream')) box.textContent=`${n}, ${lead.toLowerCase()}you mentioned ice cream in your recent note. Is that choice supporting the goal you set, and what realistic alternative could you try next?`;
 else if(last) box.textContent=`${n}, ${lead.toLowerCase()}your latest note says: “${last.slice(0,150)}${last.length>150?'…':''}” What did you learn, and what is one practical next step?`;
 else box.textContent=`${n}, save a reflection and this local demonstration will create a respectful follow-up question.`;
}
renderJournal();renderPatternPrompt();

function getPosts(){try{const v=JSON.parse(safeGet('uhhCommunityPosts','[]'));return Array.isArray(v)?v:[]}catch{return[]}}
function savePosts(a){safeSet('uhhCommunityPosts',JSON.stringify(a.slice(0,50)))}
function renderPosts(){
 const box=$('communityPosts');if(!box)return;box.replaceChildren();
 const posts=getPosts();
 if(!posts.length){const p=document.createElement('p');p.className='small';p.textContent='No local test posts yet.';box.appendChild(p);return}
 posts.forEach(post=>{
  const art=document.createElement('article');art.className='community-post';
  const tag=document.createElement('span');tag.className='tag';tag.textContent=post.category;
  const h=document.createElement('h3');h.textContent=post.name;
  const p=document.createElement('p');p.textContent=post.text;
  const s=document.createElement('small');s.textContent=new Date(post.created).toLocaleString()+' · Personal experience, not medical advice.';
  const b=document.createElement('button');b.type='button';b.textContent='Delete local post';b.addEventListener('click',()=>{savePosts(getPosts().filter(x=>x.id!==post.id));renderPosts()});
  art.append(tag,h,p,s,b);box.appendChild(art);
 });
}
const saveCommunity=$('saveCommunityPost');
if(saveCommunity)saveCommunity.addEventListener('click',()=>{
 const name=$('communityName')?.value.trim().slice(0,50)||'Community member';
 const category=$('communityCategory')?.value||'Community';
 const text=$('communityText')?.value.trim().slice(0,1500);if(!text)return;
 const posts=getPosts();posts.unshift({id:Date.now(),name,category,text,created:new Date().toISOString()});savePosts(posts);$('communityText').value='';renderPosts();
});
renderPosts();


})();

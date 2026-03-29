'use strict';
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   LOCAL STATE (in-memory + Firebase sync)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
let STATE = {
  version: 2,
  progress: {},   // { 'track:topic': true }
  notes: {},      // { 'track:topic': 'note text' }
  bookmarks: {},  // { 'track:topic': true }
  streak: 0,
  lastActive: null,
  lastVisited: null,
  weeklyGoal: 10,
  weekDone: 0,
  xp: 0,
  genHistory: [],
  apiKey: '',
  aiUsage: { calls: 0, tokens: 0 },
  heatmap: {},    // { 'YYYY-MM-DD': count }
};
let _currentUser = null;
let _saveTimer = null;
let _isDirty = false;
let _lastUndo = null;
let _toggleLocks = {};
const APP_LOG_PREFIX='[DevRoadmap]';

function logInfo(message, extra){
  if(typeof extra==='undefined') console.info(APP_LOG_PREFIX, message);
  else console.info(APP_LOG_PREFIX, message, extra);
}

function logWarn(message, extra){
  if(typeof extra==='undefined') console.warn(APP_LOG_PREFIX, message);
  else console.warn(APP_LOG_PREFIX, message, extra);
}

function logError(message, extra){
  if(typeof extra==='undefined') console.error(APP_LOG_PREFIX, message);
  else console.error(APP_LOG_PREFIX, message, extra);
}

function persistLocalSnapshot(){
  try{
    localStorage.setItem('devroadmap-local-state', JSON.stringify(STATE));
  }catch(error){
    logError('Failed to persist local snapshot', error);
    throw error;
  }
}

function sanitizeObjectMap(value){
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function sanitizeLoadedState(nextState){
  const safe = { ...STATE, ...(nextState || {}) };
  safe.version = 2;
  safe.progress = sanitizeObjectMap(safe.progress);
  safe.notes = sanitizeObjectMap(safe.notes);
  safe.bookmarks = sanitizeObjectMap(safe.bookmarks);
  safe.heatmap = sanitizeObjectMap(safe.heatmap);
  safe.aiUsage = safe.aiUsage && typeof safe.aiUsage === 'object' ? safe.aiUsage : { calls: 0, tokens: 0 };
  safe.aiUsage.calls = Number.isFinite(+safe.aiUsage.calls) ? +safe.aiUsage.calls : 0;
  safe.aiUsage.tokens = Number.isFinite(+safe.aiUsage.tokens) ? +safe.aiUsage.tokens : 0;
  safe.genHistory = Array.isArray(safe.genHistory) ? safe.genHistory.slice(0, 10) : [];
  safe.weeklyGoal = Number.isFinite(+safe.weeklyGoal) && +safe.weeklyGoal > 0 ? parseInt(safe.weeklyGoal, 10) : 10;
  safe.weekDone = Number.isFinite(+safe.weekDone) && +safe.weekDone >= 0 ? parseInt(safe.weekDone, 10) : 0;
  safe.xp = Number.isFinite(+safe.xp) && +safe.xp >= 0 ? parseInt(safe.xp, 10) : 0;
  safe.streak = Number.isFinite(+safe.streak) && +safe.streak >= 0 ? parseInt(safe.streak, 10) : 0;
  if(!safe.lastVisited || typeof safe.lastVisited !== 'object'){
    safe.lastVisited = null;
  }
  return safe;
}

function ensureAIState(){
  if(window.AIProviderKit){
    window.AIProviderKit.normalizeState(STATE);
  }
}

function getActiveProvider(){
  ensureAIState();
  return window.AIProviderKit ? window.AIProviderKit.getActiveProvider(STATE) : { id: 'anthropic', name: 'Anthropic' };
}

function getActiveProviderConfig(){
  ensureAIState();
  return window.AIProviderKit ? window.AIProviderKit.getActiveConfig(STATE) : { apiKey: STATE.apiKey, model: 'claude-sonnet-4-20250514' };
}

/* â”€â”€ FIREBASE BRIDGE â”€â”€ */
window._handleSignIn = async (user) => {
  _currentUser = user;
  document.getElementById('authOverlay').classList.add('hidden');
  setTimeout(() => { document.getElementById('authOverlay').style.display = 'none'; }, 500);
  updateUserUI(user);
  setSyncStatus('syncing', 'Syncingâ€¦');
  const data = await window._fbLoad(user.uid);
  if (data) {
    STATE = sanitizeLoadedState({ ...STATE, ...data });
    ensureAIState();
    enhanceTopicCards();
    applyProgress();
    renderSidebar();
    restoreGenHistory();
    updateGenKeyStatus();
  }
  ensureAIState();
  window._fbWatch(user.uid, (newData) => {
    if (newData) {
      STATE = sanitizeLoadedState({ ...STATE, ...newData });
      ensureAIState();
      enhanceTopicCards();
      applyProgress();
      renderSidebar();
      updateGenKeyStatus();
    }
  });
  setSyncStatus('ok', 'Synced');
  if (!getActiveProviderConfig().apiKey && getActiveProvider().id !== 'prompt') { setTimeout(() => { document.getElementById('apiSetupScreen').classList.add('show'); }, 800); }
  toast('Welcome back, ' + (user.displayName?.split(' ')[0] || 'friend') + '! â˜ï¸', 'âœ…');
};
window._handleSignOut = () => {
  _currentUser = null;
  document.getElementById('authOverlay').style.display='flex';
  document.getElementById('authOverlay').classList.remove('hidden');
  document.getElementById('userMenuWrap').style.display='none';
  setSyncStatus('off','Local');
};
window._demoMode = () => {
  try{
    const saved=localStorage.getItem('devroadmap-local-state');
    if(saved){ STATE = sanitizeLoadedState(JSON.parse(saved)); }
  }catch(error){
    logWarn('Failed to restore local demo state', error);
  }
  document.getElementById('authOverlay').classList.add('hidden');
  setTimeout(()=>{ document.getElementById('authOverlay').style.display='none'; },500);
  setSyncStatus('off','Demo');
  ensureAIState();
  applyProgress();
  renderSidebar();
  restoreGenHistory();
  updateGenKeyStatus();
  toast('Demo mode â€” progress not saved across devices','â„¹ï¸');
};

function scheduleSave(){
  _isDirty=true;
  clearTimeout(_saveTimer);
  _saveTimer=setTimeout(async()=>{
    if(!_isDirty) return;
    try{
      persistLocalSnapshot();
      if(!_currentUser){ _isDirty=false; return; }
      setSyncStatus('syncing','Syncingâ€¦');
      await window._fbSave(_currentUser.uid, STATE);
      setSyncStatus('ok','Synced');
      _isDirty=false;
    }catch(error){
      logError('Scheduled save failed', error);
      setSyncStatus('off','Local');
      toast('Sync failed. Your local changes are still kept.','âš ï¸');
    }
  },1200);
}
window.forceSyncNow=()=>{
  try{
    persistLocalSnapshot();
  }catch(error){
    toast('Local save failed. Check browser storage.','âš ï¸');
    return;
  }
  if(!_currentUser){ toast('Saved locally. Sign in to sync across devices.','â„¹ï¸'); return; }
  setSyncStatus('syncing','Syncingâ€¦');
  window._fbSave(_currentUser.uid, STATE)
    .then(()=>{ setSyncStatus('ok','Synced'); toast('Synced!','â˜ï¸'); _isDirty=false; })
    .catch((error)=>{ logError('Force sync failed', error); setSyncStatus('off','Local'); toast('Sync failed. Try again in a moment.','âš ï¸'); });
};

/* â”€â”€ AUTH UI â”€â”€ */
function updateUserUI(user){
  const wrap=document.getElementById('userMenuWrap');
  wrap.style.display='flex';
  const av=document.getElementById('userAvatar');
  if(user.photoURL){ av.innerHTML=`<img src="${user.photoURL}" alt="">`; }
  else{ av.textContent=(user.displayName||user.email||'U')[0].toUpperCase(); }
  document.getElementById('umName').textContent=user.displayName||'User';
  document.getElementById('umEmail').textContent=user.email||'';
}
function toggleUserMenu(){ document.getElementById('userMenu').classList.toggle('open'); }
function closeUserMenu(){ document.getElementById('userMenu').classList.remove('open'); }
document.addEventListener('click',e=>{ if(!e.target.closest('.user-menu-wrap')) closeUserMenu(); });

function setSyncStatus(state,label){
  const p=document.getElementById('syncPill');
  const l=document.getElementById('syncLabel');
  p.className='sync-dot-wrap '+(state==='ok'?'sync-ok':state==='syncing'?'sync-ing':'sync-off');
  l.textContent=label;
  if(state==='syncing'){ const d=p.querySelector('.sync-dot'); if(d){ d.style.animation='pulse 1s infinite'; } }
}

/* â”€â”€ API KEY â”€â”€ */
function switchAKTab(){ /* deprecated UI */ }
function toggleAKVis(){
  const input=document.getElementById('providerKeyInput');
  if(input){ input.type=input.type==='password'?'text':'password'; }
}
function validateAKInput(){ /* validation is provider-specific now */ }
function renderAIProviderUI(){
  ensureAIState();
  const setupCard=document.querySelector('#apiSetupScreen .api-setup-card');
  const generatorMount=document.getElementById('generatorProviderMount');
  if(setupCard && window.AIProviderKit){
    window.AIProviderKit.renderSetupScreen(setupCard, STATE);
  }
  if(generatorMount && window.AIProviderKit){
    window.AIProviderKit.renderGeneratorPanel(generatorMount, STATE);
  }
}
function switchAIProvider(providerId, fromGenerator){
  ensureAIState();
  STATE.ai.activeProvider=providerId;
  if(fromGenerator){
    const providerSelect=document.getElementById('providerSelect');
    if(providerSelect) providerSelect.value=providerId;
  }
  renderAIProviderUI();
  updateGenKeyStatus();
}
function updateActiveKey(value){
  ensureAIState();
  const provider=getActiveProvider();
  STATE.ai.providers[provider.id].apiKey=value.trim();
  if(provider.id==='anthropic'){
    STATE.apiKey=STATE.ai.providers.anthropic.apiKey;
  }
}
function updateActiveModel(value, fromGenerator){
  ensureAIState();
  const provider=getActiveProvider();
  STATE.ai.providers[provider.id].model=value.trim();
  if(fromGenerator){
    const providerModelInput=document.getElementById('providerModelInput');
    if(providerModelInput) providerModelInput.value=value;
  }
}
function saveApiKey(){
  ensureAIState();
  const provider=getActiveProvider();
  const config=getActiveProviderConfig();
  if(provider.id!=='prompt' && !config.apiKey){
    toast('Add your ' + provider.name + ' API key or switch to Prompt Mode.','âš ï¸');
    return;
  }
  STATE.apiKey=STATE.ai.providers.anthropic.apiKey||'';
  scheduleSave();
  document.getElementById('apiSetupScreen').classList.remove('show');
  updateGenKeyStatus();
  toast(provider.id==='prompt'?'Prompt Mode enabled':'Provider settings saved','âœ…');
}
function skipApiKey(){
  document.getElementById('apiSetupScreen').classList.remove('show');
  updateGenKeyStatus();
}
function openApiSetup(){
  renderAIProviderUI();
  document.getElementById('apiSetupScreen').classList.add('show');
}
function updateGenKeyStatus(){
  const el=document.getElementById('genKeyStatus');
  if(!el) return;
  const provider=getActiveProvider();
  const config=getActiveProviderConfig();
  if(provider.id==='prompt'){
    el.innerHTML='Prompt Mode is active. You can generate a copy-paste prompt for free, or <span style="text-decoration:underline;cursor:pointer" onclick="openApiSetup()">connect an API provider</span> for in-app generation.';
    el.style.color='var(--learn)';
    return;
  }
  if(config.apiKey){
    el.textContent='âœ“ ' + provider.name + ' configured â€” ready to generate!';
    el.style.color='var(--done)';
  }else{
    el.innerHTML='No key set for ' + provider.name + '. <span style="text-decoration:underline;cursor:pointer" onclick="openApiSetup()">Configure provider</span> or switch to Prompt Mode.';
    el.style.color='var(--learn)';
  }
}

function escapeAttr(value){
  return String(value).replace(/'/g, "\\'");
}

function rememberTopic(track, topic){
  STATE.lastVisited = { track, topic, ts: Date.now() };
}

function triggerImportBackup(){
  const input=document.getElementById('importBackupInput');
  if(input){
    input.value='';
    input.click();
  }
}

function exportBackup(){
  const blob=new Blob([JSON.stringify(sanitizeLoadedState(STATE), null, 2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`devroadmap-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Backup exported','ðŸ’¾');
}

async function importBackup(event){
  const file=event.target.files && event.target.files[0];
  if(!file) return;
  try{
    const text=await file.text();
    const parsed=sanitizeLoadedState(JSON.parse(text));
    STATE={ ...STATE, ...parsed };
    ensureAIState();
    enhanceTopicCards();
    applyProgress();
    buildSearchIndex();
    renderSidebar();
    restoreGenHistory();
    updateGenKeyStatus();
    scheduleSave();
    toast('Backup imported successfully','âœ…');
  }catch(error){
    logError('Backup import failed', error);
    toast('Import failed. Please choose a valid JSON backup.','âš ï¸');
  }
}

function confirmSignOut(){
  closeUserMenu();
  if(confirm('Sign out now? Your local progress will stay on this device, and synced progress remains in Firebase.')){
    window._fbSignOut();
  }
}

/* â”€â”€ PROGRESS TRACKING â”€â”€ */
function updateBookmarkButtons(){
  document.querySelectorAll('.topic-card[data-track]').forEach(card=>{
    const track=card.dataset.track;
    const topic=card.dataset.topic;
    const btn=card.querySelector('.bookmark-btn');
    const isBookmarked=!!STATE.bookmarks?.[`${track}:${topic}`];
    if(btn){
      btn.classList.toggle('is-bookmarked',isBookmarked);
      btn.textContent=isBookmarked?'★ Saved':'☆ Save';
    }
  });
}

function enhanceTopicCards(){
  document.querySelectorAll('.topic-card[data-track]').forEach(card=>{
    const track=card.dataset.track;
    const topic=card.dataset.topic;
    if(!track || !topic) return;
    if(!card.dataset.enhanced){
      card.dataset.enhanced='true';
      let footer=card.querySelector('.topic-card-footer');
      const markDone=card.querySelector('.mark-done-btn');
      const noteBtn=card.querySelector('.note-btn');
      const noteBox=card.querySelector('.note-box');
      if(!footer && markDone && noteBtn){
        footer=document.createElement('div');
        footer.className='topic-card-footer';
        card.insertBefore(footer, markDone);
        footer.appendChild(markDone);
        footer.appendChild(noteBtn);
        if(noteBox) card.appendChild(noteBox);
      }
      card.addEventListener('click',e=>{
        if(e.target.closest('a,button,textarea')) return;
        rememberTopic(track,topic);
        scheduleSave();
        renderSidebar();
      });
      footer=card.querySelector('.topic-card-footer');
      if(footer && !footer.querySelector('.bookmark-btn')){
        const bookmark=document.createElement('button');
        bookmark.className='bookmark-btn';
        bookmark.setAttribute('onclick',`toggleBookmark(this,'${escapeAttr(track)}','${escapeAttr(topic)}')`);
        footer.insertBefore(bookmark, footer.firstChild);
      }
    }
  });
  updateBookmarkButtons();
}

function toggleBookmark(btn, track, topic){
  if(!STATE.bookmarks) STATE.bookmarks={};
  const key=`${track}:${topic}`;
  if(STATE.bookmarks[key]) delete STATE.bookmarks[key];
  else STATE.bookmarks[key]=true;
  rememberTopic(track,topic);
  scheduleSave();
  updateBookmarkButtons();
  renderSidebar();
  toast(STATE.bookmarks[key]?'Saved to bookmarks':'Removed from bookmarks', STATE.bookmarks[key]?'â˜…':'â„¹ï¸');
}

function undoLastAction(){
  if(!_lastUndo) return;
  if(_lastUndo.type==='done'){
    const { track, topic } = _lastUndo;
    const key=`${track}:${topic}`;
    delete STATE.progress[key];
    STATE.xp=Math.max(0,(STATE.xp||0)-10);
  }
  if(_lastUndo.type==='undone'){
    const { track, topic } = _lastUndo;
    STATE.progress[`${track}:${topic}`]=true;
    awardXP(10);
  }
  _lastUndo=null;
  applyProgress();
  renderSidebar();
  scheduleSave();
  toast('Last action undone','â†©');
}

function showUndoToast(topic){
  const el=document.createElement('div');
  el.className='toast';
  el.innerHTML=`<span>âœ…</span><span>${topic} done.</span><button class="btn-secondary" style="padding:4px 10px;font-size:.7rem;margin-left:auto" onclick="undoLastAction(); this.closest('.toast').remove()">Undo</button>`;
  document.getElementById('toasts').appendChild(el);
  requestAnimationFrame(()=>{ requestAnimationFrame(()=>el.classList.add('show')); });
  setTimeout(()=>{ if(el.isConnected){ el.classList.remove('show'); setTimeout(()=>el.remove(),400); } },5000);
}

function toggleDone(btn, track, topic){
  const key=`${track}:${topic}`;
  const now=Date.now();
  if(_toggleLocks[key] && now-_toggleLocks[key] < 350) return;
  _toggleLocks[key]=now;
  const wasDone=STATE.progress[key];
  if(wasDone){ delete STATE.progress[key]; STATE.xp=Math.max(0,(STATE.xp||0)-10); }
  else{ STATE.progress[key]=true; awardXP(10); updateStreak(); updateHeatmap(); _lastUndo={ type:'done', track, topic, ts:now }; }
  if(wasDone){ _lastUndo={ type:'undone', track, topic, ts:now }; }
  rememberTopic(track,topic);
  const card=btn.closest('.topic-card');
  card.classList.toggle('done-card',!wasDone);
  btn.classList.toggle('is-done',!wasDone);
  btn.textContent=!wasDone?'âœ“ Done':'Mark done';
  scheduleSave();
  renderSidebar();
  if(!wasDone){ confettiBurst(); showUndoToast(topic); }
}
function applyProgress(){
  document.querySelectorAll('.topic-card[data-track]').forEach(card=>{
    const track=card.dataset.track, topic=card.dataset.topic;
    if(!track||!topic) return;
    const isDone=STATE.progress[`${track}:${topic}`];
    card.classList.toggle('done-card',!!isDone);
    const btn=card.querySelector('.mark-done-btn');
    if(btn){ btn.classList.toggle('is-done',!!isDone); btn.textContent=isDone?'âœ“ Done':'Mark done'; }
  });
  applyNotes();
  updateBookmarkButtons();
  renderPhaseProgress();
}

/* â”€â”€ XP & LEVELS â”€â”€ */
const LEVELS=[
  {name:'Beginner',min:0,max:100},{name:'Learner',min:100,max:300},{name:'Practitioner',min:300,max:600},
  {name:'Developer',min:600,max:1000},{name:'Engineer',min:1000,max:1500},{name:'Senior Dev',min:1500,max:2200},
  {name:'Tech Lead',min:2200,max:3000},{name:'Architect',min:3000,max:4000},{name:'Staff Engineer',min:4000,max:5500},
  {name:'FAANG Ready',min:5500,max:Infinity}
];
function getLevel(xp){ return LEVELS.findIndex((l,i)=>xp>=l.min&&(i===LEVELS.length-1||xp<LEVELS[i+1].min)); }
function awardXP(pts){ STATE.xp=(STATE.xp||0)+pts; }
function renderXP(){
  const xp=STATE.xp||0;
  const li=getLevel(xp);
  const lv=LEVELS[li];
  const lvNext=LEVELS[Math.min(li+1,LEVELS.length-1)];
  const pct=lv.max===Infinity?100:Math.round((xp-lv.min)/(lvNext.min-lv.min)*100);
  document.getElementById('levelBadge').textContent=li+1;
  document.getElementById('levelName').textContent=lv.name;
  document.getElementById('levelSub').textContent=lv.max===Infinity?'Max level!':`${lvNext.min-xp} XP to Level ${li+2}`;
  document.getElementById('xpBar').style.width=pct+'%';
  document.getElementById('hdrXP').textContent=xp;
  document.getElementById('hdrLevel').textContent=`Lv.${li+1}`;
  document.getElementById('statXP').textContent=xp;
}

/* â”€â”€ STREAK â”€â”€ */
function updateStreak(){
  const today=new Date().toISOString().slice(0,10);
  const last=STATE.lastActive;
  if(last===today){ return; }
  const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
  if(last===yesterday){ STATE.streak=(STATE.streak||0)+1; }
  else if(last&&last!==today){ STATE.streak=1; }
  else{ STATE.streak=(STATE.streak||0)+1; }
  STATE.lastActive=today;
  // Weekly done
  const weekStart=getWeekStart();
  if(!STATE.weekStart||STATE.weekStart!==weekStart){ STATE.weekDone=0; STATE.weekStart=weekStart; }
  STATE.weekDone=(STATE.weekDone||0)+1;
}
function getWeekStart(){ const d=new Date(); d.setDate(d.getDate()-d.getDay()); return d.toISOString().slice(0,10); }
function updateHeatmap(){
  const today=window.HeatmapUtils ? window.HeatmapUtils.todayKey() : new Date().toISOString().slice(0,10);
  STATE.heatmap=STATE.heatmap||{};
  STATE.heatmap[today]=(STATE.heatmap[today]||0)+1;
}

/* â”€â”€ SIDEBAR â”€â”€ */
let _totalTopicsCache=0;
function getFirstUndoneTopic(track){
  const selector=track ? `.topic-card[data-track="${track}"]` : '.topic-card[data-track]';
  const cards=[...document.querySelectorAll(selector)];
  return cards.find(card=>!STATE.progress[`${card.dataset.track}:${card.dataset.topic}`]) || null;
}

function renderNextTopicPanel(){
  const panel=document.getElementById('nextTopicPanel');
  if(!panel) return;
  const activeTrack=document.querySelector('.track.active')?.id;
  const next=getFirstUndoneTopic(activeTrack) || getFirstUndoneTopic();
  if(!next){
    panel.innerHTML='<div class="helper-empty">You cleared every currently loaded topic. Nice work.</div>';
    return;
  }
  panel.innerHTML=`
    <div class="helper-title">${next.dataset.topic}</div>
    <div class="helper-copy">Recommended next step from ${next.dataset.track.toUpperCase()} based on what is still incomplete.</div>
    <div class="helper-link" onclick="goToTopic('${next.dataset.track}','${escapeAttr(next.dataset.topic)}')">Open topic</div>
  `;
}

function renderResumePanel(){
  const panel=document.getElementById('resumePanel');
  if(!panel) return;
  const last=STATE.lastVisited;
  if(!last || !last.track || !last.topic){
    panel.innerHTML='<div class="helper-empty">Start any topic and this panel will help you jump back in later.</div>';
    return;
  }
  const meta=last.ts ? new Date(last.ts).toLocaleString() : 'Recently visited';
  panel.innerHTML=`
    <div class="helper-title">${last.topic}</div>
    <div class="helper-meta">${last.track.toUpperCase()} · ${meta}</div>
    <div class="helper-link" onclick="goToTopic('${last.track}','${escapeAttr(last.topic)}')">Resume</div>
  `;
}

function renderBookmarksPanel(){
  const panel=document.getElementById('bookmarksPanel');
  if(!panel) return;
  const entries=Object.keys(STATE.bookmarks||{}).slice(0,8);
  if(!entries.length){
    panel.innerHTML='<div class="helper-empty">Use the save button on any topic to pin it here for revision.</div>';
    return;
  }
  panel.innerHTML=entries.map(key=>{
    const [track,...rest]=key.split(':');
    const topic=rest.join(':');
    return `<div class="helper-item"><div class="helper-title">${topic}</div><div class="helper-meta">${track.toUpperCase()}</div><div class="helper-link" onclick="goToTopic('${track}','${escapeAttr(topic)}')">Open</div></div>`;
  }).join('');
}

function renderSidebar(){
  renderXP();
  // Overall stats
  const allKeys=Object.keys(STATE.progress);
  if(!_totalTopicsCache) _totalTopicsCache=document.querySelectorAll('.topic-card[data-topic]').length||1;
  const totalTopics=_totalTopicsCache;
  document.getElementById('statDone').textContent=allKeys.length;
  document.getElementById('statPct').textContent=Math.round(allKeys.length/totalTopics*100)+'%';
  document.getElementById('statStreak').textContent=(STATE.streak||0)+'ðŸ”¥';
  // Track progress
  const tracks=['dsa','webdev','ai'];
  const trackNames={'dsa':'ðŸŽ¯ DSA','webdev':'ðŸŒ Web Dev','ai':'ðŸ¤– AI / ML'};
  const list=document.getElementById('trackProgressList');
  list.innerHTML=tracks.map(t=>{
    const done=Object.keys(STATE.progress).filter(k=>k.startsWith(t+':')).length;
    const total=document.querySelectorAll(`.topic-card[data-track="${t}"]`).length||1;
    const pct=Math.round(done/total*100);
    return `<div class="track-prog"><div class="tp-row"><span class="tp-name">${trackNames[t]}</span><span class="tp-pct">${pct}%</span></div><div class="tp-bar"><div class="tp-fill" style="width:${pct}%"></div></div></div>`;
  }).join('');
  // Weekly goal
  const wg=STATE.weeklyGoal||10;
  const wd=STATE.weekDone||0;
  document.getElementById('goalDone').textContent=Math.min(wd,wg);
  document.getElementById('goalOf').textContent='/ '+wg;
  document.getElementById('goalSub').textContent=`${Math.min(wd,wg)} of ${wg} topics`;
  const ring=document.getElementById('goalRing');
  const pct2=Math.min(wd/wg,1);
  const circ=175.9;
  ring.style.strokeDashoffset=circ-(circ*pct2);
  // Streak
  document.getElementById('streakNum').textContent=STATE.streak||0;
  document.getElementById('streakMsg').textContent=STATE.streak>0?`Last active ${STATE.lastActive||'today'}`:'Start today!';
  // Heatmap
  renderHeatmap();
  renderPhaseProgress();
  renderNextTopicPanel();
  renderResumePanel();
  renderBookmarksPanel();
}
function renderPhaseProgress(){
  document.querySelectorAll('.phase[data-track][data-phase]').forEach(ph=>{
    const track=ph.dataset.track, pi=ph.dataset.phase;
    const cards=ph.querySelectorAll('.topic-card[data-topic]');
    const done=[...cards].filter(c=>STATE.progress[`${track}:${c.dataset.topic}`]).length;
    const pct=cards.length?Math.round(done/cards.length*100):0;
    const fill=document.getElementById(`pp-${track}-${pi}`);
    const pctEl=document.getElementById(`ppt-${track}-${pi}`);
    if(fill){ fill.style.width=pct+'%'; }
    if(pctEl){ pctEl.textContent=pct+'%'; }
  });
}
function renderHeatmap(){
  const hmap=document.getElementById('hmap');
  if(!hmap) return;
  if(window.HeatmapUtils){
    window.HeatmapUtils.render(hmap, STATE.heatmap || {});
  }
}

/* â”€â”€ WEEKLY GOAL EDIT â”€â”€ */
function editWeeklyGoal(){
  const v=prompt('Set weekly goal (topics to complete per week):',STATE.weeklyGoal||10);
  if(v&&!isNaN(v)&&parseInt(v)>0){ STATE.weeklyGoal=parseInt(v); scheduleSave(); renderSidebar(); }
}

/* â”€â”€ TAB / PHASE TOGGLE â”€â”€ */
function switchTrack(id,el){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.track').forEach(t=>t.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  el.classList.add('active');
}
function togglePhase(hdr){
  const body=hdr.nextElementSibling;
  const ch=hdr.querySelector('.chevron');
  const isOpen=body.classList.contains('open');
  body.classList.toggle('open',!isOpen);
  ch.style.transform=isOpen?'':'rotate(180deg)';
}

/* â”€â”€ GLOBAL SEARCH â”€â”€ */
const SEARCH_INDEX=[];
function buildSearchIndex(){
  SEARCH_INDEX.length=0;
  document.querySelectorAll('.topic-card[data-topic]').forEach(c=>{
    const track=c.dataset.track, topic=c.dataset.topic;
    SEARCH_INDEX.push({label:topic,type:'topic',track,card:c,
      links:[...c.querySelectorAll('.link-pill')].map(l=>l.textContent.trim()).join(' ')});
  });
}
function openSearch(){ document.getElementById('gSearch').classList.add('open'); document.getElementById('gsInput').focus(); renderSearch(); }
function closeSearch(){ document.getElementById('gSearch').classList.remove('open'); }
function renderSearch(){
  const q=(document.getElementById('gsInput').value||'').toLowerCase();
  const res=document.getElementById('gsResults');
  if(!q){ res.innerHTML='<div style="padding:20px;text-align:center;color:var(--t4);font-size:.78rem">Type to search topics, resources, and certificatesâ€¦</div>'; return; }
  const matches=SEARCH_INDEX.filter(i=>i.label.toLowerCase().includes(q)||i.links.toLowerCase().includes(q)).slice(0,12);
  if(!matches.length){ res.innerHTML='<div style="padding:16px;text-align:center;color:var(--t4);font-size:.78rem">No results found</div>'; return; }
  res.innerHTML=matches.map(m=>`<div class="gs-item" onclick="goToTopic('${m.track}','${m.card.dataset.topic}');closeSearch()"><span>${m.label}</span><span class="gs-item-tag">${m.track.toUpperCase()}</span></div>`).join('');
}
function goToTopic(track,topic){
  const tabBtn=[...document.querySelectorAll('.tab')].find(t=>t.textContent.toLowerCase().includes(track.toLowerCase()));
  if(tabBtn) tabBtn.click();
  setTimeout(()=>{
    const card=document.querySelector(`.topic-card[data-track="${track}"][data-topic="${CSS.escape(topic)}"]`);
    if(card){
      const body=card.closest('.phase-body');
      const header=body?.previousElementSibling;
      body?.classList.add('open');
      if(header){ header.querySelector('.chevron')?.setAttribute('style','transform:rotate(180deg)'); }
      rememberTopic(track,topic);
      renderSidebar();
      card.scrollIntoView({behavior:'smooth',block:'center'});
      card.style.outline='2px solid var(--ai)';
      setTimeout(()=>card.style.outline='',2000);
    }
  },100);
}
// keyboard shortcuts handled in DOMContentLoaded

/* â”€â”€ USAGE MODAL â”€â”€ */
function openUsageModal(){
  const modal=document.getElementById('usageModal');
  const body=document.getElementById('usageBody');
  const usage=STATE.aiUsage||{calls:0,tokens:0};
  const provider=getActiveProvider();
  const config=getActiveProviderConfig();
  const hasKey=!!config.apiKey;
  const tierPill=document.getElementById('usageTierPill');
  tierPill.textContent=provider.id==='prompt'?'Prompt Mode':(hasKey?provider.name:'Free / Demo');
  tierPill.className='usage-tier-pill '+(hasKey?'tier-api':'tier-free');
  const freeTierLimit=500;
  const pct=Math.min(Math.round(usage.calls/freeTierLimit*100),100);
  body.innerHTML=`
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:6px"><span>Active provider</span><strong>${provider.name}</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:6px"><span>AI calls this session</span><strong>${usage.calls}</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:6px"><span>Estimated tokens used</span><strong>${(usage.tokens||0).toLocaleString()}</strong></div>
    </div>
    ${hasKey?`
    <div class="ak-usage-section">
      <div class="ak-usage-label">Usage estimate (${provider.name})</div>
      <div class="ak-usage-bar-wrap"><div class="ak-usage-bar" style="width:${pct}%"></div></div>
      <div class="ak-usage-text"><span>${usage.calls} calls</span><span>Local estimate only</span></div>
    </div>
    <p style="font-size:.72rem;color:var(--t3);margin-top:10px">Actual pricing depends on your provider, chosen model, and account plan.</p>
    `:`
    <div style="background:rgba(245,166,35,.07);border:1px solid rgba(245,166,35,.2);border-radius:10px;padding:12px;font-size:.8rem;color:var(--learn)">
      ${provider.id==='prompt'?'Prompt Mode is active. You can copy prompts into free web chat tools, or connect an API for in-app generation.':'No API key saved for the active provider yet.'}
      <br><button class="btn-primary" style="margin-top:8px;font-size:.75rem;padding:6px 14px" onclick="openApiSetup();document.getElementById('usageModal').classList.remove('open')">Configure AI â†’</button>
    </div>
    `}
    <button class="btn-secondary" style="margin-top:14px;width:100%" onclick="document.getElementById('usageModal').classList.remove('open')">Close</button>
  `;
  modal.classList.add('open');
}

/* â”€â”€ AI GENERATOR â”€â”€ */
const PHASE_COLORS=[
  {bg:'#E6F1FB',color:'#185FA5'},{bg:'#EAF3DE',color:'#3B6D11'},{bg:'#EEEDFE',color:'#3C3489'},
  {bg:'#FAECE7',color:'#993C1D'},{bg:'#FAEEDA',color:'#854F0B'},{bg:'#FBEAF0',color:'#72243E'},
  {bg:'#FCEBEB',color:'#A32D2D'},
];
function quickGen(t){ document.getElementById('topicInput').value=t; generateRoadmap(); }
function addToHistory(t){
  if((STATE.genHistory||[]).includes(t)) return;
  STATE.genHistory=([t,...(STATE.genHistory||[])]).slice(0,10);
  const sec=document.getElementById('historySection');
  sec.style.display='block';
  document.getElementById('historyChips').innerHTML=STATE.genHistory.map(h=>`<div class="history-chip" onclick="quickGen('${h}')">${h}</div>`).join('');
  scheduleSave();
}
function renderGenRoadmap(data,topic){
  let html=`<div style="font-family:var(--font-d);font-size:1.1rem;font-weight:800;margin-bottom:8px;padding-bottom:10px;border-bottom:1px solid var(--b1)">${data.title||topic} â€” Learning Roadmap</div>`;
  if(data.summary){
    html+=`<div class="intro-banner" style="margin-bottom:14px"><div style="font-size:1.4rem">Plan</div><div><div class="intro-title">Roadmap Summary</div><div class="intro-text">${data.summary}</div></div></div>`;
  }
  (data.phases||[]).forEach((phase,i)=>{
    const c=PHASE_COLORS[i%PHASE_COLORS.length];
    html+=`<div class="phase"><div class="phase-header" onclick="togglePhase(this)">
      <div class="phase-badge" style="background:${c.bg};color:${c.color}">Phase ${i+1}</div>
      <div class="phase-title">${phase.title||''}</div>
      <div class="phase-meta">${phase.duration||''}</div>
      <div class="chevron">${i===0?'â–²':'â–¼'}</div>
    </div><div class="phase-body${i===0?' open':''}">`;
    if(phase.goal){ html+=`<div class="topic-note" style="margin-bottom:12px"><strong>Goal:</strong> ${phase.goal}</div>`; }
    if(phase.topics?.length){
      html+=`<div class="topic-grid">`;
      phase.topics.forEach(t=>{
        html+=`<div class="topic-card"><div class="topic-name">${t.name||''}</div>`;
        if(t.why_it_matters){ html+=`<div class="topic-note"><strong>Why it matters:</strong> ${t.why_it_matters}</div>`; }
        if(t.focus_points?.length){ html+=`<div class="topic-note"><strong>Focus:</strong> ${t.focus_points.join(' · ')}</div>`; }
        if(t.links?.length){ html+=`<div class="link-row">`; t.links.forEach(l=>{ html+=`<a class="link-pill ${l.type||'doc'}" href="${l.url||'#'}" target="_blank">${l.label||''}</a>`; }); html+=`</div>`; }
        html+=`</div>`;
      });
      html+=`</div>`;
    }
    if(phase.projects?.length){ html+=`<div class="section-label">Projects</div>`; phase.projects.forEach(p=>{ html+=`<div class="proj-card"><div class="proj-title">${p.title||''}</div><div class="proj-desc">${p.description||''}</div><div class="link-row">${(p.tags||[]).map(g=>`<span class="lang-tag">${g}</span>`).join('')}</div></div>`; }); }
    if(phase.certificates?.length){ html+=`<div class="section-label">Free Certificates</div>`; phase.certificates.forEach(cert=>{ html+=`<div class="cert-card"><div class="cert-icon">ðŸ…</div><div class="cert-info"><div class="cert-name">${cert.name||''}</div><div class="cert-by">${cert.provider||''}</div></div><a class="link-pill cert" href="${cert.url||'#'}" target="_blank">Enroll</a></div>`; }); }
    html+=`</div></div>`;
  });
  if(data.career_notes?.length){
    html+=`<div class="intro-banner" style="margin-top:12px"><div style="font-size:1.4rem">Tips</div><div><div class="intro-title">Career Notes</div><div class="intro-text">${data.career_notes.join(' · ')}</div></div></div>`;
  }
  if(data.free_options?.length){
    html+=`<div class="intro-banner"><div style="font-size:1.4rem">Free</div><div><div class="intro-title">Free Options</div><div class="intro-text">${data.free_options.join(' · ')}</div></div></div>`;
  }
  return html;
}
async function generateRoadmap(){
  const topic=(document.getElementById('topicInput').value||'').trim();
  if(!topic){ toast('Enter a topic first','âš ï¸'); return; }
  const btn=document.getElementById('genBtn');
  const status=document.getElementById('status');
  const output=document.getElementById('output');
  const provider=getActiveProvider();
  btn.disabled=true;
  output.innerHTML='';
  status.innerHTML=`<span class="progress-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>&nbsp; Generating <strong>${topic}</strong> roadmap with ${provider.name}â€¦`;
  try{
    const result=await window.AIProviderKit.requestRoadmap(topic, STATE);
    STATE.aiUsage=STATE.aiUsage||{calls:0,tokens:0};
    STATE.aiUsage.calls++;
    const usageTokens=result.usage?.total_tokens ?? ((result.usage?.input_tokens||0)+(result.usage?.output_tokens||0));
    STATE.aiUsage.tokens+=usageTokens||0;
    if(result.mode==='prompt'){
      status.innerHTML=`<span style="color:var(--done)">âœ“ Prompt prepared for <strong>${topic}</strong></span>`;
      output.innerHTML=window.AIProviderKit.renderPromptOnlyResult(result,topic);
    }else{
      status.innerHTML=`<span style="color:var(--done)">âœ“ Roadmap generated for <strong>${topic}</strong></span>`;
      output.innerHTML=renderGenRoadmap(result.data,topic);
    }
    addToHistory(topic);
    scheduleSave();
  }catch(err){
    logError('Roadmap generation failed', { topic, provider: provider.name, error: err });
    status.innerHTML='';
    output.innerHTML=`<div class="error-box">Error: ${err.message}. Check your provider setup or switch to Prompt Mode.</div>`;
  }finally{
    btn.disabled=false;
  }
}

/* â”€â”€ THEME â”€â”€ */
function toggleTheme(){
  const isDark=!document.documentElement.dataset.theme;
  document.documentElement.dataset.theme=isDark?'light':'';
  localStorage.setItem('theme',isDark?'light':'dark');
  document.getElementById('hdr').querySelector('.ic-btn').textContent=isDark?'ðŸŒ™':'â˜€';
}

/* â”€â”€ TOAST â”€â”€ */
function toast(msg,icon='â„¹ï¸'){
  const el=document.createElement('div');
  el.className='toast';
  el.innerHTML=`<span>${icon}</span><span>${msg}</span>`;
  document.getElementById('toasts').appendChild(el);
  requestAnimationFrame(()=>{ requestAnimationFrame(()=>el.classList.add('show')); });
  setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.remove(),400); },3000);
}

/* â”€â”€ CONFETTI â”€â”€ */
function confettiBurst(){
  const colors=['#b39dff','#23d160','#ffd700','#4da6ff','#ff6bb5'];
  for(let i=0;i<16;i++){
    const el=document.createElement('div');
    Object.assign(el.style,{
      position:'fixed',left:Math.random()*100+'vw',top:'60vh',width:'7px',height:'7px',
      borderRadius:'50%',background:colors[i%colors.length],zIndex:'9999',
      transform:'translateY(0)',opacity:'1',pointerEvents:'none',
      transition:`transform ${0.6+Math.random()*0.4}s ease-out, opacity 0.6s`
    });
    document.body.appendChild(el);
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        el.style.transform=`translate(${(Math.random()-0.5)*120}px, -${80+Math.random()*80}px)`;
        el.style.opacity='0';
      });
    });
    setTimeout(()=>el.remove(),1200);
  }
}

/* â”€â”€ NOTES â”€â”€ */
function toggleNote(btn, track, topic){
  const card=btn.closest('.topic-card');
  const box=card ? card.querySelector('.note-box') : btn.nextElementSibling;
  if(!box) return;
  const isOpen=box.style.display!=='none';
  box.style.display=isOpen?'none':'block';
  if(!isOpen){
    const ta=box.querySelector('.note-ta');
    ta.value=STATE.notes?.[`${track}:${topic}`]||'';
    ta.focus();
  }
}
function saveNote(ta, track, topic){
  if(!STATE.notes) STATE.notes={};
  const val=ta.value.trim();
  if(val){ STATE.notes[`${track}:${topic}`]=val; }
  else{ delete STATE.notes[`${track}:${topic}`]; }
  // Update note button indicator
  const btn=ta.closest('.topic-card')?.querySelector('.note-btn');
  if(btn){
    btn.classList.toggle('has-note',!!val);
    btn.title=val?'Edit note (has note)':'Add note';
  }
  scheduleSave();
}
function applyNotes(){
  if(!STATE.notes) return;
  Object.entries(STATE.notes).forEach(([key,val])=>{
    if(!val) return;
    const [track,...rest]=key.split(':');
    const topic=rest.join(':');
    const card=document.querySelector(`.topic-card[data-track="${track}"][data-topic="${CSS.escape(topic)}"]`);
    if(!card) return;
    const btn=card.querySelector('.note-btn');
    if(btn){ btn.classList.add('has-note'); btn.title='Edit note (has note)'; }
  });
}

/* â”€â”€ EXPORT â”€â”€ */
function exportProgress(){
  const done=Object.keys(STATE.progress);
  const total=document.querySelectorAll('.topic-card[data-topic]').length;
  const lines=[
    '# DevRoadmap Pro â€” Progress Export',
    `Generated: ${new Date().toLocaleString()}`,
    `Overall: ${done.length}/${total} topics (${Math.round(done.length/total*100)}%)`,
    `XP: ${STATE.xp||0} | Streak: ${STATE.streak||0} days`,
    '',
    '## Completed Topics',
    ...done.map(k=>`- [âœ“] ${k.replace(':',' â†’ ')}`),
    '',
    '## Notes',
    ...Object.entries(STATE.notes||{}).map(([k,v])=>`### ${k.replace(':',' â†’ ')}\n${v}`),
  ];
  const blob=new Blob([lines.join('\n')],{type:'text/plain'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`devroadmap-export-${new Date().toISOString().slice(0,10)}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Exported as Markdown âœ“','â¬‡ï¸');
}

/* â”€â”€ SAVE DEBOUNCE (increased to avoid hammering Firestore on every keypress in notes) â”€â”€ */
// scheduleSave already debounces at 1200ms â€” notes use the same path, no change needed

/* â”€â”€ SCROLL SIDEBAR â”€â”€ */
function scrollToSidebar(){ document.getElementById('sidebar')?.scrollIntoView({behavior:'smooth'}); }

/* â”€â”€ HISTORY RESTORE â”€â”€ */
function restoreGenHistory(){
  if(!STATE.genHistory?.length) return;
  document.getElementById('historySection').style.display='block';
  document.getElementById('historyChips').innerHTML=STATE.genHistory.map(h=>`<div class="history-chip" onclick="quickGen('${h}')">${h}</div>`).join('');
}

/* â”€â”€ INIT â”€â”€ */
document.addEventListener('DOMContentLoaded',()=>{
  ensureAIState();
  // Restore theme
  const savedTheme=localStorage.getItem('theme');
  if(savedTheme==='light'){ document.documentElement.dataset.theme='light'; document.getElementById('hdr').querySelector('.ic-btn[onclick*=toggleTheme]').textContent='ðŸŒ™'; }

  if(window.RoadmapExtensions){ window.RoadmapExtensions.apply(); }
  renderAIProviderUI();
  enhanceTopicCards();
  buildSearchIndex();
  renderSidebar();
  updateGenKeyStatus();

  // Keyboard shortcuts
  document.addEventListener('keydown',e=>{
    const tag=document.activeElement.tagName;
    const typing=['INPUT','TEXTAREA'].includes(tag);
    if(e.key==='/'&&!typing){ e.preventDefault(); openSearch(); }
    if(e.key==='Escape'){ closeSearch(); document.getElementById('apiSetupScreen').classList.remove('show'); }
    if(e.key==='t'&&!typing){ toggleTheme(); }
    if(e.key==='?'&&!typing){ showKeyboardHelp(); }
  });

  // Offline/online banner
  function setOnline(on){
    let b=document.getElementById('offlineBanner');
    if(on){ if(b) b.remove(); }
    else{
      if(!b){ b=document.createElement('div'); b.id='offlineBanner';
        b.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:8999;background:rgba(245,166,35,.95);color:#000;text-align:center;padding:7px;font-size:.78rem;font-weight:600';
        b.textContent='âš ï¸ You are offline â€” changes will sync when reconnected'; document.body.appendChild(b); }
    }
  }
  window.addEventListener('online',()=>{ setOnline(true); if(_currentUser) forceSyncNow(); });
  window.addEventListener('offline',()=>setOnline(false));
  if(!navigator.onLine) setOnline(false);
  logInfo('App initialized', {
    topics: document.querySelectorAll('.topic-card[data-topic]').length,
    activeProvider: getActiveProvider().name
  });
});

window.addEventListener('error',(event)=>{
  logError('Unhandled window error', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection',(event)=>{
  logError('Unhandled promise rejection', event.reason);
});

/* â”€â”€ KEYBOARD HELP â”€â”€ */
function showKeyboardHelp(){
  const existing=document.getElementById('kbHelp');
  if(existing){ existing.remove(); return; }
  const d=document.createElement('div');
  d.id='kbHelp';
  d.style.cssText='position:fixed;inset:0;z-index:8500;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center';
  d.onclick=e=>{ if(e.target===d) d.remove(); };
  d.innerHTML=`<div style="background:var(--s1);border:1px solid var(--b1);border-radius:16px;padding:28px;min-width:300px;box-shadow:var(--sh-lg)">
    <div style="font-family:var(--font-d);font-size:1rem;font-weight:800;margin-bottom:16px">âŒ¨ï¸ Keyboard Shortcuts</div>
    ${[['/',  'Global search'],['Esc','Close modals'],['T','Toggle dark/light'],['?','Show this help']].map(([k,v])=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--b1);font-size:.82rem">
      <span style="color:var(--t2)">${v}</span>
      <kbd style="font-family:var(--font-m);font-size:.65rem;background:var(--s3);border:1px solid var(--b2);border-radius:4px;padding:2px 8px">${k}</kbd>
    </div>`).join('')}
    <button onclick="document.getElementById('kbHelp').remove()" style="margin-top:14px;width:100%;padding:8px;border-radius:8px;background:var(--s2);border:1px solid var(--b1);cursor:pointer;font-size:.8rem;color:var(--t1)">Close</button>
  </div>`;
  document.body.appendChild(d);
}

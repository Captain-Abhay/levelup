'use strict';
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   LOCAL STATE (in-memory + Firebase sync)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
let STATE = {
  version: 2,
  progress: {},   // { 'topic-id': true }
  notes: {},      // { 'topic-id': 'note text' }
  bookmarks: {},  // { 'topic-id': true }
  completedAt: {}, // { 'topic-id': 'YYYY-MM-DD' }
  streak: 0,
  lastActive: null,
  lastVisited: null,
  weeklyGoal: 10,
  weekDone: 0,
  xp: 0,
  level: 1,
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
let _lastActivityRecordedAt = 0;
let _noteSaveTimers = new Map();
let _syncRetryTimer = null;
let _syncRetryCount = 0;
let _syncInFlight = false;
const APP_LOG_PREFIX='[DevRoadmap]';
const DOM = {};
const TOPIC_INDEX = new Map();
const LEGACY_TOPIC_INDEX = new Map();
const TRACK_LABELS = {
  dsa: 'DSA',
  webdev: 'Web Dev',
  ai: 'AI / ML',
  mlops: 'MLOps',
  dba: 'DBA / Data Platforms'
};

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

const MOJIBAKE_EXACT_REPLACEMENTS = {
  'ðŸ—º': 'DR',
  'Ã°Å¸â€”Âº': 'DR',
  'ðŸŽ¯': 'DSA',
  'Ã°Å¸Å½Â¯': 'DSA',
  'ðŸŒ': 'Web',
  'Ã°Å¸Å’': 'Web',
  'ðŸ¤–': 'AI',
  'Ã°Å¸Â¤â€“': 'AI',
  'ðŸ“Š': 'Stats',
  'Ã°Å¸â€œÅ ': 'Stats',
  'ðŸ”‘': 'Key',
  'Ã°Å¸â€â€˜': 'Key',
  'ðŸš€': 'Go',
  'Ã°Å¸Å¡â‚¬': 'Go',
  'ðŸ†': 'Cert',
  'ðŸ…': 'Cert',
  'Ã°Å¸Ââ€ ': 'Cert',
  'Ã°Å¸Ââ€¦': 'Cert',
  'â˜€': 'L',
  'ðŸŒ™': 'D',
  'âŒ¨ï¸': '?',
  'Ã¢Å’Â¨Ã¯Â¸Â': '?',
  'âœ•': 'x',
  'â–²': '^',
  'â–¼': 'v'
};

const MOJIBAKE_INLINE_REPLACEMENTS = [
  ['Ã¢â‚¬â€', '-'],
  ['Ã¢â‚¬â€œ', '-'],
  ['Ã¢â‚¬Â¦', '...'],
  ['Ã¢â‚¬â„¢', "'"],
  ['Ã¢â€ â€™', '->'],
  ['Ã‚Â·', '|'],
  ['Ã¢â€“Â²', '^'],
  ['Ã¢â€“Â¼', 'v'],
  ['Ã¢ËœÂÃ¯Â¸Â', ''],
  ['â€”', '-'],
  ['â€“', '-'],
  ['â€¦', '...'],
  ['â†’', '->'],
  ['Â·', '|'],
  ['â‰ˆ', '~'],
  ['Ã—', 'x'],
  ['Ã°Å¸â€Â¥', ''],
  ['Ã¢Å¡Â¡', ''],
  ['Ã°Å¸â€™Â¡', ''],
  ['Ã°Å¸Â§Â ', ''],
  ['Ã°Å¸â€œÅ ', ''],
  ['Ã°Å¸â€â€˜', ''],
  ['Ã°Å¸Å¡â‚¬', ''],
  ['Ã°Å¸Ââ€ ', ''],
  ['Ã°Å¸Ââ€¦', ''],
  ['Ã°Å¸Å’', ''],
  ['Ã°Å¸Â¤â€“', ''],
  ['Ã¢Ëœï¸', ''],
  ['Ã¢Å’Â¨Ã¯Â¸Â', '?'],
  ['Ã°Å¸â€™Â¾', ''],
  ['Ã°Å¸â€œÂ¥', ''],
  ['Ã°Å¸â€œï¿½', ''],
  ['Ã°Å¸Å½Â¯', ''],
  ['ðŸ”¥', ''],
  ['âš¡', ''],
  ['ðŸ’¡', ''],
  ['ðŸ§ ', ''],
  ['ðŸ—º', ''],
  ['ðŸŽ¯', ''],
  ['ðŸŒ', ''],
  ['ðŸ¤–', ''],
  ['ðŸ“Š', ''],
  ['ðŸ”‘', ''],
  ['ðŸš€', ''],
  ['â˜ï¸', ''],
  ['âŒ¨ï¸', '?'],
  ['â¬‡ï¸', ''],
  ['ðŸ’¾', ''],
  ['ðŸ“¥', ''],
  ['ðŸ“', ''],
  ['â†©', ''],
  ['âœ“', ''],
  ['âœ¦', ''],
  ['âœ•', 'x'],
  ['â–²', '^'],
  ['â–¼', 'v']
];

function normalizeMojibakeText(value){
  if(typeof value !== 'string' || !value) return value;
  const trimmed = value.trim();
  if(MOJIBAKE_EXACT_REPLACEMENTS[trimmed]){
    const prefix = value.match(/^\s*/)?.[0] || '';
    const suffix = value.match(/\s*$/)?.[0] || '';
    return prefix + MOJIBAKE_EXACT_REPLACEMENTS[trimmed] + suffix;
  }
  let next = value;
  for(let i=0;i<3;i++){
    MOJIBAKE_INLINE_REPLACEMENTS.forEach(([bad, good]) => {
      next = next.split(bad).join(good);
    });
  }
  return next
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s+\|/g, ' |');
}

function normalizeVisibleText(root=document.body){
  if(!root) return;
  const textNodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while(walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node)=>{
    const next = normalizeMojibakeText(node.nodeValue);
    if(next !== node.nodeValue) node.nodeValue = next;
  });
  root.querySelectorAll('[placeholder],[title]').forEach((el)=>{
    if(el.hasAttribute('placeholder')){
      const next = normalizeMojibakeText(el.getAttribute('placeholder'));
      if(next !== el.getAttribute('placeholder')) el.setAttribute('placeholder', next);
    }
    if(el.hasAttribute('title')){
      const next = normalizeMojibakeText(el.getAttribute('title'));
      if(next !== el.getAttribute('title')) el.setAttribute('title', next);
    }
  });
}

function repairStaticUIText(){
  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if(el) el.textContent = value;
  };
  const setHtml = (selector, value) => {
    const el = document.querySelector(selector);
    if(el) el.innerHTML = value;
  };

  setText('#authOverlay .auth-logo', 'DR');
  setText('#authOverlay .auth-btn.demo', 'Try without account');
  setText('#apiSetupScreen .api-setup-title', 'Connect an AI Provider');
  setText('#apiSetupScreen .api-setup-sub', 'AI features like Mentor, Goal Generator, and Roadmap Builder work with Anthropic, OpenAI, Gemini, OpenRouter, or Prompt Mode.');
  setText('#apiSetupScreen .ak-vis-btn', 'Show');
  setText('#apiSetupScreen [style*="font-size:2rem"]', 'AI');
  setText('#hostingModal .hosting-hdr span', 'Host');
  setText('.goal-edit', 'Change goal ->');
  setHtml('.streak-info', 'day streak<br><span id="streakMsg" style="color:var(--t4);font-size:.65rem"></span>');

  const authFeatures = document.querySelectorAll('#authOverlay .af-item');
  if(authFeatures[0]) authFeatures[0].innerHTML = '<span>Sync</span> Progress synced across all your devices';
  if(authFeatures[1]) authFeatures[1].innerHTML = '<span>Keys</span> Save one or more AI provider keys securely';
  if(authFeatures[2]) authFeatures[2].innerHTML = '<span>AI</span> AI roadmap builder with multi-provider support';
  if(authFeatures[3]) authFeatures[3].innerHTML = '<span>XP</span> XP, streaks, and activity heatmap';

  const akSteps = document.querySelectorAll('#apiSetupScreen .ak-step span:last-child');
  if(akSteps[0]) akSteps[0].innerHTML = 'Go to <a href="https://console.anthropic.com/account/keys" target="_blank" style="color:var(--ai)">console.anthropic.com</a> -&gt; Create Key';
  if(akSteps[1]) akSteps[1].textContent = 'Free tier gives about $5 credit, which is roughly 500 responses';
  if(akSteps[2]) akSteps[2].textContent = 'Paste it below. It is stored in your Firebase profile.';

  const introTitle = document.querySelector('#dsa .intro-title');
  if(introTitle) introTitle.textContent = 'DSA Roadmap - Beginner to FAANG/OpenAI Level';
}

function cacheDOM(){
  DOM.themeToggle = document.getElementById('themeToggleBtn');
  DOM.hdrXP = document.getElementById('hdrXP');
  DOM.hdrLevel = document.getElementById('hdrLevel');
  DOM.levelBadge = document.getElementById('levelBadge');
  DOM.levelName = document.getElementById('levelName');
  DOM.levelSub = document.getElementById('levelSub');
  DOM.xpBar = document.getElementById('xpBar');
  DOM.statXP = document.getElementById('statXP');
  DOM.statDone = document.getElementById('statDone');
  DOM.statPct = document.getElementById('statPct');
  DOM.statStreak = document.getElementById('statStreak');
  DOM.streakNum = document.getElementById('streakNum');
  DOM.streakMsg = document.getElementById('streakMsg');
  DOM.goalDone = document.getElementById('goalDone');
  DOM.goalOf = document.getElementById('goalOf');
  DOM.goalSub = document.getElementById('goalSub');
  DOM.goalRing = document.getElementById('goalRing');
  DOM.trackProgressList = document.getElementById('trackProgressList');
  DOM.syncPill = document.getElementById('syncPill');
  DOM.syncLabel = document.getElementById('syncLabel');
  DOM.historySection = document.getElementById('historySection');
  DOM.historyChips = document.getElementById('historyChips');
  DOM.authOverlay = document.getElementById('authOverlay');
  DOM.userMenuWrap = document.getElementById('userMenuWrap');
}

function clearSyncRetry(){
  clearTimeout(_syncRetryTimer);
  _syncRetryTimer = null;
  _syncRetryCount = 0;
}

function slugify(value){
  return normalizeMojibakeText(String(value || ''))
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'topic';
}

function legacyTopicKey(track, topic){
  return `${track}:${topic}`;
}

function getTopicKey(cardOrId, fallbackTopic){
  if(!cardOrId) return null;
  if(typeof cardOrId === 'string' && !fallbackTopic) return cardOrId;
  if(typeof cardOrId === 'string' && fallbackTopic){
    return LEGACY_TOPIC_INDEX.get(legacyTopicKey(cardOrId, fallbackTopic)) || null;
  }
  return cardOrId.dataset?.id || null;
}

function getTopicCard(cardOrId, fallbackTopic){
  const id = getTopicKey(cardOrId, fallbackTopic);
  return id ? TOPIC_INDEX.get(id)?.card || null : null;
}

function getTopicMeta(cardOrId, fallbackTopic){
  const id = getTopicKey(cardOrId, fallbackTopic);
  return id ? TOPIC_INDEX.get(id) || null : null;
}

function assignTopicIds(){
  TOPIC_INDEX.clear();
  LEGACY_TOPIC_INDEX.clear();
  const seen = new Map();
  let globalOrder = 0;
  document.querySelectorAll('.phase[data-track][data-phase]').forEach((phase)=>{
    const track = phase.dataset.track;
    const phaseIndex = Number(phase.dataset.phase || 0);
    phase.querySelectorAll('.topic-card[data-track][data-topic]').forEach((card, cardIndex)=>{
      const topic = card.dataset.topic;
      const slug = slugify(topic);
      const occurrenceKey = `${track}:${slug}`;
      const occurrence = (seen.get(occurrenceKey) || 0) + 1;
      seen.set(occurrenceKey, occurrence);
      const id = `${track}-p${phaseIndex + 1}-${slug}-${occurrence}`;
      card.dataset.id = id;
      card.dataset.order = String(globalOrder++);
      const meta = { id, track, topic, phaseIndex, cardIndex, order: globalOrder - 1, card };
      TOPIC_INDEX.set(id, meta);
      LEGACY_TOPIC_INDEX.set(legacyTopicKey(track, topic), id);
    });
  });
}

function remapStateKeys(map){
  const next = {};
  Object.entries(map || {}).forEach(([key, value])=>{
    const remapped = LEGACY_TOPIC_INDEX.get(key) || (TOPIC_INDEX.has(key) ? key : null);
    if(remapped) next[remapped] = value;
  });
  return next;
}

function migrateStateKeys(){
  STATE.progress = remapStateKeys(STATE.progress);
  STATE.notes = remapStateKeys(STATE.notes);
  STATE.bookmarks = remapStateKeys(STATE.bookmarks);
  STATE.completedAt = remapStateKeys(STATE.completedAt);
  if(STATE.lastVisited){
    if(typeof STATE.lastVisited === 'string'){
      STATE.lastVisited = { id: STATE.lastVisited, ts: Date.now() };
    }else if(!STATE.lastVisited.id && STATE.lastVisited.track && STATE.lastVisited.topic){
      const migratedId = LEGACY_TOPIC_INDEX.get(legacyTopicKey(STATE.lastVisited.track, STATE.lastVisited.topic));
      STATE.lastVisited = migratedId ? { ...STATE.lastVisited, id: migratedId } : null;
    }
  }
}

function ensureWeekState(){
  const weekStart = getWeekStart();
  if(STATE.weekStart !== weekStart){
    STATE.weekStart = weekStart;
  }
  STATE.weekDone = Object.values(STATE.completedAt || {}).filter((dateKey)=>dateKey >= weekStart).length;
}

function getTodayKey(){
  return window.HeatmapUtils ? window.HeatmapUtils.todayKey() : new Date().toISOString().slice(0,10);
}

function cloneUndoSnapshot(){
  return {
    progress: { ...(STATE.progress || {}) },
    completedAt: { ...(STATE.completedAt || {}) },
    streak: STATE.streak || 0,
    lastActive: STATE.lastActive || null,
    heatmap: { ...(STATE.heatmap || {}) },
    xp: STATE.xp || 0,
    level: STATE.level || 1,
    weekDone: STATE.weekDone || 0,
    lastVisited: STATE.lastVisited ? { ...STATE.lastVisited } : null
  };
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
  safe.completedAt = sanitizeObjectMap(safe.completedAt);
  safe.heatmap = sanitizeObjectMap(safe.heatmap);
  safe.aiUsage = safe.aiUsage && typeof safe.aiUsage === 'object' ? safe.aiUsage : { calls: 0, tokens: 0 };
  safe.aiUsage.calls = Number.isFinite(+safe.aiUsage.calls) ? +safe.aiUsage.calls : 0;
  safe.aiUsage.tokens = Number.isFinite(+safe.aiUsage.tokens) ? +safe.aiUsage.tokens : 0;
  safe.genHistory = Array.isArray(safe.genHistory) ? safe.genHistory.slice(0, 10) : [];
  safe.weeklyGoal = Number.isFinite(+safe.weeklyGoal) && +safe.weeklyGoal > 0 ? parseInt(safe.weeklyGoal, 10) : 10;
  safe.weekDone = Number.isFinite(+safe.weekDone) && +safe.weekDone >= 0 ? parseInt(safe.weekDone, 10) : 0;
  safe.xp = Number.isFinite(+safe.xp) && +safe.xp >= 0 ? parseInt(safe.xp, 10) : 0;
  safe.streak = Number.isFinite(+safe.streak) && +safe.streak >= 0 ? parseInt(safe.streak, 10) : 0;
  safe.level = Number.isFinite(+safe.level) && +safe.level > 0 ? parseInt(safe.level, 10) : 1;
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
  clearSyncRetry();
  document.getElementById('authOverlay').classList.add('hidden');
  setTimeout(() => { document.getElementById('authOverlay').style.display = 'none'; }, 500);
  updateUserUI(user);
  setSyncStatus('syncing', 'Syncing...');
  const data = await window._fbLoad(user.uid);
  if (data) {
    STATE = sanitizeLoadedState({ ...STATE, ...data });
    ensureAIState();
    migrateStateKeys();
    updateApp({ refreshCards: true, rebuildSearch: true, skipSave: true });
    restoreGenHistory();
    updateGenKeyStatus();
  }
  ensureAIState();
  window._fbWatch(user.uid, (newData) => {
    if (newData) {
      STATE = sanitizeLoadedState({ ...STATE, ...newData });
      ensureAIState();
      migrateStateKeys();
      updateApp({ refreshCards: true, rebuildSearch: true, skipSave: true });
      updateGenKeyStatus();
    }
  });
  setSyncStatus('ok', 'Synced');
  if (!getActiveProviderConfig().apiKey && getActiveProvider().id !== 'prompt') { setTimeout(() => { document.getElementById('apiSetupScreen').classList.add('show'); }, 800); }
  toast('Welcome back, ' + (user.displayName?.split(' ')[0] || 'friend') + '!', 'OK');
};
window._handleSignOut = () => {
  _currentUser = null;
  clearSyncRetry();
  document.getElementById('authOverlay').style.display='flex';
  document.getElementById('authOverlay').classList.remove('hidden');
  document.getElementById('userMenuWrap').style.display='none';
  setSyncStatus('off','Local');
};
window._demoMode = () => {
  try{
    const saved=localStorage.getItem('devroadmap-local-state');
    if(saved){ STATE = sanitizeLoadedState(JSON.parse(saved)); migrateStateKeys(); }
  }catch(error){
    logWarn('Failed to restore local demo state', error);
  }
  document.getElementById('authOverlay').classList.add('hidden');
  setTimeout(()=>{ document.getElementById('authOverlay').style.display='none'; },500);
  setSyncStatus('off','Demo');
  ensureAIState();
  updateApp({ refreshCards: true, rebuildSearch: true, skipSave: true });
  restoreGenHistory();
  updateGenKeyStatus();
  toast('Demo mode - progress is stored only on this device.','i');
};

function scheduleSave(){
  _isDirty=true;
  clearTimeout(_saveTimer);
  _saveTimer=setTimeout(()=>{
    if(!_isDirty) return;
    try{
      persistLocalSnapshot();
    }catch(error){
      logError('Local snapshot failed before scheduled sync', error);
      toast('Local save failed. Check browser storage.','!');
      return;
    }
    if(!_currentUser){
      _isDirty=false;
      setSyncStatus('off','Local');
      return;
    }
    flushRemoteSave('scheduled');
  },1200);
}

async function flushRemoteSave(reason='manual'){
  if(!_currentUser || !_isDirty || _syncInFlight) return;
  _syncInFlight = true;
  clearTimeout(_syncRetryTimer);
  _syncRetryTimer = null;
  try{
    setSyncStatus('syncing', reason === 'retry' ? 'Retrying sync...' : 'Syncing...');
    await window._fbSave(_currentUser.uid, STATE);
    _isDirty = false;
    clearSyncRetry();
    setSyncStatus('ok','Synced');
  }catch(error){
    logError('Remote sync failed', { reason, error });
    _isDirty = true;
    if(!_currentUser){
      setSyncStatus('off','Local');
      return;
    }
    const isOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
    if(!isOnline){
      setSyncStatus('off','Offline');
      return;
    }
    _syncRetryCount += 1;
    const retryDelay = Math.min(30000, 1500 * (2 ** Math.min(_syncRetryCount - 1, 4)));
    setSyncStatus('off', `Retry in ${Math.round(retryDelay / 1000)}s`);
    clearTimeout(_syncRetryTimer);
    _syncRetryTimer = setTimeout(()=>{
      flushRemoteSave('retry');
    }, retryDelay);
    toast(_syncRetryCount === 1 ? 'Sync failed. Retrying in the background.' : 'Still retrying sync in the background.','!');
  }finally{
    _syncInFlight = false;
  }
}

window.forceSyncNow=()=>{
  try{
    persistLocalSnapshot();
  }catch(error){
    toast('Local save failed. Check browser storage.','!');
    return;
  }
  if(!_currentUser){ toast('Saved locally. Sign in to sync across devices.','i'); return; }
  _isDirty = true;
  flushRemoteSave('manual')
    .then(()=>{ if(!_isDirty) toast('Synced!','OK'); })
    .catch(()=>{});
};

function updateApp(options={}){
  ensureWeekState();
  updateLevel();
  if(options.refreshCards) enhanceTopicCards();
  if(options.rebuildSearch) buildSearchIndex();
  applyProgress();
  renderSidebar();
  normalizeVisibleText(document.body);
  try{
    persistLocalSnapshot();
  }catch(error){
    logWarn('Immediate local snapshot failed', error);
  }
  if(!options.skipSave) scheduleSave();
}

function setState(updater, options={}){
  const previous = typeof structuredClone === 'function' ? structuredClone(STATE) : JSON.parse(JSON.stringify(STATE));
  updater(STATE);
  updateApp(options);
  return previous;
}

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
  const input=document.getElementById('providerKeyInput') || document.getElementById('akInput');
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
    toast('Add your ' + provider.name + ' API key or switch to Prompt Mode.','!');
    return;
  }
  STATE.apiKey=STATE.ai.providers.anthropic.apiKey||'';
  scheduleSave();
  document.getElementById('apiSetupScreen').classList.remove('show');
  updateGenKeyStatus();
  toast(provider.id==='prompt'?'Prompt Mode enabled':'Provider settings saved','OK');
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
    el.innerHTML='Prompt Mode is active. You can generate a copy-paste prompt for free, or <button class="inline-action-btn" data-action="open-api-setup" type="button">connect an API provider</button> for in-app generation.';
    el.style.color='var(--learn)';
    return;
  }
  if(config.apiKey){
    el.textContent=provider.name + ' configured - ready to generate.';
    el.style.color='var(--done)';
  }else{
    el.innerHTML='No key set for ' + provider.name + '. <button class="inline-action-btn" data-action="open-api-setup" type="button">Configure provider</button> or switch to Prompt Mode.';
    el.style.color='var(--learn)';
  }
}

function escapeAttr(value){
  return String(value).replace(/'/g, "\\'");
}

function rememberTopic(cardOrId, fallbackTopic){
  const meta = getTopicMeta(cardOrId, fallbackTopic);
  if(!meta) return;
  STATE.lastVisited = { id: meta.id, track: meta.track, topic: meta.topic, ts: Date.now() };
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
  toast('Backup exported','Save');
}

async function importBackup(event){
  const file=event.target.files && event.target.files[0];
  if(!file) return;
  try{
    const text=await file.text();
    const parsed=sanitizeLoadedState(JSON.parse(text));
    STATE={ ...STATE, ...parsed };
    ensureAIState();
    migrateStateKeys();
    updateApp({ refreshCards: true, rebuildSearch: true, skipSave: false });
    restoreGenHistory();
    updateGenKeyStatus();
    toast('Backup imported successfully','OK');
  }catch(error){
    logError('Backup import failed', error);
    toast('Import failed. Please choose a valid JSON backup.','!');
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
  document.querySelectorAll('.topic-card[data-id]').forEach(card=>{
    const btn=card.querySelector('.bookmark-btn');
    const isBookmarked=!!STATE.bookmarks?.[card.dataset.id];
    if(btn){
      btn.classList.toggle('is-bookmarked',isBookmarked);
      btn.textContent=isBookmarked?'Saved':'Save';
    }
  });
}

function enhanceTopicCards(){
  document.querySelectorAll('.topic-card[data-track][data-id]').forEach(card=>{
    const track=card.dataset.track;
    const topic=card.dataset.topic;
    const id=card.dataset.id;
    if(!track || !topic || !id) return;
    if(!card.dataset.enhanced){
      card.dataset.enhanced='true';
      let footer=card.querySelector('.topic-card-footer');
      const markDone=card.querySelector('.mark-done-btn');
      const noteBtn=card.querySelector('.note-btn');
      const noteBox=card.querySelector('.note-box');
      if(markDone){
        markDone.removeAttribute('onclick');
        markDone.dataset.action='toggle-done';
        markDone.dataset.id=id;
      }
      if(noteBtn){
        noteBtn.textContent='Note';
        noteBtn.removeAttribute('onclick');
        noteBtn.dataset.action='toggle-note';
        noteBtn.dataset.id=id;
      }
      const noteTa=noteBox?.querySelector('.note-ta');
      if(noteTa){
        noteTa.removeAttribute('oninput');
        noteTa.removeAttribute('onkeydown');
        noteTa.dataset.action='save-note';
        noteTa.dataset.id=id;
      }
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
        setState((state)=>{
          state.lastVisited = { id, track, topic, ts: Date.now() };
        }, { skipSave: false });
      });
      footer=card.querySelector('.topic-card-footer');
      if(footer && !footer.querySelector('.bookmark-btn')){
        const bookmark=document.createElement('button');
        bookmark.className='bookmark-btn';
        bookmark.type='button';
        bookmark.dataset.action='toggle-bookmark';
        bookmark.dataset.id=id;
        footer.insertBefore(bookmark, footer.firstChild);
      }
    }
  });
  updateBookmarkButtons();
}

function upgradeLegacyMarkup(){
  document.querySelectorAll('.phase-header[onclick]').forEach((header)=>{
    header.removeAttribute('onclick');
    header.dataset.action = 'toggle-phase';
  });
}

function toggleBookmark(btn, trackOrId, topic){
  const meta = getTopicMeta(trackOrId, topic) || getTopicMeta(btn?.dataset?.id);
  if(!meta) return;
  let isBookmarked = false;
  setState((state)=>{
    if(!state.bookmarks) state.bookmarks={};
    if(state.bookmarks[meta.id]) delete state.bookmarks[meta.id];
    else state.bookmarks[meta.id]=true;
    rememberTopic(meta.id);
    isBookmarked = !!state.bookmarks[meta.id];
  });
  toast(isBookmarked?'Saved to bookmarks':'Removed from bookmarks', isBookmarked?'Save':'i');
}

function undoLastAction(){
  if(!_lastUndo) return;
  const snapshot = _lastUndo;
  _lastUndo=null;
  setState((state)=>{
    state.progress = { ...(snapshot.progress || {}) };
    state.completedAt = { ...(snapshot.completedAt || {}) };
    state.streak = snapshot.streak || 0;
    state.lastActive = snapshot.lastActive || null;
    state.heatmap = { ...(snapshot.heatmap || {}) };
    state.xp = snapshot.xp || 0;
    state.level = snapshot.level || 1;
    state.weekDone = snapshot.weekDone || 0;
    state.lastVisited = snapshot.lastVisited ? { ...snapshot.lastVisited } : null;
  });
  toast('Last action undone','Undo');
}

function showUndoToast(topic){
  const el=document.createElement('div');
  el.className='toast';
  el.innerHTML=`<span>Done</span><span>${topic} done.</span><button class="btn-secondary" type="button" data-action="undo-last-action" style="padding:4px 10px;font-size:.7rem;margin-left:auto">Undo</button>`;
  document.getElementById('toasts').appendChild(el);
  requestAnimationFrame(()=>{ requestAnimationFrame(()=>el.classList.add('show')); });
  setTimeout(()=>{ if(el.isConnected){ el.classList.remove('show'); setTimeout(()=>el.remove(),400); } },5000);
}

function toggleDone(btn, trackOrId, topic){
  const meta = getTopicMeta(trackOrId, topic) || getTopicMeta(btn?.dataset?.id);
  if(!meta) return;
  const key = meta.id;
  const now=Date.now();
  if(_toggleLocks[key] && now-_toggleLocks[key] < 350) return;
  _toggleLocks[key]=now;
  const wasDone=!!STATE.progress[key];
  _lastUndo = cloneUndoSnapshot();
  setState((state)=>{
    rememberTopic(meta.id);
    if(wasDone){
      delete state.progress[key];
      delete state.completedAt[key];
      addXP(-10);
    }else{
      state.progress[key]=true;
      state.completedAt[key]=getTodayKey();
      addXP(10);
      updateDailyActivity({ awardStreakBonus: true, throttleMs: 0 });
    }
  });
  if(!wasDone){ confettiBurst(); showUndoToast(meta.topic); }
}
function applyProgress(){
  document.querySelectorAll('.topic-card[data-id]').forEach(card=>{
    const isDone=STATE.progress[card.dataset.id];
    card.classList.toggle('done-card',!!isDone);
    const btn=card.querySelector('.mark-done-btn');
    if(btn){ btn.classList.toggle('is-done',!!isDone); btn.textContent=isDone?'Done':'Mark done'; }
  });
  applyNotes();
  updateBookmarkButtons();
  updateRecommendedTopic();
  renderPhaseProgress();
}

/* â”€â”€ XP & LEVELS â”€â”€ */
const LEVELS=[
  {name:'Beginner',min:0,max:100},{name:'Learner',min:100,max:300},{name:'Practitioner',min:300,max:600},
  {name:'Developer',min:600,max:1000},{name:'Engineer',min:1000,max:1500},{name:'Senior Dev',min:1500,max:2200},
  {name:'Tech Lead',min:2200,max:3000},{name:'Architect',min:3000,max:4000},{name:'Staff Engineer',min:4000,max:5500},
  {name:'FAANG Ready',min:5500,max:Infinity}
];
function getLevel(xp){ return Math.max(1, Math.floor((xp || 0) / 100) + 1); }
function getLevelName(level){
  const levelIndex = Math.min(Math.max(level - 1, 0), LEVELS.length - 1);
  return LEVELS[levelIndex]?.name || `Level ${level}`;
}
function addXP(amount){
  STATE.xp = Math.max(0, (STATE.xp || 0) + amount);
  STATE.level = getLevel(STATE.xp);
}
function updateLevel(){
  STATE.level = getLevel(STATE.xp || 0);
}
function renderXP(){
  const xp=STATE.xp||0;
  const level=STATE.level || getLevel(xp);
  const currentFloor=(level-1)*100;
  const nextFloor=level*100;
  const pct=Math.min(100, Math.round(((xp-currentFloor)/Math.max(nextFloor-currentFloor,1))*100));
  if(DOM.levelBadge) DOM.levelBadge.textContent=level;
  if(DOM.levelName) DOM.levelName.textContent=getLevelName(level);
  if(DOM.levelSub) DOM.levelSub.textContent=`${Math.max(0,nextFloor-xp)} XP to Level ${level+1}`;
  if(DOM.xpBar) DOM.xpBar.style.width=pct+'%';
  if(DOM.hdrXP) DOM.hdrXP.textContent=xp;
  if(DOM.hdrLevel) DOM.hdrLevel.textContent=`Lv.${level}`;
  if(DOM.statXP) DOM.statXP.textContent=xp;
}

/* â”€â”€ STREAK â”€â”€ */
function getWeekStart(){ const d=new Date(); d.setDate(d.getDate()-d.getDay()); return d.toISOString().slice(0,10); }
function updateDailyActivity({ awardStreakBonus=false, throttleMs=0 } = {}){
  const today=getTodayKey();
  const now = Date.now();
  if(!throttleMs || now - _lastActivityRecordedAt >= throttleMs){
    STATE.heatmap=STATE.heatmap||{};
    STATE.heatmap[today]=(STATE.heatmap[today]||0)+1;
    _lastActivityRecordedAt = now;
  }
  const last=STATE.lastActive;
  if(last===today) return;
  if(last){
    const diff=Math.round((new Date(today)-new Date(last))/86400000);
    STATE.streak=diff===1?(STATE.streak||0)+1:1;
  }else{
    STATE.streak=1;
  }
  STATE.lastActive=today;
  if(awardStreakBonus){
    addXP(Math.min(25, 5 + Math.max(0, STATE.streak - 1) * 2));
  }
}

/* â”€â”€ SIDEBAR â”€â”€ */
let _totalTopicsCache=0;
function getFirstUndoneTopic(track){
  const selector=track ? `.topic-card[data-track="${track}"][data-id]` : '.topic-card[data-track][data-id]';
  const cards=[...document.querySelectorAll(selector)];
  return cards.find(card=>!STATE.progress[card.dataset.id]) || null;
}

function getNextTopic(){
  const activeTrack=document.querySelector('.track.active')?.id;
  return getFirstUndoneTopic(activeTrack) || getFirstUndoneTopic();
}

function updateRecommendedTopic(){
  document.querySelectorAll('.topic-card.recommended').forEach((card)=>card.classList.remove('recommended'));
  const next = getNextTopic();
  if(next) next.classList.add('recommended');
}

function renderNextTopicPanel(){
  const panel=document.getElementById('nextTopicPanel');
  if(!panel) return;
  const next=getNextTopic();
  if(!next){
    panel.innerHTML='<div class="helper-empty">You cleared every currently loaded topic. Nice work.</div>';
    return;
  }
  const trackLabel = TRACK_LABELS[next.dataset.track] || next.dataset.track.toUpperCase();
  panel.innerHTML=`
    <div class="helper-title">${next.dataset.topic}</div>
    <div class="helper-copy">Recommended next step from ${trackLabel} based on what is still incomplete.</div>
    <div class="helper-link" data-action="go-to-topic" data-id="${next.dataset.id}">Open topic</div>
  `;
}

function renderResumePanel(){
  const panel=document.getElementById('resumePanel');
  if(!panel) return;
  const last=STATE.lastVisited;
  if(!last || !last.id){
    panel.innerHTML='<div class="helper-empty">Start any topic and this panel will help you jump back in later.</div>';
    return;
  }
  const topicMeta = getTopicMeta(last.id) || last;
  const visitedAt = last.ts ? new Date(last.ts).toLocaleString() : 'Recently visited';
  const trackLabel = TRACK_LABELS[topicMeta.track] || topicMeta.track.toUpperCase();
  panel.innerHTML=`
    <div class="helper-title">${topicMeta.topic}</div>
    <div class="helper-meta">${trackLabel} | ${visitedAt}</div>
    <div class="helper-link" data-action="go-to-topic" data-id="${topicMeta.id}">Resume</div>
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
    const meta = getTopicMeta(key);
    if(!meta) return '';
    const trackLabel = TRACK_LABELS[meta.track] || meta.track.toUpperCase();
    return `<div class="helper-item"><div class="helper-title">${meta.topic}</div><div class="helper-meta">${trackLabel}</div><div class="helper-link" data-action="go-to-topic" data-id="${meta.id}">Open</div></div>`;
  }).join('');
}

function renderSidebar(){
  renderXP();
  // Overall stats
  const allKeys=Object.keys(STATE.progress);
  if(!_totalTopicsCache) _totalTopicsCache=document.querySelectorAll('.topic-card[data-id]').length||1;
  const totalTopics=_totalTopicsCache;
  if(DOM.statDone) DOM.statDone.textContent=allKeys.length;
  if(DOM.statPct) DOM.statPct.textContent=Math.round(allKeys.length/totalTopics*100)+'%';
  if(DOM.statStreak) DOM.statStreak.textContent=(STATE.streak||0)+' days';
  // Track progress
  const tracks=['dsa','webdev','ai','mlops','dba'];
  if(DOM.trackProgressList){
    DOM.trackProgressList.innerHTML=tracks.map(t=>{
    const done=document.querySelectorAll(`.topic-card[data-track="${t}"][data-id].done-card`).length;
    const total=document.querySelectorAll(`.topic-card[data-track="${t}"][data-id]`).length||1;
    const pct=Math.round(done/total*100);
    return `<div class="track-prog"><div class="tp-row"><span class="tp-name">${TRACK_LABELS[t] || t}</span><span class="tp-pct">${pct}%</span></div><div class="tp-bar"><div class="tp-fill" style="width:${pct}%"></div></div></div>`;
    }).join('');
  }
  // Weekly goal
  ensureWeekState();
  const wg=STATE.weeklyGoal||10;
  const wd=STATE.weekDone||0;
  if(DOM.goalDone) DOM.goalDone.textContent=Math.min(wd,wg);
  if(DOM.goalOf) DOM.goalOf.textContent='/ '+wg;
  if(DOM.goalSub) DOM.goalSub.textContent=`${Math.min(wd,wg)} of ${wg} topics`;
  const ring=DOM.goalRing;
  const pct2=Math.min(wd/wg,1);
  const circ=175.9;
  if(ring) ring.style.strokeDashoffset=circ-(circ*pct2);
  // Streak
  if(DOM.streakNum) DOM.streakNum.textContent=STATE.streak||0;
  if(DOM.streakMsg) DOM.streakMsg.textContent=STATE.streak>0?`Last active ${STATE.lastActive||'today'}`:'Start today!';
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
    const cards=ph.querySelectorAll('.topic-card[data-id]');
    const done=[...cards].filter(c=>STATE.progress[c.dataset.id]).length;
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
  if(v&&!isNaN(v)&&parseInt(v,10)>0){
    setState((state)=>{
      state.weeklyGoal=parseInt(v,10);
    });
  }
}

function scrollToLastVisited(){
  const last = STATE.lastVisited;
  if(last?.id){
    goToTopic(last.id);
  }
}

/* â”€â”€ TAB / PHASE TOGGLE â”€â”€ */
function switchTrack(id,el){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.track').forEach(t=>t.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  el.classList.add('active');
  updateRecommendedTopic();
  renderNextTopicPanel();
}
function togglePhase(hdr){
  const body=hdr.nextElementSibling;
  const ch=hdr.querySelector('.chevron');
  const isOpen=body.classList.contains('open');
  body.classList.toggle('open',!isOpen);
  ch.style.transform=isOpen?'':'rotate(180deg)';
}

function handleAppAction(actionEl, event){
  const action = actionEl.dataset.action;
  switch(action){
    case 'auth-sign-in':
      window._fbSignIn(actionEl.dataset.provider);
      return true;
    case 'demo-mode':
      window._demoMode();
      return true;
    case 'switch-ak-tab':
      switchAKTab(actionEl.dataset.tab, actionEl);
      return true;
    case 'toggle-ak-vis':
      toggleAKVis();
      return true;
    case 'switch-ai-provider':
      switchAIProvider(actionEl.dataset.providerId);
      return true;
    case 'save-api-key':
      saveApiKey();
      return true;
    case 'skip-api-key':
      skipApiKey();
      return true;
    case 'dismiss-search-overlay':
      if(event.target === actionEl) closeSearch();
      return true;
    case 'dismiss-modal-self':
      if(event.target === actionEl) actionEl.classList.remove('open');
      return true;
    case 'close-modal':
      document.getElementById(actionEl.dataset.target)?.classList.remove('open');
      return true;
    case 'open-search':
      openSearch();
      return true;
    case 'scroll-sidebar':
      scrollToSidebar();
      return true;
    case 'toggle-theme':
      toggleTheme();
      return true;
    case 'open-modal':
      document.getElementById(actionEl.dataset.target)?.classList.add('open');
      if(actionEl.dataset.closeMenu === 'true') closeUserMenu();
      return true;
    case 'show-usage':
      openUsageModal();
      if(actionEl.dataset.closeMenu === 'true') closeUserMenu();
      return true;
    case 'show-keyboard-help':
      showKeyboardHelp();
      if(actionEl.dataset.closeMenu === 'true') closeUserMenu();
      return true;
    case 'toggle-user-menu':
      toggleUserMenu();
      return true;
    case 'open-api-setup':
      openApiSetup();
      if(actionEl.dataset.closeMenu === 'true') closeUserMenu();
      return true;
    case 'close-user-menu':
      closeUserMenu();
      return true;
    case 'force-sync':
      forceSyncNow();
      if(actionEl.dataset.closeMenu === 'true') closeUserMenu();
      return true;
    case 'export-progress':
      exportProgress();
      if(actionEl.dataset.closeMenu === 'true') closeUserMenu();
      return true;
    case 'export-backup':
      exportBackup();
      if(actionEl.dataset.closeMenu === 'true') closeUserMenu();
      return true;
    case 'import-backup':
      triggerImportBackup();
      if(actionEl.dataset.closeMenu === 'true') closeUserMenu();
      return true;
    case 'show-shortcuts':
      showKeyboardHelp();
      if(actionEl.dataset.closeMenu === 'true') closeUserMenu();
      return true;
    case 'confirm-sign-out':
      confirmSignOut();
      return true;
    case 'switch-track':
      switchTrack(actionEl.dataset.track, actionEl);
      return true;
    case 'toggle-phase':
      togglePhase(actionEl);
      return true;
    case 'generate-roadmap':
      generateRoadmap();
      return true;
    case 'quick-gen':
      quickGen(actionEl.dataset.topic);
      return true;
    case 'go-to-topic':
      goToTopic(actionEl.dataset.id);
      if(actionEl.dataset.closeSearch === 'true') closeSearch();
      return true;
    case 'undo-last-action':
      undoLastAction();
      actionEl.closest('.toast')?.remove();
      return true;
    case 'edit-weekly-goal':
      editWeeklyGoal();
      return true;
    case 'configure-ai-from-usage':
      document.getElementById('usageModal')?.classList.remove('open');
      openApiSetup();
      return true;
    case 'close-kb-help':
      document.getElementById('kbHelp')?.remove();
      return true;
    default:
      return false;
  }
}

function handleDelegatedClick(event){
  const actionEl = event.target.closest('[data-action]');
  if(!actionEl) return;
  if(handleAppAction(actionEl, event)) return;
  const id = actionEl.dataset.id;
  switch(actionEl.dataset.action){
    case 'toggle-done':
      event.preventDefault();
      toggleDone(actionEl, id);
      break;
    case 'toggle-note':
      event.preventDefault();
      toggleNote(actionEl, id);
      break;
    case 'toggle-bookmark':
      event.preventDefault();
      toggleBookmark(actionEl, id);
      break;
    default:
      break;
  }
}

function handleDelegatedInput(event){
  const input = event.target.closest('[data-action]');
  if(!input) return;
  switch(input.dataset.action){
    case 'save-note': {
      const id = input.dataset.id;
      clearTimeout(_noteSaveTimers.get(id));
      const timer = setTimeout(()=>{
        saveNote(input, id);
        _noteSaveTimers.delete(id);
      }, 250);
      _noteSaveTimers.set(id, timer);
      break;
    }
    case 'search-input':
      renderSearch();
      break;
    case 'validate-api-key':
      validateAKInput();
      break;
    case 'update-active-model':
      updateActiveModel(input.value);
      break;
    case 'update-active-model-generator':
      updateActiveModel(input.value, true);
      break;
    case 'update-active-key':
      updateActiveKey(input.value);
      break;
    default:
      break;
  }
}

function handleDelegatedChange(event){
  const input = event.target.closest('[data-action]');
  if(!input) return;
  switch(input.dataset.action){
    case 'import-backup-file':
      importBackup(event);
      break;
    case 'switch-ai-provider-select':
      switchAIProvider(input.value);
      break;
    case 'switch-ai-provider-generator':
      switchAIProvider(input.value, true);
      break;
    default:
      break;
  }
}

function handleDelegatedKeydown(event){
  const input = event.target.closest('[data-action]');
  if(!input) return;
  if(input.dataset.action === 'save-note' && event.key === 'Escape'){
    input.closest('.note-box')?.style.setProperty('display','none');
  }
  if(input.dataset.action === 'generate-on-enter' && event.key === 'Enter'){
    event.preventDefault();
    generateRoadmap();
  }
  if(input.dataset.action === 'toggle-ak-vis' && (event.key === 'Enter' || event.key === ' ')){
    event.preventDefault();
    toggleAKVis();
  }
}

/* â”€â”€ GLOBAL SEARCH â”€â”€ */
const SEARCH_INDEX=[];
function buildSearchIndex(){
  SEARCH_INDEX.length=0;
  document.querySelectorAll('.topic-card[data-id]').forEach(c=>{
    const track=c.dataset.track, topic=c.dataset.topic, id=c.dataset.id;
    SEARCH_INDEX.push({label:topic,type:'topic',track,card:c,id,
      links:[...c.querySelectorAll('.link-pill')].map(l=>l.textContent.trim()).join(' ')});
  });
}
function openSearch(){ document.getElementById('gSearch').classList.add('open'); document.getElementById('gsInput').focus(); renderSearch(); }
function closeSearch(){ document.getElementById('gSearch').classList.remove('open'); }
function renderSearch(){
  const q=(document.getElementById('gsInput').value||'').toLowerCase();
  const res=document.getElementById('gsResults');
  if(!q){ res.innerHTML='<div style="padding:20px;text-align:center;color:var(--t4);font-size:.78rem">Type to search topics, resources, and certificates...</div>'; return; }
  const matches=SEARCH_INDEX.filter(i=>i.label.toLowerCase().includes(q)||i.links.toLowerCase().includes(q)).slice(0,12);
  if(!matches.length){ res.innerHTML='<div style="padding:16px;text-align:center;color:var(--t4);font-size:.78rem">No results found</div>'; return; }
  res.innerHTML=matches.map(m=>`<div class="gs-item" data-action="go-to-topic" data-id="${m.id}" data-close-search="true"><span>${m.label}</span><span class="gs-item-tag">${TRACK_LABELS[m.track] || m.track.toUpperCase()}</span></div>`).join('');
}
function goToTopic(trackOrId,topic){
  const meta = getTopicMeta(trackOrId, topic);
  if(!meta) return;
  const tabBtn=document.querySelector(`.tab[data-track="${meta.track}"]`);
  if(tabBtn) tabBtn.click();
  setTimeout(()=>{
    const card=getTopicCard(meta.id);
    if(card){
      const body=card.closest('.phase-body');
      const header=body?.previousElementSibling;
      body?.classList.add('open');
      if(header){ header.querySelector('.chevron')?.setAttribute('style','transform:rotate(180deg)'); }
      setState((state)=>{
        state.lastVisited = { id: meta.id, track: meta.track, topic: meta.topic, ts: Date.now() };
      });
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
      <br><button class="btn-primary" style="margin-top:8px;font-size:.75rem;padding:6px 14px" type="button" data-action="configure-ai-from-usage">Configure AI -></button>
    </div>
    `}
    <button class="btn-secondary" style="margin-top:14px;width:100%" type="button" data-action="close-modal" data-target="usageModal">Close</button>
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
  document.getElementById('historyChips').innerHTML=STATE.genHistory.map(h=>`<div class="history-chip" data-action="quick-gen" data-topic="${h}">${h}</div>`).join('');
  scheduleSave();
}
function renderGenRoadmap(data,topic){
  let html=`<div style="font-family:var(--font-d);font-size:1.1rem;font-weight:800;margin-bottom:8px;padding-bottom:10px;border-bottom:1px solid var(--b1)">${data.title||topic} - Learning Roadmap</div>`;
  if(data.summary){
    html+=`<div class="intro-banner" style="margin-bottom:14px"><div style="font-size:1.4rem">Plan</div><div><div class="intro-title">Roadmap Summary</div><div class="intro-text">${data.summary}</div></div></div>`;
  }
  (data.phases||[]).forEach((phase,i)=>{
    const c=PHASE_COLORS[i%PHASE_COLORS.length];
    html+=`<div class="phase"><div class="phase-header" data-action="toggle-phase">
      <div class="phase-badge" style="background:${c.bg};color:${c.color}">Phase ${i+1}</div>
      <div class="phase-title">${phase.title||''}</div>
      <div class="phase-meta">${phase.duration||''}</div>
      <div class="chevron">${i===0?'^':'v'}</div>
    </div><div class="phase-body${i===0?' open':''}">`;
    if(phase.goal){ html+=`<div class="topic-note" style="margin-bottom:12px"><strong>Goal:</strong> ${phase.goal}</div>`; }
    if(phase.topics?.length){
      html+=`<div class="topic-grid">`;
      phase.topics.forEach(t=>{
        html+=`<div class="topic-card"><div class="topic-name">${t.name||''}</div>`;
        if(t.why_it_matters){ html+=`<div class="topic-note"><strong>Why it matters:</strong> ${t.why_it_matters}</div>`; }
        if(t.focus_points?.length){ html+=`<div class="topic-note"><strong>Focus:</strong> ${t.focus_points.join(' | ')}</div>`; }
        if(t.links?.length){ html+=`<div class="link-row">`; t.links.forEach(l=>{ html+=`<a class="link-pill ${l.type||'doc'}" href="${l.url||'#'}" target="_blank">${l.label||''}</a>`; }); html+=`</div>`; }
        html+=`</div>`;
      });
      html+=`</div>`;
    }
    if(phase.projects?.length){ html+=`<div class="section-label">Projects</div>`; phase.projects.forEach(p=>{ html+=`<div class="proj-card"><div class="proj-title">${p.title||''}</div><div class="proj-desc">${p.description||''}</div><div class="link-row">${(p.tags||[]).map(g=>`<span class="lang-tag">${g}</span>`).join('')}</div></div>`; }); }
    if(phase.certificates?.length){ html+=`<div class="section-label">Free Certificates</div>`; phase.certificates.forEach(cert=>{ html+=`<div class="cert-card"><div class="cert-icon">Cert</div><div class="cert-info"><div class="cert-name">${cert.name||''}</div><div class="cert-by">${cert.provider||''}</div></div><a class="link-pill cert" href="${cert.url||'#'}" target="_blank">Enroll</a></div>`; }); }
    html+=`</div></div>`;
  });
  if(data.career_notes?.length){
    html+=`<div class="intro-banner" style="margin-top:12px"><div style="font-size:1.4rem">Tips</div><div><div class="intro-title">Career Notes</div><div class="intro-text">${data.career_notes.join(' | ')}</div></div></div>`;
  }
  if(data.free_options?.length){
    html+=`<div class="intro-banner"><div style="font-size:1.4rem">Free</div><div><div class="intro-title">Free Options</div><div class="intro-text">${data.free_options.join(' | ')}</div></div></div>`;
  }
  return html;
}
async function generateRoadmap(){
  const topic=(document.getElementById('topicInput').value||'').trim();
  if(!topic){ toast('Enter a topic first','!'); return; }
  const btn=document.getElementById('genBtn');
  const status=document.getElementById('status');
  const output=document.getElementById('output');
  const provider=getActiveProvider();
  btn.disabled=true;
  output.innerHTML='';
  status.innerHTML=`<span class="progress-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>&nbsp; Generating <strong>${topic}</strong> roadmap with ${provider.name}...`;
  try{
    const result=await window.AIProviderKit.requestRoadmap(topic, STATE);
    STATE.aiUsage=STATE.aiUsage||{calls:0,tokens:0};
    STATE.aiUsage.calls++;
    const usageTokens=result.usage?.total_tokens ?? ((result.usage?.input_tokens||0)+(result.usage?.output_tokens||0));
    STATE.aiUsage.tokens+=usageTokens||0;
    if(result.mode==='prompt'){
      status.innerHTML=`<span style="color:var(--done)">Prompt prepared for <strong>${topic}</strong></span>`;
      output.innerHTML=window.AIProviderKit.renderPromptOnlyResult(result,topic);
    }else{
      status.innerHTML=`<span style="color:var(--done)">Roadmap generated for <strong>${topic}</strong></span>`;
      output.innerHTML=renderGenRoadmap(result.data,topic);
    }
    normalizeVisibleText(output);
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
  if(DOM.themeToggle) DOM.themeToggle.textContent=isDark?'D':'L';
}

/* â”€â”€ TOAST â”€â”€ */
function toast(msg,icon='i'){
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
  const card=getTopicCard(track, topic) || btn.closest('.topic-card');
  const box=card ? card.querySelector('.note-box') : btn.nextElementSibling;
  if(!box) return;
  const isOpen=box.style.display!=='none';
  box.style.display=isOpen?'none':'block';
  if(!isOpen){
    const ta=box.querySelector('.note-ta');
    const key = card?.dataset?.id || getTopicKey(track, topic);
    ta.value=STATE.notes?.[key]||'';
    ta.focus();
  }
}
function saveNote(ta, track, topic){
  const meta = getTopicMeta(track, topic) || getTopicMeta(ta?.dataset?.id);
  if(!meta) return;
  const val=ta.value.trim();
  const hadNote=!!STATE.notes?.[meta.id];
  setState((state)=>{
    if(!state.notes) state.notes={};
    if(val){
      state.notes[meta.id]=val;
      if(!hadNote) addXP(3);
    }else{
      delete state.notes[meta.id];
    }
    updateDailyActivity({ throttleMs: 15000 });
  });
  // Update note button indicator
  const btn=ta.closest('.topic-card')?.querySelector('.note-btn');
  if(btn){
    btn.classList.toggle('has-note',!!val);
    btn.title=val?'Edit note (has note)':'Add note';
  }
}
function applyNotes(){
  if(!STATE.notes) return;
  Object.entries(STATE.notes).forEach(([key,val])=>{
    if(!val) return;
    const card=getTopicCard(key);
    if(!card) return;
    const btn=card.querySelector('.note-btn');
    if(btn){ btn.classList.add('has-note'); btn.title='Edit note (has note)'; }
  });
}

/* â”€â”€ EXPORT â”€â”€ */
function exportProgress(){
  const done=Object.keys(STATE.progress);
  const total=document.querySelectorAll('.topic-card[data-id]').length;
  const lines=[
    '# DevRoadmap Pro - Progress Export',
    `Generated: ${new Date().toLocaleString()}`,
    `Overall: ${done.length}/${total} topics (${Math.round(done.length/total*100)}%)`,
    `XP: ${STATE.xp||0} | Streak: ${STATE.streak||0} days`,
    '',
    '## Completed Topics',
    ...done.map((k)=>{
      const meta=getTopicMeta(k);
      const trackLabel = meta ? (TRACK_LABELS[meta.track] || meta.track.toUpperCase()) : '';
      return `- [x] ${meta ? `${trackLabel} -> ${meta.topic}` : k}`;
    }),
    '',
    '## Notes',
    ...Object.entries(STATE.notes||{}).map(([k,v])=>{
      const meta=getTopicMeta(k);
      const trackLabel = meta ? (TRACK_LABELS[meta.track] || meta.track.toUpperCase()) : '';
      return `### ${meta ? `${trackLabel} -> ${meta.topic}` : k}\n${v}`;
    }),
  ];
  const blob=new Blob([lines.join('\n')],{type:'text/plain'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`devroadmap-export-${new Date().toISOString().slice(0,10)}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Exported as Markdown','Export');
}

/* â”€â”€ SAVE DEBOUNCE (increased to avoid hammering Firestore on every keypress in notes) â”€â”€ */
// scheduleSave already debounces at 1200ms â€” notes use the same path, no change needed

/* â”€â”€ SCROLL SIDEBAR â”€â”€ */
function scrollToSidebar(){ document.getElementById('sidebar')?.scrollIntoView({behavior:'smooth'}); }

/* â”€â”€ HISTORY RESTORE â”€â”€ */
function restoreGenHistory(){
  if(!STATE.genHistory?.length) return;
  document.getElementById('historySection').style.display='block';
  document.getElementById('historyChips').innerHTML=STATE.genHistory.map(h=>`<div class="history-chip" data-action="quick-gen" data-topic="${h}">${h}</div>`).join('');
}

/* â”€â”€ INIT â”€â”€ */
document.addEventListener('DOMContentLoaded',()=>{
  ensureAIState();
  cacheDOM();
  // Restore theme
  const savedTheme=localStorage.getItem('theme');
  if(savedTheme==='light'){
    document.documentElement.dataset.theme='light';
    if(DOM.themeToggle) DOM.themeToggle.textContent='D';
  }

  if(window.RoadmapExtensions){ window.RoadmapExtensions.apply(); }
  upgradeLegacyMarkup();
  assignTopicIds();
  migrateStateKeys();
  repairStaticUIText();
  normalizeVisibleText(document.body);
  requestAnimationFrame(()=>normalizeVisibleText(document.body));
  renderAIProviderUI();
  enhanceTopicCards();
  buildSearchIndex();
  updateApp({ skipSave: true });
  updateGenKeyStatus();
  document.addEventListener('click', handleDelegatedClick);
  document.addEventListener('input', handleDelegatedInput);
  document.addEventListener('change', handleDelegatedChange);
  document.addEventListener('keydown', handleDelegatedKeydown);

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
        b.textContent='You are offline - changes will sync when reconnected'; document.body.appendChild(b); }
    }
  }
  window.addEventListener('online',()=>{ setOnline(true); if(_currentUser){ _isDirty = true; flushRemoteSave('online'); } });
  window.addEventListener('offline',()=>setOnline(false));
  if(!navigator.onLine) setOnline(false);
  logInfo('App initialized', {
    topics: document.querySelectorAll('.topic-card[data-id]').length,
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

window.addEventListener('load',()=>{
  repairStaticUIText();
  normalizeVisibleText(document.body);
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
    <div style="font-family:var(--font-d);font-size:1rem;font-weight:800;margin-bottom:16px">Keyboard Shortcuts</div>
    ${[['/',  'Global search'],['Esc','Close modals'],['T','Toggle dark/light'],['?','Show this help']].map(([k,v])=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--b1);font-size:.82rem">
      <span style="color:var(--t2)">${v}</span>
      <kbd style="font-family:var(--font-m);font-size:.65rem;background:var(--s3);border:1px solid var(--b2);border-radius:4px;padding:2px 8px">${k}</kbd>
    </div>`).join('')}
    <button type="button" data-action="close-kb-help" style="margin-top:14px;width:100%;padding:8px;border-radius:8px;background:var(--s2);border:1px solid var(--b1);cursor:pointer;font-size:.8rem;color:var(--t1)">Close</button>
  </div>`;
  document.body.appendChild(d);
}

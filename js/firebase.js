import{initializeApp}from'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import{getAuth,GoogleAuthProvider,GithubAuthProvider,signInWithPopup,signOut,onAuthStateChanged}from'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import{getFirestore,doc,setDoc,getDoc,onSnapshot}from'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   ðŸ”‘  REPLACE WITH YOUR OWN FIREBASE CONFIG
   Free at: https://console.firebase.google.com
   (one project, no card required)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const firebaseConfig = {
    apiKey: "AIzaSyD6schVdDlMYk6kP5JZMU7P2i2ObuJqdaA",
    authDomain: "roadmap-6ee0b.firebaseapp.com",
    projectId: "roadmap-6ee0b",
    storageBucket: "roadmap-6ee0b.appspot.com",
    messagingSenderId: "1087946243444",
    appId: "1:1087946243444:web:5916e95467217939728021"
};
let app,auth,db,googleProvider,githubProvider,_unsubSnapshot=null;
let FB_READY=false;
const FB_LOG_PREFIX='[DevRoadmap Firebase]';

function fbInfo(message, extra){
  if(typeof extra==='undefined') console.info(FB_LOG_PREFIX, message);
  else console.info(FB_LOG_PREFIX, message, extra);
}

function fbWarn(message, extra){
  if(typeof extra==='undefined') console.warn(FB_LOG_PREFIX, message);
  else console.warn(FB_LOG_PREFIX, message, extra);
}

function safeParse(raw){
  try{
    return JSON.parse(raw || 'null');
  }catch(error){
    fbWarn('Failed to parse synced state', error);
    return null;
  }
}

function safeObject(value){
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizePersistedState(data){
  const meta = safeObject(data?.meta);
  const ai = safeObject(data?.ai);
  const usage = safeObject(ai.usage || data?.aiUsage);
  return {
    version: Number(data?.version) || 2,
    progress: safeObject(data?.progress),
    notes: safeObject(data?.notes),
    bookmarks: safeObject(data?.bookmarks),
    completedAt: safeObject(data?.completedAt),
    heatmap: safeObject(data?.heatmap),
    streak: Number(meta.streak ?? data?.streak) || 0,
    lastActive: meta.lastActive ?? data?.lastActive ?? null,
    lastVisited: meta.lastVisited ?? data?.lastVisited ?? null,
    weeklyGoal: Number(meta.weeklyGoal ?? data?.weeklyGoal) || 10,
    weekDone: Number(meta.weekDone ?? data?.weekDone) || 0,
    xp: Number(meta.xp ?? data?.xp) || 0,
    level: Number(meta.level ?? data?.level) || 1,
    genHistory: Array.isArray(data?.genHistory) ? data.genHistory : [],
    apiKey: ai.apiKey ?? data?.apiKey ?? '',
    aiUsage: {
      calls: Number(usage.calls) || 0,
      tokens: Number(usage.tokens) || 0
    },
    ai: safeObject(data?.ai)
  };
}

function serializeStateForFirestore(data){
  const normalized = normalizePersistedState(data);
  return {
    version: normalized.version,
    progress: normalized.progress,
    notes: normalized.notes,
    bookmarks: normalized.bookmarks,
    completedAt: normalized.completedAt,
    heatmap: normalized.heatmap,
    genHistory: normalized.genHistory,
    meta: {
      xp: normalized.xp,
      level: normalized.level,
      streak: normalized.streak,
      lastActive: normalized.lastActive,
      lastVisited: normalized.lastVisited,
      weeklyGoal: normalized.weeklyGoal,
      weekDone: normalized.weekDone
    },
    ai: {
      apiKey: normalized.apiKey,
      usage: normalized.aiUsage,
      activeProvider: normalized.ai?.activeProvider || 'anthropic',
      providers: safeObject(normalized.ai?.providers)
    },
    data: JSON.stringify(data),
    ts: Date.now()
  };
}

function deserializeStateFromDoc(snapshot){
  if(!snapshot?.exists()) return null;
  const raw = snapshot.data() || {};
  const hasStructuredState =
    raw.progress || raw.notes || raw.bookmarks || raw.completedAt || raw.heatmap || raw.meta || raw.ai || raw.genHistory;
  if(hasStructuredState){
    return normalizePersistedState(raw);
  }
  return normalizePersistedState(safeParse(raw.data));
}

try{
  app=initializeApp(firebaseConfig);
  auth=getAuth(app);
  db=getFirestore(app);
  googleProvider=new GoogleAuthProvider();
  githubProvider=new GithubAuthProvider();
  FB_READY=!firebaseConfig.apiKey.includes('YOUR_');
  fbInfo('Firebase initialized', { ready: FB_READY, projectId: firebaseConfig.projectId });
}catch(e){fbWarn('Firebase init failed',e);}

window._fbSignIn=async(provider)=>{
  if(!FB_READY)return window._demoMode();
  try{
    const authError=document.getElementById('authError');
    if(authError){
      authError.style.display='none';
      authError.textContent='';
    }
    const p=provider==='google'?googleProvider:githubProvider;
    fbInfo('Starting sign-in', { provider: provider });
    await signInWithPopup(auth,p);
  }catch(e){
    fbWarn('Sign-in failed', { provider: provider, error: e });
    document.getElementById('authError').style.display='block';
    document.getElementById('authError').textContent='Sign-in failed: '+e.message;
  }
};
window._fbSignOut=async()=>{
  if(_unsubSnapshot){_unsubSnapshot();_unsubSnapshot=null;}
  fbInfo('Signing out current user');
  if(FB_READY&&auth)await signOut(auth);
  window._handleSignOut();
};
window._fbSave=async(uid,data)=>{
  if(!FB_READY||!db)return;
  try{
    await setDoc(doc(db,'users',uid),serializeStateForFirestore(data),{merge:true});
  }catch(e){
    fbWarn('Save failed', { uid: uid, error: e });
    throw e;
  }
};
window._fbLoad=async(uid)=>{
  if(!FB_READY||!db)return null;
  try{
    const s=await getDoc(doc(db,'users',uid));
    fbInfo('Loaded user state', { uid: uid, exists: s.exists() });
    return deserializeStateFromDoc(s);
  }catch(e){
    fbWarn('Load failed', { uid: uid, error: e });
    return null;
  }
};
window._fbWatch=async(uid,cb)=>{
  if(!FB_READY||!db)return;
  if(_unsubSnapshot){_unsubSnapshot();}
  fbInfo('Attaching Firestore watcher', { uid: uid });
  _unsubSnapshot=onSnapshot(doc(db,'users',uid),(s)=>{
    if(!s.exists()) return;
    const parsed=deserializeStateFromDoc(s);
    if(parsed) cb(parsed);
  });
};

if(FB_READY){
  onAuthStateChanged(auth,(user)=>{
    if(user)window._handleSignIn(user);
    else window._handleSignOut();
  });
}else{
  // Demo mode when Firebase not configured
  fbWarn('Firebase not configured, falling back to demo mode');
  setTimeout(()=>window._handleSignOut(),100);
}

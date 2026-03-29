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
let APP_STATE = {
  progress: {},   // { "dsa:Arrays â€” Basics": true }
  xp: 0,
  level: 1
};

let CURRENT_USER = null;

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
    await setDoc(doc(db,'users',uid),{data:JSON.stringify(data),ts:Date.now()},{merge:true});
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
    return s.exists()?safeParse(s.data().data):null;
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
    const parsed=safeParse(s.data().data);
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

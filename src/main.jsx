import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { addDoc, collection, doc, increment, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, db, provider } from './firebase';
import './styles.css';

function App() {
  const [draft, setDraft] = useState(''); const [posts, setPosts] = useState([]); const [user, setUser] = useState(null); const [notice, setNotice] = useState('');
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => onSnapshot(query(collection(db, 'chirps'), orderBy('createdAt', 'desc')), snap => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => setNotice('Add your Firebase settings to load the live feed.')), []);
  const login = async () => { try { await signInWithPopup(auth, provider); } catch { setNotice('Enable Google sign-in in Firebase Authentication first.'); } };
  const post = async () => { if (!draft.trim()) return; if (!user) return login(); await addDoc(collection(db, 'chirps'), { text: draft.trim(), author: user.displayName || 'Jamal Ferguson', handle: user.email?.split('@')[0] || 'member', uid: user.uid, likes: 0, createdAt: serverTimestamp() }); setDraft(''); };
  const like = (id) => updateDoc(doc(db, 'chirps', id), { likes: increment(1) });
  return <div className="layout"><aside><b className="logo">◉</b><a className="active">⌂ <span>Home</span></a><a>⌕ <span>Explore</span></a><a>♧ <span>Notifications</span></a><a>✉ <span>Messages</span></a><a>▣ <span>Bookmarks</span></a><a>♙ <span>Profile</span></a><button onClick={post}>Chirp</button><div className="me"><div className="avatar">{user?.displayName?.[0] || 'J'}</div><span>{user?.displayName || 'Jamal'}<br/><small>{user ? 'Signed in' : 'Sign in to post'}</small></span></div></aside><main><header>Home <button className="login" onClick={user ? () => signOut(auth) : login}>{user ? 'Sign out' : 'Sign in with Google'}</button></header>{notice && <p className="notice">{notice}</p>}<section className="composer"><div className="avatar">{user?.displayName?.[0] || 'J'}</div><div><textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder={user ? 'What’s happening?' : 'Sign in to share a chirp'}/><div><span>◉ ◫ ☺</span><button onClick={post}>Chirp</button></div></div></section>{posts.map(p => <article key={p.id}><div className="avatar alt">{p.author?.[0]}</div><div><b>{p.author}</b> <small>@{p.handle} · live</small><p>{p.text}</p><footer><button onClick={() => like(p.id)}>♡ {p.likes || 0}</button><span>↻ Reply</span><span>♧ Save</span><span>↗ Share</span></footer></div></article>)}</main><section className="right"><input placeholder="Search Chirp"/><div><h3>What’s happening</h3><p><b>Trending</b><br/>#OuterBanks</p><p><b>Technology</b><br/>Firebase + React</p></div><div><h3>What this proves</h3><p>Google Authentication, Firestore reads/writes, live updates, and likes.</p></div></section></div>;
}
createRoot(document.getElementById('root')).render(<App/>);

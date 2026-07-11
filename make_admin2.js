const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

async function test() {
  try {
    const cred = await signInWithEmailAndPassword(auth, 'masteradmin@movecms.com', 'casabranca');
    console.log('Logged in as', cred.user.uid);
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: 'Master Admin',
      role: 'admin',
      email: 'masteradmin@movecms.com',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Master+Admin',
      active: true,
      cpf: '',
      cnh: ''
    });
    console.log('Made admin');
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}
test();

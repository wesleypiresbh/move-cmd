const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

async function test() {
  try {
    await signInWithEmailAndPassword(auth, 'masteradmin@movecms.com', 'casabranca');
    const ridesSnap = await getDocs(collection(db, 'rides'));
    console.log(`Found ${ridesSnap.docs.length} rides`);
    ridesSnap.forEach(d => {
      console.log(d.id, d.data());
    });
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}
test();

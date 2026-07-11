const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

async function test() {
  try {
    let uid;
    try {
      const cred = await createUserWithEmailAndPassword(auth, 'testdriver2@movecms.com', '123456');
      uid = cred.user.uid;
    } catch(err) {
      if (err.code === 'auth/email-already-in-use') {
         await signInWithEmailAndPassword(auth, 'testdriver2@movecms.com', '123456');
         uid = auth.currentUser.uid;
      } else throw err;
    }
    
    await signInWithEmailAndPassword(auth, 'masteradmin@movecms.com', 'casabranca');
    await setDoc(doc(db, 'users', uid), {
      name: 'Test Driver',
      email: 'testdriver2@movecms.com',
      role: 'driver',
      phone: '1111',
      cnh: '2222',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      avatar: 'x',
      rating: 5,
      ridesCompleted: 0
    });
    console.log('Driver created');
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
test();

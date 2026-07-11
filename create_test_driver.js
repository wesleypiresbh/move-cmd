const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

async function test() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, 'testdriver@movecms.com', '123456');
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: 'Test Driver',
      email: 'testdriver@movecms.com',
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
    if (err.code === 'auth/email-already-in-use') {
       console.log('Already exists');
    } else {
       console.error(err);
    }
  }
  process.exit(0);
}
test();

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

async function test() {
  try {
    // using the uid from earlier
    const uid = 'QNcLhYVzueYYiZlZfZSlb9Mta2E2'; 
    await setDoc(doc(db, 'users', uid), {
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

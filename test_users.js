const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: 'ai-studio-movecmd-26b3887b-c458-4210-90bc-771c5de16dea',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}
run();

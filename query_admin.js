const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'ai-studio-movecmd-26b3887b-c458-4210-90bc-771c5de16dea',
});

const db = admin.firestore();

async function run() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}
run();

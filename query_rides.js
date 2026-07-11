const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  projectId: 'ai-studio-movecmd-26b3887b-c458-4210-90bc-771c5de16dea',
});

const db = getFirestore();

async function run() {
  const snapshot = await db.collection('rides').get();
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}
run();

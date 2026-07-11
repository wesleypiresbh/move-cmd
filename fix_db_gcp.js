const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const app = initializeApp({ projectId: 'ai-studio-movecmd' });
const db = getFirestore(app);
db.settings({ databaseId: 'ai-studio-movecmd-26b3887b-c458-4210-90bc-771c5de16dea' });

(async () => {
  try {
    const docRef = db.doc('users/EbUNVL9rLPUg8HNALQzmAGQgp6G2');
    await docRef.update({ role: 'admin', active: true });
    console.log('Successfully updated role to admin');
  } catch(e) { console.error(e); }
})();

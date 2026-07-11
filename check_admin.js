const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-movecmd-26b3887b-c458-4210-90bc-771c5de16dea' });

(async () => {
  try {
    const doc = await db.collection('users').doc('EbUNVL9rLPUg8HNALQzmAGQgp6G2').get();
    console.log(doc.data());
  } catch(e) { console.error(e); }
})();

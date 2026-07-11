const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-movecmd-26b3887b-c458-4210-90bc-771c5de16dea' });

(async () => {
  try {
    const user = await admin.auth().getUserByEmail('testdriver2@movecms.com');
    await db.collection('users').doc(user.uid).set({
      name: 'Test Driver 2',
      email: 'testdriver2@movecms.com',
      role: 'driver',
      rating: 5,
      active: true
    });
    console.log('Fixed testdriver2');
  } catch(e) { console.error(e); }
})();

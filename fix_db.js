const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-movecmd-26b3887b-c458-4210-90bc-771c5de16dea' });

(async () => {
  try {
    const docRef = db.collection('users').doc('EbUNVL9rLPUg8HNALQzmAGQgp6G2');
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('User exists. Current role:', doc.data().role);
      await docRef.update({ role: 'admin', active: true });
      console.log('Role updated to admin');
    } else {
      console.log('User not found in DB');
      await docRef.set({
        name: 'Wesley Pires',
        email: 'wesleypiresbh@gmail.com',
        role: 'admin',
        active: true,
        rating: 5,
        avatar: 'https://ui-avatars.com/api/?name=Wesley+Pires'
      });
      console.log('Created admin user');
    }
  } catch(e) { console.error(e); }
})();

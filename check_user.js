const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

(async () => {
  const user = await admin.auth().getUserByEmail('testdriver2@movecms.com');
  console.log('User uid:', user.uid);
  const doc = await db.collection('users').doc(user.uid).get();
  console.log('Doc exists?', doc.exists);
  if (doc.exists) console.log('Doc data:', doc.data());
})();

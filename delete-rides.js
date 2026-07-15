import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const configStr = readFileSync('firebase-applet-config.json', 'utf8');
const config = JSON.parse(configStr);
const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, config.firestoreDatabaseId);

async function main() {
  const ridesRef = collection(db, 'rides');
  const snapshot = await getDocs(ridesRef);
  let count = 0;
  for (const document of snapshot.docs) {
    console.log("Deleting ride:", document.id, document.data().status);
    await deleteDoc(doc(db, 'rides', document.id));
    count++;
  }
  console.log(`Deleted ${count} rides`);
  process.exit(0);
}
main().catch(console.error);

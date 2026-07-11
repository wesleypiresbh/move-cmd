const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  projectId: 'ai-studio-movecmd-26b3887b-c458-4210-90bc-771c5de16dea',
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'fake-api-key', // Wait we need the real api key
};
